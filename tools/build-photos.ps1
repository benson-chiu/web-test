<#
  build-photos.ps1
  ==================================================================
  將原始相片批次壓縮成網頁用的兩種尺寸，並產生 photos.js 清單。
  輸出結構對應「方案 A：自架於自己的 Apache 主機」。

  輸出（$Dist）：
    photos.js              ← 複製到網站根目錄（與 throwback.html 同層）
    photos\                ← 整個資料夾用 FTP 上傳到網站根目錄
      .htaccess            ← 長期快取設定，讓回訪賓客不再重新下載
      donggang\
        thumbs\dg0001.webp ...
        full\dg0001.webp ...
      tainan\
        thumbs\tn0001.webp ...
        full\tn0001.webp ...

  用法：
    .\tools\build-photos.ps1 -Source D:\wedding-source -Dist D:\wedding-dist

  來源目錄底下請以分組建立子資料夾，名稱需對應下方 $GroupMeta 的鍵：
    D:\wedding-source\donggang\*.jpg
    D:\wedding-source\tainan\*.jpg

  中斷後可直接重跑，已處理過的會跳過（要全部重做請加 -Force）。
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $Source,
    [Parameter(Mandatory = $true)] [string] $Dist,

    # 相片在網站上的根路徑（相對於 throwback.html）
    [string] $WebRoot      = 'photos',

    [int]    $FullSize     = 2048,
    [int]    $FullQuality  = 80,
    [int]    $ThumbSize    = 400,
    [int]    $ThumbQuality = 75,
    [switch] $Force
)

$ErrorActionPreference = 'Stop'

# ---------- 分組設定 ----------
# Prefix 會成為檔名前綴，一旦上線就不要再改，否則既有網址會失效。
$GroupMeta = @{
    'donggang' = @{ Title = '東港場'; Date = '2026.10.25'; Venue = '福灣莊園'; Prefix = 'dg' }
    'tainan'   = @{ Title = '台南場'; Date = '2026.10.26'; Venue = '雅悅會館'; Prefix = 'tn' }
}

# ---------- 找出 ffmpeg / ffprobe ----------
# 已開啟的終端機可能還是舊的 PATH，從登錄檔重新載入一次
$env:Path = [Environment]::GetEnvironmentVariable('Path', 'Machine') + ';' +
            [Environment]::GetEnvironmentVariable('Path', 'User')

foreach ($exe in @('ffmpeg', 'ffprobe')) {
    if (-not (Get-Command $exe -ErrorAction SilentlyContinue)) {
        throw "找不到 $exe。請先安裝 ffmpeg，或重新開一個終端機讓 PATH 生效。"
    }
}

if (-not (Test-Path -LiteralPath $Source)) { throw "來源目錄不存在：$Source" }

$photosRoot = Join-Path $Dist $WebRoot
$null = New-Item -ItemType Directory -Path $photosRoot -Force

$groupDirs = Get-ChildItem -LiteralPath $Source -Directory | Sort-Object Name
if (-not $groupDirs) { throw "在 $Source 底下找不到任何分組子資料夾。" }

$version   = Get-Date -Format 'yyyyMMddHHmm'
$exts      = @('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
$groupsOut = New-Object System.Collections.ArrayList
$failed    = New-Object System.Collections.ArrayList
$warnings  = New-Object System.Collections.ArrayList
$srcBytes  = 0L
$okCount   = 0

function Invoke-Ffmpeg {
    param([string]$In, [string]$Out, [int]$Box, [int]$Quality)
    $filter = "scale=w=${Box}:h=${Box}:force_original_aspect_ratio=decrease"
    & ffmpeg -hide_banner -loglevel error -y -i $In -vf $filter `
             -c:v libwebp -quality $Quality -compression_level 6 $Out 2>&1 | Out-Null
    return ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $Out))
}

function Get-ImageSize {
    param([string]$Path)
    $csv = & ffprobe -v error -select_streams v:0 `
                     -show_entries stream=width,height -of csv=p=0:s=x $Path 2>&1
    if ($LASTEXITCODE -ne 0) { return $null }
    $parts = ("$csv".Trim() -split 'x')
    if ($parts.Count -lt 2) { return $null }
    return @{ W = [int]$parts[0]; H = [int]$parts[1] }
}

foreach ($g in $groupDirs) {
    $groupId = $g.Name
    $meta    = $GroupMeta[$groupId]

    if (-not $meta) {
        $null = $warnings.Add("分組 '$groupId' 不在 `$GroupMeta 設定中，已使用預設值。")
    }

    $prefix = if ($meta -and $meta.Prefix) { $meta.Prefix }
              elseif ($groupId.Length -ge 2) { $groupId.Substring(0, 2).ToLower() }
              else { $groupId.ToLower() }

    $groupRoot = Join-Path $photosRoot $groupId
    $fullDir   = Join-Path $groupRoot 'full'
    $thumbDir  = Join-Path $groupRoot 'thumbs'
    $null = New-Item -ItemType Directory -Path $fullDir, $thumbDir -Force

    $files = Get-ChildItem -LiteralPath $g.FullName -File |
             Where-Object { $exts -contains $_.Extension } |
             Sort-Object Name
    if (-not $files) { Write-Host "[略過] $groupId 沒有圖片檔"; continue }

    Write-Host ""
    Write-Host "=== $groupId ($($files.Count) 張) ===" -ForegroundColor Cyan

    $items = New-Object System.Collections.ArrayList
    $i = 0

    foreach ($f in $files) {
        $i++
        $id        = '{0}{1:d4}' -f $prefix, $i
        $fullPath  = Join-Path $fullDir  "$id.webp"
        $thumbPath = Join-Path $thumbDir "$id.webp"
        $srcBytes += $f.Length

        if ((-not $Force) -and (Test-Path -LiteralPath $fullPath) -and (Test-Path -LiteralPath $thumbPath)) {
            $sz = Get-ImageSize $thumbPath
            if ($sz) {
                $null = $items.Add([pscustomobject]@{ Id = $id; W = $sz.W; H = $sz.H })
                $okCount++
                continue
            }
        }

        $okFull  = Invoke-Ffmpeg -In $f.FullName -Out $fullPath  -Box $FullSize  -Quality $FullQuality
        $okThumb = Invoke-Ffmpeg -In $f.FullName -Out $thumbPath -Box $ThumbSize -Quality $ThumbQuality

        if (-not ($okFull -and $okThumb)) {
            $null = $failed.Add($f.FullName)
            Write-Host "  [失敗] $($f.Name)" -ForegroundColor Red
            continue
        }

        $sz = Get-ImageSize $thumbPath
        if (-not $sz) {
            $null = $failed.Add($f.FullName)
            Write-Host "  [失敗-讀尺寸] $($f.Name)" -ForegroundColor Red
            continue
        }

        $null = $items.Add([pscustomobject]@{ Id = $id; W = $sz.W; H = $sz.H })
        $okCount++

        if ($i % 25 -eq 0) { Write-Host "  ...已處理 $i / $($files.Count)" }
    }

    $null = $groupsOut.Add([pscustomobject]@{
        Id    = $groupId
        Title = if ($meta) { $meta.Title } else { $groupId }
        Date  = if ($meta) { $meta.Date }  else { '' }
        Venue = if ($meta) { $meta.Venue } else { '' }
        Base  = "$WebRoot/$groupId"
        Root  = $groupRoot
        Items = $items
    })
}

# ---------- 產生 photos\.htaccess ----------
# 相片內容不會變動（要換圖就換檔名或改 PHOTO_VERSION），所以可以長期快取。
# 全部用 <IfModule> 包起來：萬一主機沒載入該模組，也不會讓 Apache 回 500。
$htaccess = @"
# 相片快取設定（由 tools/build-photos.ps1 產生）
# 相片為不變內容，網址帶有 ?v= 版本號，換圖時改版本號即可讓瀏覽器重抓。

<IfModule mod_headers.c>
    Header set Cache-Control "public, max-age=31536000, immutable"
</IfModule>

<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/webp "access plus 1 year"
</IfModule>

# 確保 .webp 回傳正確的 MIME type（部分舊主機預設沒有）
<IfModule mod_mime.c>
    AddType image/webp .webp
</IfModule>

# 不讓搜尋引擎收錄賓客的相片
<IfModule mod_headers.c>
    Header set X-Robots-Tag "noindex"
</IfModule>

# 關閉目錄瀏覽，避免有人直接列出整個相簿
Options -Indexes
"@
[System.IO.File]::WriteAllText((Join-Path $photosRoot '.htaccess'), $htaccess,
    (New-Object System.Text.UTF8Encoding $false))

# ---------- 產生 photos.js ----------
# 寫在 $Dist 根目錄（photos 資料夾之外），因為它要放到網站根目錄。
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('// 本檔由 tools/build-photos.ps1 自動產生，請勿手動編輯。')
[void]$sb.AppendLine("// 產生時間：$(Get-Date -Format 'yyyy-MM-dd HH:mm')")
[void]$sb.AppendLine('')
[void]$sb.AppendLine('// 換掉同檔名的相片時，改這個版本號就能讓瀏覽器重新抓圖')
[void]$sb.AppendLine("const PHOTO_VERSION = '$version';")
[void]$sb.AppendLine('')
[void]$sb.AppendLine('// 每筆為 [id, 縮圖寬, 縮圖高]；寬高用於燈箱預留版面，避免畫面跳動')
[void]$sb.AppendLine('const PHOTO_GROUPS = [')
foreach ($grp in $groupsOut) {
    [void]$sb.AppendLine('  {')
    [void]$sb.AppendLine("    id: '$($grp.Id)',")
    [void]$sb.AppendLine("    title: '$($grp.Title)',")
    [void]$sb.AppendLine("    date: '$($grp.Date)',")
    [void]$sb.AppendLine("    venue: '$($grp.Venue)',")
    [void]$sb.AppendLine("    base: '$($grp.Base)',")
    [void]$sb.AppendLine('    photos: [')
    foreach ($it in $grp.Items) {
        [void]$sb.AppendLine("      ['$($it.Id)',$($it.W),$($it.H)],")
    }
    [void]$sb.AppendLine('    ],')
    [void]$sb.AppendLine('  },')
}
[void]$sb.AppendLine('];')

$photosJs = Join-Path $Dist 'photos.js'
[System.IO.File]::WriteAllText($photosJs, $sb.ToString(), (New-Object System.Text.UTF8Encoding $false))

# ---------- 統計 ----------
$allFiles   = Get-ChildItem -LiteralPath $photosRoot -Recurse -File
$totalBytes = ($allFiles | Measure-Object Length -Sum).Sum

Write-Host ""
Write-Host "================ 完成 ================" -ForegroundColor Green
Write-Host ("成功 {0} 張，失敗 {1} 張" -f $okCount, $failed.Count)
Write-Host ""

foreach ($grp in $groupsOut) {
    $gFiles = Get-ChildItem -LiteralPath $grp.Root -Recurse -File
    $gBytes = ($gFiles | Measure-Object Length -Sum).Sum
    Write-Host ("  [{0}] {1}  {2} 張 / {3} 檔 / {4:N1} MB  ->  網頁路徑 {5}/" -f `
        $grp.Id, $grp.Title, $grp.Items.Count, $gFiles.Count, ($gBytes / 1MB), $grp.Base)
}

Write-Host ""
Write-Host ("來源合計 {0,8:N1} MB  平均 {1,6:N0} KB/張" -f ($srcBytes / 1MB), $(if ($okCount) { ($srcBytes / 1KB) / $okCount } else { 0 }))
Write-Host ("輸出合計 {0,8:N1} MB  （為來源的 {1:N1}%）" -f ($totalBytes / 1MB), $(if ($srcBytes) { $totalBytes / $srcBytes * 100 } else { 0 }))
Write-Host ("檔案合計 {0,8} 個  （含 .htaccess）" -f $allFiles.Count)

# 容量與流量對照（主機限制 5 GB / 25 GB）
$quotaGB = 5
Write-Host ""
Write-Host ("主機容量佔用：{0:N0} MB / {1} GB = {2:N1}%" -f ($totalBytes / 1MB), $quotaGB, ($totalBytes / 1GB / $quotaGB * 100))

Write-Host ""
Write-Host "接下來：" -ForegroundColor Yellow
Write-Host ("  1. 用 FTP 把整個 {0} 資料夾上傳到網站根目錄" -f $photosRoot)
Write-Host ("     （記得一併上傳裡面的 .htaccess，FTP 軟體預設常隱藏點開頭的檔案）")
Write-Host ("  2. 把 {0} 複製到網站根目錄，與 throwback.html 同層" -f $photosJs)

if ($warnings.Count -gt 0) {
    Write-Host ""
    Write-Host "注意事項：" -ForegroundColor Yellow
    $warnings | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
}

if ($failed.Count -gt 0) {
    Write-Host ""
    Write-Host "以下檔案處理失敗：" -ForegroundColor Red
    $failed | ForEach-Object { Write-Host "  $_" }
}

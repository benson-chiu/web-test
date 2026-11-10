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

    # 編號對照表：記錄「原始檔名 -> 編號」，確保日後補照片時既有編號不變。
    # 這個檔案很重要，請一併納入版控、不要刪除。
    [string] $IdMap        = (Join-Path $PSScriptRoot 'photo-ids.json'),

    [int]    $FullSize     = 2048,
    [int]    $FullQuality  = 80,
    [int]    $ThumbSize    = 400,
    [int]    $ThumbQuality = 75,
    [switch] $Force,

    # 強制換新的 PHOTO_VERSION。平常不需要 —— 腳本會在「真的有照片
    # 重新編碼」時自動換。詳見下方關於版本號的說明。
    [switch] $BumpVersion
)

$ErrorActionPreference = 'Stop'

# ---------- 分組設定 ----------
# Prefix 會成為檔名前綴，一旦上線就不要再改，否則既有網址會失效。
$GroupMeta = @{
    'donggang' = @{ Title = '東港婚宴'; Date = '2026.10.25'; Venue = '福灣莊園'; Prefix = 'dg' }
    'tainan'   = @{ Title = '台南歸寧宴'; Date = '2026.10.26'; Venue = '台南遠東香格里拉飯店'; Prefix = 'tn' }
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

# ---------- 載入編號對照表 ----------
# 編號一旦指派就固定下來，不隨檔名排序位置改變。
# 少了這張表，日後插入一張排序在前的照片會讓後面所有編號位移，
# 而既有的 .webp 檔名不變 —— 清單與實際圖片就會錯位。
$idMapData = @{}
if (Test-Path -LiteralPath $IdMap) {
    try {
        $raw = [System.IO.File]::ReadAllText($IdMap, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
        foreach ($grpProp in $raw.PSObject.Properties) {
            $inner = @{}
            foreach ($fileProp in $grpProp.Value.PSObject.Properties) {
                $inner[$fileProp.Name] = @{
                    n   = [int]$fileProp.Value.n
                    sig = [string]$fileProp.Value.sig
                }
            }
            $idMapData[$grpProp.Name] = $inner
        }
        Write-Host "已載入編號對照表：$IdMap" -ForegroundColor DarkGray
    } catch {
        throw "編號對照表讀取失敗（$IdMap）：$($_.Exception.Message)`n請修正或刪除該檔後重試。刪除會導致所有編號重新指派。"
    }
}
$newlyAssigned = 0

# ---------- 讀回現有的版本號 ----------
# PHOTO_VERSION 會出現在「每一張」縮圖與大圖的網址裡（?v=...），
# 所以一換新的，就等於要求所有賓客重新下載全部 1,518 張縮圖和看過的大圖。
# 以前每次執行都無條件換新的，代表「只刪掉幾張照片」也會把全站快取清光。
#
# 編號由 photo-ids.json 固定，同一個編號的內容也不會變，
# 因此只有「真的有照片被重新編碼」時才需要換版本號 —— 那才是
# 同一個網址的內容真的不一樣了，非得讓瀏覽器重抓不可。
# 單純刪除照片不需要換，沿用舊版本號可以保住所有賓客的快取。
$existingVersion = $null
$knownSize = @{}   # id -> @{ W; H }，沿用既有縮圖尺寸，避免重複呼叫 ffprobe
foreach ($candidate in @((Join-Path $Dist 'photos.js'),
                         (Join-Path (Split-Path $PSScriptRoot -Parent) 'photos.js'))) {
    if (-not (Test-Path -LiteralPath $candidate)) { continue }
    $txt = [System.IO.File]::ReadAllText($candidate, [System.Text.Encoding]::UTF8)
    $m = [regex]::Match($txt, "PHOTO_VERSION\s*=\s*'([^']+)'")
    if ($m.Success) {
        $existingVersion = $m.Groups[1].Value
        Write-Host "讀到現有版本號 $existingVersion（來自 $candidate）" -ForegroundColor DarkGray

        # 順便把既有的縮圖長寬讀進來。
        # 這些數字原本是靠「每張呼叫一次 ffprobe」取得的，但 ffprobe 執行檔有 217 MB、
        # 每次啟動都被防毒掃描，實測單次約 2 秒 —— 1,500 張就要 50 分鐘，
        # 即使那些照片根本沒變、不需要重新編碼。
        # 縮圖檔沒換，長寬當然也沒變，直接沿用現有 photos.js 裡的值即可。
        foreach ($e in [regex]::Matches($txt, "\['([^']+)',(\d+),(\d+)\]")) {
            $knownSize[$e.Groups[1].Value] = @{
                W = [int]$e.Groups[2].Value
                H = [int]$e.Groups[3].Value
            }
        }
        Write-Host "  沿用其中 $($knownSize.Count) 筆縮圖尺寸，省去逐張呼叫 ffprobe" -ForegroundColor DarkGray
        break
    }
}

$reEncoded = 0   # 本次實際重新編碼了幾張（決定要不要換版本號）
$skipped   = 0   # 本次跳過幾張（內容沒變）
$exts      = @('.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG')
$groupsOut = New-Object System.Collections.ArrayList
$failed    = New-Object System.Collections.ArrayList
$warnings  = New-Object System.Collections.ArrayList
$srcBytes  = 0L
$okCount   = 0

# 一次 ffmpeg 呼叫同時產出大圖與縮圖。
# 用 split 濾鏡把解碼後的畫面複製成兩路，各自縮放後輸出，
# 來源只解碼一次、ffmpeg 只啟動一次。
# 實測比分兩次呼叫快約一半（3.1 秒 vs 6.4 秒／張），輸出大小完全相同 ——
# 省下的主要是程序啟動成本（ffmpeg.exe 有 217 MB，每次啟動都會被防毒掃描）。
function Invoke-FfmpegBoth {
    param([string]$In, [string]$FullOut, [string]$ThumbOut)

    $fc = "[0:v]split=2[a][b];" +
          "[a]scale=w=${FullSize}:h=${FullSize}:force_original_aspect_ratio=decrease[f];" +
          "[b]scale=w=${ThumbSize}:h=${ThumbSize}:force_original_aspect_ratio=decrease[t]"

    & ffmpeg -hide_banner -loglevel error -y -i $In -filter_complex $fc `
             -map "[f]" -c:v libwebp -quality $FullQuality  -compression_level 6 $FullOut `
             -map "[t]" -c:v libwebp -quality $ThumbQuality -compression_level 6 $ThumbOut 2>&1 | Out-Null

    return ($LASTEXITCODE -eq 0 -and
            (Test-Path -LiteralPath $FullOut) -and
            (Test-Path -LiteralPath $ThumbOut))
}

# 來源檔的內容指紋，用來判斷照片是否被換掉。
# 不用修改時間判斷 —— 複製檔案通常會保留原始時間戳，
# 從相機或攝影師拿到的檔案時間甚至可能早於上次建置，會被誤判為沒變。
function Get-FileSig {
    param([System.IO.FileInfo]$File)
    $h = (Get-FileHash -LiteralPath $File.FullName -Algorithm SHA1).Hash
    return "$($File.Length)-$($h.Substring(0, 16))"
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

    # 取出本分組的編號對照，並找出目前用到的最大編號
    if (-not $idMapData.ContainsKey($groupId)) { $idMapData[$groupId] = @{} }
    $groupMap = $idMapData[$groupId]
    $maxNum = 0
    foreach ($e in $groupMap.Values) { if ($e.n -gt $maxNum) { $maxNum = $e.n } }

    foreach ($f in $files) {
        $i++
        $sig = Get-FileSig -File $f

        # 已登記過的檔案沿用原編號；新檔案接在最大編號之後。
        # 陣列順序仍依檔名排序（維持拍攝時序），編號只是穩定的識別碼。
        if ($groupMap.ContainsKey($f.Name)) {
            $num     = $groupMap[$f.Name].n
            $sigSame = ($groupMap[$f.Name].sig -eq $sig)
            $groupMap[$f.Name].sig = $sig
        } else {
            $maxNum++
            $num     = $maxNum
            $sigSame = $false
            $groupMap[$f.Name] = @{ n = $num; sig = $sig }
            $newlyAssigned++
        }

        $id        = '{0}{1:d4}' -f $prefix, $num
        $fullPath  = Join-Path $fullDir  "$id.webp"
        $thumbPath = Join-Path $thumbDir "$id.webp"
        $srcBytes += $f.Length

        # 續跑：輸出已存在、且來源內容指紋沒變，就跳過不重壓。
        # 指紋一旦不同（照片被換掉）就會自動重新壓縮，不需要加 -Force。
        if ((-not $Force) -and $sigSame -and
            (Test-Path -LiteralPath $fullPath) -and (Test-Path -LiteralPath $thumbPath)) {

            # 長寬優先沿用現有 photos.js 的值，只有查不到才退回 ffprobe。
            # 縮圖檔沒重新產生、長寬自然沒變，不必為此啟動一個 217 MB 的執行檔。
            # （若你改了 -ThumbSize，請一併加 -Force，否則縮圖本來也不會重新產生）
            $sz = $knownSize[$id]
            if (-not $sz) { $sz = Get-ImageSize $thumbPath }

            if ($sz) {
                $null = $items.Add([pscustomobject]@{ Id = $id; W = $sz.W; H = $sz.H })
                $okCount++
                $skipped++
                if ($i % 100 -eq 0) {
                    Write-Host ("  ...已檢查 {0} / {1}（跳過 {2}、重新編碼 {3}）" -f `
                        $i, $files.Count, $skipped, $reEncoded)
                }
                continue
            }
        }

        if (-not (Invoke-FfmpegBoth -In $f.FullName -FullOut $fullPath -ThumbOut $thumbPath)) {
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

        # 走到這裡表示真的跑過 ffmpeg，同一個網址的內容變了 -> 需要換版本號
        $reEncoded++

        $null = $items.Add([pscustomobject]@{ Id = $id; W = $sz.W; H = $sz.H })
        $okCount++

        if ($i % 25 -eq 0) {
            Write-Host ("  ...已檢查 {0} / {1}（跳過 {2}、重新編碼 {3}）" -f `
                $i, $files.Count, $skipped, $reEncoded)
        }
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

# ---------- 決定版本號 ----------
# 必須等處理完才能判斷 —— 要先知道這一輪到底有沒有照片被重新編碼。
if ($BumpVersion) {
    $version       = Get-Date -Format 'yyyyMMddHHmm'
    $versionReason = '你指定了 -BumpVersion'
} elseif ($reEncoded -gt 0) {
    $version       = Get-Date -Format 'yyyyMMddHHmm'
    $versionReason = "有 $reEncoded 張照片重新編碼，同網址內容已變，必須讓瀏覽器重抓"
} elseif (-not $existingVersion) {
    $version       = Get-Date -Format 'yyyyMMddHHmm'
    $versionReason = '找不到現有版本號（首次建置）'
} else {
    $version       = $existingVersion
    $versionReason = '沒有照片內容變動，沿用舊版本號以保住賓客的快取'
}

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

# ---------- 存回編號對照表 ----------
$null = New-Item -ItemType Directory -Path (Split-Path -Path $IdMap -Parent) -Force
[System.IO.File]::WriteAllText($IdMap,
    ($idMapData | ConvertTo-Json -Depth 4),
    (New-Object System.Text.UTF8Encoding $false))

# ---------- 統計 ----------
$allFiles   = Get-ChildItem -LiteralPath $photosRoot -Recurse -File
$totalBytes = ($allFiles | Measure-Object Length -Sum).Sum

Write-Host ""
Write-Host "================ 完成 ================" -ForegroundColor Green
Write-Host ("成功 {0} 張，失敗 {1} 張（其中 {2} 張是本次新增)" -f $okCount, $failed.Count, $newlyAssigned)
Write-Host ("本次重新編碼 {0} 張，跳過 {1} 張（內容未變）" -f $reEncoded, $skipped)
Write-Host ""
if ($version -eq $existingVersion) {
    Write-Host ("PHOTO_VERSION = {0}（未變更）" -f $version) -ForegroundColor Green
    Write-Host ("  原因：{0}" -f $versionReason) -ForegroundColor DarkGray
    Write-Host "  賓客已下載的縮圖與大圖仍然命中快取，不必重新下載。" -ForegroundColor DarkGray
} else {
    Write-Host ("PHOTO_VERSION = {0}（已換新，舊值 {1}）" -f $version,
        $(if ($existingVersion) { $existingVersion } else { '無' })) -ForegroundColor Yellow
    Write-Host ("  原因：{0}" -f $versionReason) -ForegroundColor DarkGray
    Write-Host "  注意：所有相片網址都會改變，賓客會重新下載全部縮圖。" -ForegroundColor Yellow
}
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

# ---------- 孤兒檔案檢查 ----------
# 來源照片被刪掉後，輸出目錄裡的 .webp 不會自動消失。
# 它們不在 photos.js 裡所以網頁看不到，但會白佔主機空間。
# 這裡只列出來，不自動刪除 —— 刪檔的決定留給你。
$orphans = New-Object System.Collections.ArrayList
foreach ($grp in $groupsOut) {
    $validIds = @{}
    foreach ($it in $grp.Items) { $validIds[$it.Id] = $true }
    foreach ($sub in @('full', 'thumbs')) {
        $dir = Join-Path $grp.Root $sub
        if (-not (Test-Path -LiteralPath $dir)) { continue }
        Get-ChildItem -LiteralPath $dir -File -Filter '*.webp' | ForEach-Object {
            if (-not $validIds.ContainsKey($_.BaseName)) {
                $null = $orphans.Add("$($grp.Id)/$sub/$($_.Name)")
            }
        }
    }
}

if ($orphans.Count -gt 0) {
    # 清單一併寫成檔案。照片「下架」時這張清單很重要：
    # photos.js 不再列出它們，網頁上看不到了，但主機上的檔案還在 ——
    # 知道網址的人仍然能直接開啟。要真正下架，必須照這張清單把檔案刪掉。
    $orphanFile = Join-Path $Dist 'orphans.txt'
    $orphanText = @(
        "# 孤兒檔案清單（由 tools/build-photos.ps1 於 $(Get-Date -Format 'yyyy-MM-dd HH:mm') 產生）",
        "#",
        "# 這些檔案的來源相片已經從 Source 移除，photos.js 不再列出它們，",
        "# 網頁上看不到 —— 但主機上的檔案還在，直接開網址仍然看得到。",
        "# 要真正下架，請照這張清單從主機的 photos/ 底下刪除對應檔案。",
        "# 路徑相對於網站的 photos/ 目錄。",
        ""
    ) + $orphans
    [System.IO.File]::WriteAllLines($orphanFile, $orphanText,
        (New-Object System.Text.UTF8Encoding $false))

    Write-Host ""
    Write-Host ("發現 {0} 個孤兒檔案（來源已刪除，輸出還留著）" -f $orphans.Count) -ForegroundColor Yellow
    $orphans | Select-Object -First 10 | ForEach-Object { Write-Host "  $_" -ForegroundColor Yellow }
    if ($orphans.Count -gt 10) {
        Write-Host ("  ...其餘 {0} 個見清單檔" -f ($orphans.Count - 10)) -ForegroundColor Yellow
    }
    Write-Host ("  完整清單：{0}" -f $orphanFile) -ForegroundColor Yellow
    Write-Host "  網頁上已經看不到它們，但檔案還在主機上 ——" -ForegroundColor Yellow
    Write-Host "  知道網址的人仍然能直接開啟。要真正下架請照清單刪除。" -ForegroundColor Yellow
}

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

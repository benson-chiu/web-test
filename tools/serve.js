/*
  serve.js — 本機測試用的極簡靜態伺服器
  ------------------------------------------------------------------
  為什麼不直接用 file:// 開啟 throwback.html：
    1. 「下載照片」會用 fetch + canvas 轉檔，在 file:// 下會被瀏覽器安全限制擋住
    2. file:// 不會回傳 Content-Type，WebP 的 MIME type 無法驗證

  用法（在專案根目錄執行）：
    node tools\serve.js 8080
  然後開 http://localhost:8080/throwback.html
*/
const http = require('http');
const fs   = require('fs');
const path = require('path');

const root = process.cwd();
const port = Number(process.argv[2] || 8080);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.mp3':  'audio/mpeg',
  '.mp4':  'video/mp4',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/throwback.html';

  const file = path.join(root, urlPath);

  // 防止用 ../ 跳出專案目錄
  if (!file.startsWith(root)) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found: ' + urlPath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream',
      // 模擬正式站的 CORS 設定，讓「下載照片」能正常測試
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}).listen(port, () => {
  console.log('本機測試伺服器已啟動');
  console.log('  http://localhost:' + port + '/throwback.html');
});

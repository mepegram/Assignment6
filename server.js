const http = require('http');
const fs = require('fs');
const path = require('path');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.htm':  'text/html; charset=utf-8',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml'
};

// Prevent path traversal like /img/../../secret.txt
function safeJoin(base, target) {
  const targetPath = path.posix.normalize('/' + target.replace(/\\/g, '/'));
  if (targetPath.includes('..')) return null;
  return path.join(base, targetPath);
}

const server = http.createServer((req, res) => {
  console.log(`Request for ${req.url}`);

  let filePath;

  // Map required routes
  if (req.url === '/' || req.url === '/index' || req.url === '/index.html') {
    filePath = 'index.html';
  } else if (
    req.url === '/introduction' ||
    req.url === '/introduction.html'
  ) {
    filePath = 'introduction.html';
  }
  // Serve anything in /img/
  else if (req.url.toLowerCase().startsWith('/img/')) {
    filePath = req.url.slice(1); // remove leading '/'
  } else {
    // Not found
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1>');
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = mime[ext] || 'application/octet-stream';

  const fullPath = safeJoin(__dirname, filePath);
  if (!fullPath) {
    res.writeHead(400, { 'Content-Type': 'text/plain' });
    res.end('Bad request');
    return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) {
      const code = err.code === 'ENOENT' ? 404 : 500;
      res.writeHead(code, { 'Content-Type': 'text/plain' });
      res.end(code === 404 ? 'Not Found' : 'Server Error');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});

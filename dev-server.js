const http = require('http')
const fs = require('fs')
const path = require('path')

const PORT = process.env.PORT || 3000
const ROOT = path.resolve(__dirname)

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.pdf': 'application/pdf'
}

function send(res, status, content, type) {
  res.writeHead(status, { 'Content-Type': type || 'text/plain; charset=utf-8' })
  res.end(content)
}

function safeResolve(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath)).replace(/^\/+/, '')
  return path.join(ROOT, clean)
}

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0]
  if (reqPath === '/') reqPath = 'index.html'

  const filePath = safeResolve(reqPath)
  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(filePath).toLowerCase()
      const type = MIME[ext] || 'application/octet-stream'
      fs.createReadStream(filePath).on('error', () => send(res, 500, 'Internal Server Error'))
        .pipe(res)
      res.writeHead(200, { 'Content-Type': type })
    } else if (!err && stat.isDirectory()) {
      const indexFile = path.join(filePath, 'index.html')
      fs.access(indexFile, fs.constants.R_OK, (ie) => {
        if (!ie) {
          fs.createReadStream(indexFile).on('error', () => send(res, 500, 'Internal Server Error'))
            .pipe(res)
          res.writeHead(200, { 'Content-Type': MIME['.html'] })
        } else {
          send(res, 403, 'Directory listing forbidden')
        }
      })
    } else {
      // Fallback to root index.html for SPA-style routes
      const fallback = path.join(ROOT, 'index.html')
      fs.access(fallback, fs.constants.R_OK, (fe) => {
        if (!fe) {
          fs.createReadStream(fallback).on('error', () => send(res, 500, 'Internal Server Error'))
            .pipe(res)
          res.writeHead(200, { 'Content-Type': MIME['.html'] })
        } else {
          send(res, 404, 'Not Found')
        }
      })
    }
  })
})

server.listen(PORT, () => {
  console.log(`Frontend dev server running at http://localhost:${PORT}/`)
})

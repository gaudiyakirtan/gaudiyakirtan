// Dependency-free static server for the live bench UI. `node serve.mjs` then open the printed URL.
// Serves the lab root so the page can import ../src/*.mjs and fetch data/gen/*.json directly -
// the browser runs the exact same engine code the CLI benchmarks, with no build step in between.
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import url from 'node:url'

const ROOT = path.dirname(url.fileURLToPath(import.meta.url))
const PORT = Number(process.env.PORT ?? 8710)
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
}

http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split('?')[0])
  if (rel === '/') rel = '/web/index.html'
  const file = path.join(ROOT, path.normalize(rel).replace(/^(\.\.[/\\])+/, ''))
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404, { 'content-type': 'text/plain' })
    return res.end('not found')
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}).listen(PORT, () => {
  console.log(`search-lab → http://localhost:${PORT}`)
})

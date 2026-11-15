import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import chatHandler from './api/chat.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 10000;
const HOST = '0.0.0.0';
const MAX_BODY = 64 * 1024;
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon',
  '.woff': 'font/woff', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8'
};

function json(res, status, data) {
  const body = JSON.stringify(data);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(body);
}

async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw Object.assign(new Error('Request body is too large.'), { statusCode: 413 });
    chunks.push(chunk);
  }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
  catch { throw Object.assign(new Error('Invalid JSON body.'), { statusCode: 400 }); }
}

async function handleChat(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  try {
    req.body = await readBody(req);
  } catch (error) {
    return json(res, error.statusCode || 400, { error: error.message });
  }
  let statusCode = 200;
  const responseAdapter = {
    status(code) { statusCode = code; return this; },
    json(payload) { return json(res, statusCode, payload); }
  };
  try {
    await chatHandler(req, responseAdapter);
  } catch (error) {
    console.error('AI chat handler failed:', error);
    if (!res.headersSent) json(res, 500, { error: 'The AI service is temporarily unavailable.' });
  }
}

function serveApp(req, res) {
  const index = path.join(DIST, 'index.html');
  if (!fs.existsSync(index)) return json(res, 503, { error: 'Production build is missing. Run npm run build.' });

  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname); }
  catch { return json(res, 400, { error: 'Invalid URL.' }); }

  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const candidate = path.resolve(DIST, relative);
  if (candidate !== DIST && !candidate.startsWith(`${DIST}${path.sep}`)) {
    return json(res, 400, { error: 'Invalid path.' });
  }
  const file = fs.existsSync(candidate) && fs.statSync(candidate).isFile() ? candidate : index;
  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': path.basename(file) === 'index.html' ? 'no-cache' : 'public, max-age=3600'
  });
  if (req.method === 'HEAD') return res.end();
  fs.createReadStream(file).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  if (pathname === '/healthz') return json(res, 200, { status: 'ok', service: 'TOMORROWPROOF' });
  if (pathname === '/api/chat') return handleChat(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.setHeader('Allow', 'GET, HEAD, POST');
    return json(res, 405, { error: 'Method not allowed' });
  }
  return serveApp(req, res);
});

server.requestTimeout = 60000;
server.headersTimeout = 65000;
server.listen(PORT, HOST, () => console.log(`TOMORROWPROOF listening on ${HOST}:${PORT}`));

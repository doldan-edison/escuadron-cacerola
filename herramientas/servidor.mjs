// Vista previa en la PC. Hace falta porque el juego ahora carga módulos de JavaScript (js/*.js) y el servidor
// simple de Python en Windows los entrega como texto, y el navegador los rechaza.
// Uso:  node herramientas/servidor.mjs [puerto]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tipos = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon',
};
const puerto = Number(process.argv[2]) || 8378;

http.createServer((req, res) => {
  let ruta;
  try { ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
  let archivo = path.join(raiz, ruta);
  if (archivo !== raiz && !archivo.startsWith(raiz + path.sep)) { res.writeHead(403).end(); return; }
  let st = fs.existsSync(archivo) ? fs.statSync(archivo) : null;
  if (st && st.isDirectory()) { archivo = path.join(archivo, 'index.html'); st = fs.existsSync(archivo) ? fs.statSync(archivo) : null; }
  if (!st || !st.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('No encontrado'); return; }
  res.writeHead(200, { 'Content-Type': tipos[path.extname(archivo).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  fs.createReadStream(archivo).pipe(res);
}).listen(puerto, '127.0.0.1', () => console.log(`Juego en http://127.0.0.1:${puerto}/`));

// Quita el fondo liso (magenta) de una imagen generada y la deja recortada en WebP con transparencia.
// Uso: node herramientas/recortar.mjs <entrada.jpg> <salida.webp> [ancho en px, por defecto 720]
import path from 'node:path';
import { FF, FP, run, quitarFondo } from './fondo.mjs';

const [, , entrada, salida, anchoArg] = process.argv;
if (!entrada || !salida) { console.error('Uso: node recortar.mjs <entrada> <salida.webp> [ancho]'); process.exit(1); }
const ancho = Number(anchoArg) || 720;

const [W, H] = String(run(FP, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', entrada])).trim().split(',').map(Number);
const px = run(FF, ['-v', 'error', '-i', entrada, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
let { x0, y0, x1, y1, fondo } = quitarFondo(px, W, H);

const m = 6; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m);
const cw = x1 - x0 + 1, ch = y1 - y0 + 1, rec = Buffer.alloc(cw * ch * 4);
for (let y = 0; y < ch; y++) px.copy(rec, y * cw * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x0 + cw) * 4);

const salAncho = Math.min(ancho, cw);
run(FF, ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${cw}x${ch}`, '-i', '-', '-vf', `scale=${salAncho}:-2:flags=lanczos`, '-c:v', 'libwebp', '-q:v', '88', salida], rec);
const tocaBorde = x0 === 0 || y0 === 0 || x1 === W - 1 || y1 === H - 1;
console.log(`${path.basename(salida)}: fondo rgb(${fondo.join(',')}), recorte ${cw}x${ch} (${Math.round(100 * cw * ch / (W * H))}% del cuadro), salida ${salAncho}px de ancho, toca borde: ${tocaBorde ? 'SI' : 'no'}`);

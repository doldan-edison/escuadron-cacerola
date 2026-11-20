// Convierte un video de un personaje sobre fondo liso (magenta) en una hoja de cuadros WebP con transparencia.
// Busca sola el tramo que mejor cierra en bucle, toma N cuadros parejos, les quita el fondo y los acomoda en una grilla.
// Uso: node herramientas/hoja-animacion.mjs <video.mp4> <salida.webp> [cuadros=12] [alto de cada cuadro=380] [columnas=4] [duración máxima del bucle en s=3.2]
import path from 'node:path';
import { FF, FP, run, quitarFondo } from './fondo.mjs';

const [, , video, salida, nArg, altoArg, colsArg, maxArg] = process.argv;
if (!video || !salida) { console.error('Uso: node hoja-animacion.mjs <video> <salida.webp> [cuadros] [alto] [columnas]'); process.exit(1); }
const N = Number(nArg) || 12, ALTO = Number(altoArg) || 380, COLS = Number(colsArg) || 4, MAXSEG = Number(maxArg) || 3.2;

const info = String(run(FP, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'csv=p=0', video])).trim().split(',');
const W = Number(info[0]), H = Number(info[1]), [fa, fb] = info[2].split('/').map(Number), FPS = fa / (fb || 1);

// 1) firmas chicas de todos los cuadros para encontrar el bucle
const SW = 96, SH = 54, chico = run(FF, ['-v', 'error', '-i', video, '-vf', `scale=${SW}:${SH}`, '-f', 'rawvideo', '-pix_fmt', 'gray', '-']);
const total = Math.floor(chico.length / (SW * SH));
const dif = (a, b) => { let s = 0; const oa = a * SW * SH, ob = b * SW * SH; for (let i = 0; i < SW * SH; i++) s += Math.abs(chico[oa + i] - chico[ob + i]); return s / (SW * SH); };
let mejor = null;
const minLargo = Math.round(FPS * .6), maxLargo = Math.min(total - 3, Math.round(FPS * MAXSEG));
for (let a = 2; a < total - minLargo - 1; a++)
  for (let b = a + minLargo; b <= Math.min(total - 2, a + maxLargo); b++) {
    // que el cuadro b se parezca al a, y el siguiente de cada uno también (misma dirección de movimiento)
    const costo = dif(a, b) + dif(a + 1, b + 1) * .7 - (b - a) * .004;
    if (!mejor || costo < mejor.costo) mejor = { a, b, costo, cierre: dif(a, b) };
  }
const { a, b } = mejor, largo = b - a;
const movimiento = dif(a, a + Math.round(largo / 2));

// 2) cuadros elegidos a tamaño completo, sin fondo
const idx = Array.from({ length: N }, (_, k) => a + Math.round(k * largo / N));
const sel = idx.map(i => `eq(n\\,${i})`).join('+');
const crudo = run(FF, ['-v', 'error', '-i', video, '-vf', `select='${sel}'`, '-fps_mode', 'passthrough', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-']);
const tam = W * H * 4, cuadros = [];
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let k = 0; k < N; k++) {
  const px = Buffer.from(crudo.subarray(k * tam, (k + 1) * tam));
  const c = quitarFondo(px, W, H, 60); // el video comprime el color: tolerancia mayor para los huecos de fondo encerrados
  x0 = Math.min(x0, c.x0); y0 = Math.min(y0, c.y0); x1 = Math.max(x1, c.x1); y1 = Math.max(y1, c.y1);
  cuadros.push(px);
}
const tocaBorde = x0 <= 0 || y0 <= 0 || x1 >= W - 1 || y1 >= H - 1;
const m = 8; x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m); x1 = Math.min(W - 1, x1 + m); y1 = Math.min(H - 1, y1 + m);
const cw = x1 - x0 + 1, ch = y1 - y0 + 1;

// 3) grilla: todos los cuadros con el mismo recorte para que el personaje no salte
const filas = Math.ceil(N / COLS), hoja = Buffer.alloc(cw * COLS * ch * filas * 4);
cuadros.forEach((px, k) => {
  const gx = (k % COLS) * cw, gy = Math.floor(k / COLS) * ch;
  for (let y = 0; y < ch; y++) px.copy(hoja, ((gy + y) * cw * COLS + gx) * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x0 + cw) * 4);
});
const th = Math.min(ALTO, ch), tw = Math.round(cw * th / ch);
run(FF, ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${cw * COLS}x${ch * filas}`, '-i', '-', '-vf', `scale=${tw * COLS}:${th * filas}:flags=lanczos`, '-c:v', 'libwebp', '-q:v', '86', salida], hoja);

const fpsJuego = +(N / (largo / FPS)).toFixed(2);
console.log(`${path.basename(salida)}: video ${W}x${H} a ${FPS} fps, ${total} cuadros`);
console.log(`bucle: cuadros ${a} a ${b} (${(largo / FPS).toFixed(2)} s), diferencia al cerrar ${mejor.cierre.toFixed(2)} (movimiento a mitad de ciclo ${movimiento.toFixed(2)})`);
console.log(`recorte ${cw}x${ch}, toca borde: ${tocaBorde ? 'SI' : 'no'}`);
console.log(`para el juego: anim:{src:'arte/${path.basename(salida)}',n:${N},cols:${COLS},w:${tw},h:${th},fps:${fpsJuego}}`);

// Funciones compartidas: ffmpeg y quitar el fondo liso (magenta) de un cuadro RGBA.
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const FF_DIR = process.env.FFMPEG_DIR || 'C:\\EDISON\\videos\\ffmpeg';
export const FF = path.join(FF_DIR, 'ffmpeg.exe');
export const FP = path.join(FF_DIR, 'ffprobe.exe');

export function run(exe, args, input) {
  const r = spawnSync(exe, args, { input, maxBuffer: 1 << 30 });
  if (r.status !== 0) { console.error(String(r.stderr)); process.exit(1); }
  return r.stdout;
}

// Vuelve transparente el fondo de px (RGBA, W×H) y devuelve el color del fondo y la caja que ocupa la figura.
// Solo borra el fondo conectado con el borde o del color exacto del fondo, así los reflejos rosados
// dentro del personaje no se agujerean. En el borde deja transparencia suave y quita el tinte del fondo.
export function quitarFondo(px, W, H, PURO = 30) {
  let br = 0, bg = 0, bb = 0, n = 0;
  for (const [cx, cy] of [[0, 0], [W - 8, 0], [0, H - 8], [W - 8, H - 8]])
    for (let y = cy; y < cy + 8; y++) for (let x = cx; x < cx + 8; x++) { const k = (y * W + x) * 4; br += px[k]; bg += px[k + 1]; bb += px[k + 2]; n++; }
  br /= n; bg /= n; bb /= n;

  const D0 = 38, D1 = 135;
  const dist = new Float32Array(W * H);
  for (let i = 0, k = 0; i < W * H; i++, k += 4) { const a = px[k] - br, b = px[k + 1] - bg, c = px[k + 2] - bb; dist[i] = Math.sqrt(a * a + b * b + c * c); }

  const fondo = new Uint8Array(W * H), pila = new Int32Array(W * H); let tope = 0;
  const sembrar = i => { if (!fondo[i] && dist[i] < D1) { fondo[i] = 1; pila[tope++] = i; } };
  for (let x = 0; x < W; x++) { sembrar(x); sembrar((H - 1) * W + x); }
  for (let y = 0; y < H; y++) { sembrar(y * W); sembrar(y * W + W - 1); }
  for (let i = 0; i < W * H; i++) if (dist[i] < PURO) sembrar(i);
  while (tope) {
    const i = pila[--tope], x = i % W;
    if (x > 0) sembrar(i - 1); if (x < W - 1) sembrar(i + 1);
    if (i >= W) sembrar(i - W); if (i < W * (H - 1)) sembrar(i + W);
  }

  let x0 = W, x1 = 0, y0 = H, y1 = 0;
  for (let i = 0, k = 0; i < W * H; i++, k += 4) {
    let a = 1;
    if (fondo[i]) { a = (dist[i] - D0) / (D1 - D0); a = a < .08 ? 0 : a > 1 ? 1 : a; }
    if (a > 0 && a < 1) {
      px[k] = Math.max(0, Math.min(255, (px[k] - (1 - a) * br) / a));
      px[k + 1] = Math.max(0, Math.min(255, (px[k + 1] - (1 - a) * bg) / a));
      px[k + 2] = Math.max(0, Math.min(255, (px[k + 2] - (1 - a) * bb) / a));
    }
    px[k + 3] = Math.round(a * 255);
    if (a > .05) { const x = i % W, y = (i / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  // contorno: en los 2 píxeles pegados al fondo suele quedar un halo del color del fondo (más en video); se apaga ese tinte
  let borde = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) if (px[i * 4 + 3] < 255) borde[i] = 1;
  for (let pasada = 0; pasada < 2; pasada++) {
    const sig = borde.slice();
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { const i = y * W + x; if (!borde[i] && (borde[i - 1] || borde[i + 1] || borde[i - W] || borde[i + W])) sig[i] = 1; }
    borde = sig;
  }
  const magenta = br > bg + 60 && bb > bg + 60;
  if (magenta) for (let i = 0, k = 0; i < W * H; i++, k += 4) {
    if (!borde[i] || px[k + 3] === 0) continue;
    const exceso = Math.min(px[k], px[k + 2]) - px[k + 1];
    if (exceso > 10) { px[k] -= exceso * .85; px[k + 2] -= exceso * .85; }
  }
  return { x0, y0, x1, y1, fondo: [Math.round(br), Math.round(bg), Math.round(bb)] };
}

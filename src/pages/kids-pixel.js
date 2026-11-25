// 픽셀아트 공방: 칸 칠하기, 채우기, 좌우 대칭, 여러 칸(프레임) 애니메이션, GIF·PNG 저장
// 그림은 이 브라우저 안에만 자동 저장됩니다(서버로 보내지 않음).
import { encodeGif } from '../lib/gif.js';

const $ = (id) => document.getElementById(id);
const TXT = window.KIDS_TXT || {};
const COLORS = ['#ff6fae', '#ff9ed2', '#ffb38a', '#ffd27a', '#fff3a0', '#5fd4a8', '#2fae7a', '#6cc4ff', '#2f6fe0', '#b99bff', '#7d4fd6', '#8a5a3c', '#f6dcc0', '#ffffff', '#c9c4d4', '#7a7590', '#3a3550', '#111111'];
const STORE = 'nuricut-kids-pixel';

let N = 16;
let frames = [blank()];
let cur = 0;
let color = COLORS[0];
let tool = 'pencil';
let mirror = false;
let undo = [], redo = [];
let speed = 160;

function blank() { return new Array(N * N).fill(null); }

/* ---------- 저장/불러오기 (이 브라우저에만) ---------- */
function save() { try { localStorage.setItem(STORE, JSON.stringify({ N, frames, cur })); } catch {} }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (d && d.N && Array.isArray(d.frames) && d.frames.length) { N = d.N; frames = d.frames; cur = Math.min(d.cur || 0, frames.length - 1); $('grid-size').value = String(N); }
  } catch {}
}

/* ---------- 그리기 판 ---------- */
const board = $('board');
const ctx = board.getContext('2d');
function render() {
  const S = board.width / N;
  ctx.clearRect(0, 0, board.width, board.height);
  const f = frames[cur];
  if ($('onion').checked && cur > 0) {
    ctx.globalAlpha = 0.22;
    frames[cur - 1].forEach((c, i) => { if (c) { ctx.fillStyle = c; ctx.fillRect((i % N) * S, Math.floor(i / N) * S, S, S); } });
    ctx.globalAlpha = 1;
  }
  f.forEach((c, i) => { if (c) { ctx.fillStyle = c; ctx.fillRect((i % N) * S, Math.floor(i / N) * S, S, S); } });
  ctx.strokeStyle = 'rgba(36,32,58,.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < N; i++) {
    ctx.beginPath(); ctx.moveTo(i * S + 0.5, 0); ctx.lineTo(i * S + 0.5, board.height); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, i * S + 0.5); ctx.lineTo(board.width, i * S + 0.5); ctx.stroke();
  }
  if (mirror) { ctx.strokeStyle = 'rgba(255,111,174,.6)'; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(board.width / 2, 0); ctx.lineTo(board.width / 2, board.height); ctx.stroke(); ctx.setLineDash([]); }
}

function setCell(x, y, c) {
  if (x < 0 || y < 0 || x >= N || y >= N) return;
  frames[cur][y * N + x] = c;
  if (mirror) frames[cur][y * N + (N - 1 - x)] = c;
}
function floodFill(x, y, c) {
  const f = frames[cur];
  const target = f[y * N + x];
  if (target === c) return;
  const stack = [[x, y]];
  while (stack.length) {
    const [px, py] = stack.pop();
    if (px < 0 || py < 0 || px >= N || py >= N || f[py * N + px] !== target) continue;
    f[py * N + px] = c;
    stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]);
  }
  if (mirror) { const xs = N - 1 - x; if (xs !== x && f[y * N + xs] === target) floodFill(xs, y, c); }
}
function cellAt(e) {
  const r = board.getBoundingClientRect();
  return [Math.floor(((e.clientX - r.left) / r.width) * N), Math.floor(((e.clientY - r.top) / r.height) * N)];
}
let drawing = null;
board.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  board.setPointerCapture(e.pointerId);
  undo.push({ i: cur, d: frames[cur].slice() }); redo = [];
  if (undo.length > 100) undo.shift();
  const [x, y] = cellAt(e);
  if (tool === 'fill') { if (x >= 0 && y >= 0 && x < N && y < N) floodFill(x, y, color); changed(); return; }
  setCell(x, y, tool === 'eraser' ? null : color);
  drawing = [x, y];
  changed(false);
});
board.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const [x1, y1] = cellAt(e);
  let [x0, y0] = drawing;
  // 빠르게 그어도 칸이 끊기지 않게 사이를 이어서 칠함
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  while (true) {
    setCell(x0, y0, tool === 'eraser' ? null : color);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
  drawing = [x1, y1];
  changed(false);
});
const stopDraw = () => { if (drawing) { drawing = null; changed(); } };
board.addEventListener('pointerup', stopDraw);
board.addEventListener('pointercancel', stopDraw);

function changed(full = true) {
  render();
  drawThumb(cur);
  if (full) save();
}

/* ---------- 색 ---------- */
function setColor(c) {
  color = c;
  document.documentElement.style.setProperty('--c', c); // 연필 자국·물감 색이 같이 바뀜
  $('palette').querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.c === c));
  $('my-color').value = c;
  if (tool === 'eraser') setTool('pencil');
}
$('palette').innerHTML = COLORS.map((c) => `<button type="button" data-c="${c}" style="background:${c}" aria-label="${c}"></button>`).join('');
$('palette').addEventListener('click', (e) => { const b = e.target.closest('button'); if (b) setColor(b.dataset.c); });
$('my-color').addEventListener('input', (e) => setColor(e.target.value));

/* ---------- 도구 ---------- */
function setTool(t) {
  tool = t;
  document.querySelectorAll('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === t)));
}
document.querySelectorAll('[data-tool]').forEach((b) => b.addEventListener('click', () => setTool(b.dataset.tool)));
$('t-mirror').addEventListener('click', () => { mirror = !mirror; $('t-mirror').setAttribute('aria-pressed', String(mirror)); render(); });
$('t-undo').addEventListener('click', () => { const u = undo.pop(); if (!u) return; redo.push({ i: u.i, d: frames[u.i].slice() }); frames[u.i] = u.d; cur = Math.min(u.i, frames.length - 1); refreshAll(); });
$('t-redo').addEventListener('click', () => { const r = redo.pop(); if (!r) return; undo.push({ i: r.i, d: frames[r.i].slice() }); frames[r.i] = r.d; refreshAll(); });
$('t-clear').addEventListener('click', () => { if (!confirm(TXT.confirmClear || 'Clear?')) return; undo.push({ i: cur, d: frames[cur].slice() }); frames[cur] = blank(); changed(); });
$('onion').addEventListener('change', render);
$('grid-size').addEventListener('change', (e) => {
  const n = +e.target.value;
  // 칸 크기를 바꾸면 그림을 가운데에 옮겨 담음
  frames = frames.map((f) => {
    const out = new Array(n * n).fill(null);
    const off = Math.floor((n - N) / 2);
    f.forEach((c, i) => { const x = (i % N) + off, y = Math.floor(i / N) + off; if (c && x >= 0 && y >= 0 && x < n && y < n) out[y * n + x] = c; });
    return out;
  });
  N = n; undo = []; redo = [];
  refreshAll();
});

/* ---------- 그림 칸(프레임) ---------- */
function drawThumb(i) {
  const c = $('frames').querySelector(`[data-i="${i}"] canvas`);
  if (!c) return;
  c.width = N; c.height = N;
  const x = c.getContext('2d');
  x.clearRect(0, 0, N, N);
  frames[i].forEach((col, k) => { if (col) { x.fillStyle = col; x.fillRect(k % N, Math.floor(k / N), 1, 1); } });
}
function renderFrames() {
  $('frames').innerHTML = frames.map((_, i) => `<button type="button" data-i="${i}" class="${i === cur ? 'on' : ''}"><span>${i + 1}</span><canvas></canvas></button>`).join('');
  frames.forEach((_, i) => drawThumb(i));
}
$('frames').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; cur = +b.dataset.i; renderFrames(); render(); });
$('f-add').addEventListener('click', () => { frames.splice(cur + 1, 0, blank()); cur++; refreshAll(); });
$('f-dup').addEventListener('click', () => { frames.splice(cur + 1, 0, frames[cur].slice()); cur++; refreshAll(); });
$('f-del').addEventListener('click', () => { if (frames.length === 1) { frames[0] = blank(); } else { frames.splice(cur, 1); cur = Math.max(0, cur - 1); } refreshAll(); });
function refreshAll() { renderFrames(); render(); save(); }

/* ---------- 움직이는 모습 미리보기 ---------- */
const pv = $('preview');
const pctx = pv.getContext('2d');
let pvIdx = 0, timer = null;
function tick() {
  const f = frames[pvIdx % frames.length];
  const S = pv.width / N;
  pctx.fillStyle = '#fff'; pctx.fillRect(0, 0, pv.width, pv.height);
  f.forEach((c, i) => { if (c) { pctx.fillStyle = c; pctx.fillRect((i % N) * S, Math.floor(i / N) * S, Math.ceil(S), Math.ceil(S)); } });
  pvIdx++;
}
function play() { clearInterval(timer); timer = setInterval(tick, speed); tick(); }
$('speed').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  speed = +b.dataset.ms;
  $('speed').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
  play();
});

/* ---------- 따라 그리기 밑그림 (16×16) ---------- */
const STARTERS = [
  { c: ['', '#ff9ed2', '#ffffff', '#24203a', '#ff6fae', '#ffd27a'], art: ['0000110000110000', '0001210001210000', '0001210001210000', '0001210001210000', '0001110001110000', '0011111111111000', '0111111111111100', '0113311111331100', '0113311111331100', '0141111111114100', '0111113331111100', '0111111311111100', '0011111111111000', '0001111111110000', '0000555555500000', '0000000000000000'] },
  { c: ['', '#ff4f8b', '#ff9ec0', '#ffffff'], art: ['0000000000000000', '0001110000111000', '0011111001111100', '0111311111111110', '0113311111111110', '0111111111111110', '0111111111111110', '0011111111111100', '0001111111111000', '0000111111110000', '0000011111100000', '0000001111000000', '0000000110000000', '0000000000000000', '0000000000000000', '0000000000000000'] },
  { c: ['', '#ffd27a', '#ffb02e', '#24203a'], art: ['0000000110000000', '0000000110000000', '0000001111000000', '0000001111000000', '0111111111111110', '0011111111111100', '0001113113111000', '0000113113110000', '0000111111110000', '0001111111111000', '0001111001111000', '0011110000111100', '0011100000011100', '0110000000000110', '0000000000000000', '0000000000000000'] },
];
$('starters').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  const s = STARTERS[+b.dataset.starter];
  undo.push({ i: cur, d: frames[cur].slice() });
  const f = blank(), off = Math.floor((N - 16) / 2);
  s.art.forEach((row, y) => [...row].forEach((ch, x) => { const X = x + off, Y = y + off; if (+ch && X >= 0 && Y >= 0 && X < N && Y < N) f[Y * N + X] = s.c[+ch]; }));
  frames[cur] = f;
  changed();
});

/* ---------- 저장 ---------- */
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast(TXT.saved || 'Saved!');
}
function toast(msg) { const t = Object.assign(document.createElement('div'), { className: 'k-toast', textContent: msg }); document.body.append(t); setTimeout(() => t.remove(), 1800); }
const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
$('save-gif').addEventListener('click', () => {
  const s = Math.max(1, Math.floor(512 / N)), W = N * s;
  const used = ['#ffffff', ...new Set(frames.flat().filter(Boolean).map((c) => c.toLowerCase()))].filter((c, i, a) => a.indexOf(c) === i).slice(0, 256);
  const idx = new Map(used.map((c, i) => [c, i]));
  const gifFrames = frames.map((f) => {
    const px = new Uint8Array(W * W);
    for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const c = f[Math.floor(y / s) * N + Math.floor(x / s)]; px[y * W + x] = c ? idx.get(c.toLowerCase()) ?? 0 : 0; }
    return { pixels: px, delay: Math.round(speed / 10) };
  });
  download(new Blob([encodeGif({ width: W, height: W, palette: used.map(hex), frames: gifFrames })], { type: 'image/gif' }), 'nuricut-pixel.gif');
});
$('save-png').addEventListener('click', () => {
  const s = Math.max(1, Math.floor(512 / N));
  const c = document.createElement('canvas'); c.width = c.height = N * s;
  const x = c.getContext('2d');
  frames[cur].forEach((col, i) => { if (col) { x.fillStyle = col; x.fillRect((i % N) * s, Math.floor(i / N) * s, s, s); } });
  c.toBlob((b) => download(b, 'nuricut-pixel.png'), 'image/png');
});

/* ---------- 시작 ---------- */
load();
setColor(color);
setTool('pencil');
refreshAll();
play();

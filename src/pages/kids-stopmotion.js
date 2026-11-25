// 스톱모션: 카메라로 한 장씩 찍기(전 사진 겹쳐 보기) → 재생 → 효과 → GIF·MP4 저장
// 사진은 이 기기 안에서만 다루고 서버로 보내지 않습니다.
import { getFFmpeg, run, readOutput } from '../lib/ffmpeg.js';
import { kidTrack } from '../lib/kids-usage.js';
import '../lib/kids-press.js';
import '../lib/kids-battle.js';

const $ = (id) => document.getElementById(id);
const TXT = window.KIDS_TXT || {};
const fmt = (s, v) => s.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? '');
const W = 960; // 저장할 사진 폭

let stream = null, facing = 'environment';
let frames = []; // canvas 목록
let sel = -1;
let fps = 8, fx = 'none';
let playing = null;

const video = $('cam'), onion = $('onion-layer'), player = $('player');

function toast(msg) { const t = Object.assign(document.createElement('div'), { className: 'k-toast', textContent: msg }); document.body.append(t); setTimeout(() => t.remove(), 2200); }

/* ---------- 카메라 ---------- */
async function startCam() {
  try {
    stream?.getTracks().forEach((t) => t.stop());
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } }, audio: false });
    video.srcObject = stream;
    await video.play();
    $('start-box').hidden = true;
    $('cam-switch').hidden = false;
    $('shoot').disabled = false;
    kidTrack('kids_camera_on');
    updateUI();
  } catch (e) {
    console.warn(e);
    toast(TXT.camFail);
  }
}
$('cam-on').addEventListener('click', startCam);
$('cam-switch').addEventListener('click', () => { facing = facing === 'environment' ? 'user' : 'environment'; startCam(); });

/* ---------- 찍기 ---------- */
function addFrame(src, sw, sh) {
  const c = document.createElement('canvas');
  const k = W / sw;
  c.width = W; c.height = Math.round(sh * k);
  c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
  frames.push(c);
  sel = frames.length - 1;
  updateUI();
}
function shoot() {
  if (!stream || !video.videoWidth) return;
  addFrame(video, video.videoWidth, video.videoHeight);
  const f = $('flash'); f.classList.add('on'); setTimeout(() => f.classList.remove('on'), 60);
  navigator.vibrate?.(20);
}
$('shoot').addEventListener('click', shoot);
document.addEventListener('keydown', (e) => { if (e.code === 'Space' && stream && !playing && !e.target.closest('input, button, select')) { e.preventDefault(); shoot(); } });

// 카메라가 없으면 사진 파일로
$('photos').addEventListener('change', async (e) => {
  const files = [...e.target.files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
  for (const f of files) { const bmp = await createImageBitmap(f); addFrame(bmp, bmp.width, bmp.height); bmp.close?.(); }
  e.target.value = '';
  if (frames.length) { $('start-box').hidden = true; showPlayerFrame(sel); }
});

/* ---------- 전 사진 겹쳐 보기 ---------- */
function drawOnion() {
  const last = frames[frames.length - 1];
  onion.hidden = !($('onion').checked && last && stream && !playing);
  if (onion.hidden) return;
  onion.width = last.width; onion.height = last.height;
  onion.getContext('2d').drawImage(last, 0, 0);
}
$('onion').addEventListener('change', drawOnion);

/* ---------- 찍은 사진 줄 ---------- */
function renderStrip() {
  $('strip').innerHTML = frames.map((c, i) => `<button type="button" data-i="${i}" class="${i === sel ? 'on' : ''}"><img alt="" src="${c.toDataURL('image/jpeg', 0.6)}"><span>${i + 1}</span></button>`).join('');
  $('strip').scrollLeft = $('strip').scrollWidth;
}
$('strip').addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; sel = +b.dataset.i; renderStrip(); if (!stream) showPlayerFrame(sel); $('del-frame').disabled = false; });
$('del-frame').addEventListener('click', () => { if (sel < 0) return; frames.splice(sel, 1); sel = Math.min(sel, frames.length - 1); updateUI(); if (!stream && frames.length) showPlayerFrame(sel); });

function updateUI() {
  const n = frames.length;
  $('count').hidden = !n && !stream;
  $('count').textContent = fmt(TXT.count || '{n}', { n });
  $('play').disabled = n < 2;
  $('save-gif').disabled = $('save-mp4').disabled = n < 2;
  $('del-frame').disabled = sel < 0 || !n;
  renderStrip();
  drawOnion();
}

/* ---------- 효과 ---------- */
function applyFx(src) {
  if (fx === 'none') return src;
  const c = document.createElement('canvas');
  c.width = src.width; c.height = src.height;
  const x = c.getContext('2d');
  x.filter = fx === 'gray' ? 'grayscale(1) contrast(1.08)' : 'sepia(.85) contrast(1.15) brightness(.95)';
  x.drawImage(src, 0, 0);
  x.filter = 'none';
  if (fx === 'old') {
    // 옛날 영화: 가장자리 어둡게 + 자글자글한 점
    const g = x.createRadialGradient(c.width / 2, c.height / 2, c.height * 0.35, c.width / 2, c.height / 2, c.width * 0.65);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.25})`; x.fillRect(Math.random() * c.width, Math.random() * c.height, 2, 2); }
  }
  return c;
}

/* ---------- 재생 ---------- */
function showPlayerFrame(i) {
  const f = frames[i];
  if (!f) return;
  player.hidden = false;
  player.width = f.width; player.height = f.height;
  player.getContext('2d').drawImage(applyFx(f), 0, 0);
}
function stopPlay() {
  clearInterval(playing); playing = null;
  $('play').textContent = TXT.play;
  if (stream) { player.hidden = true; $('back-cam').hidden = true; }
  drawOnion();
}
$('play').addEventListener('click', () => {
  if (playing) return stopPlay();
  let i = 0;
  $('play').textContent = TXT.stop;
  onion.hidden = true;
  if (stream) $('back-cam').hidden = false;
  playing = setInterval(() => { showPlayerFrame(i % frames.length); i++; }, 1000 / fps);
});
$('back-cam').addEventListener('click', stopPlay);
const segs = (id, cb) => $(id).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; $(id).querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b)); cb(b); });
segs('speed', (b) => { fps = +b.dataset.fps; if (playing) { stopPlay(); $('play').click(); } });
segs('effect', (b) => { fx = b.dataset.fx; if (!playing && !stream && sel >= 0) showPlayerFrame(sel); });

/* ---------- 저장 (영상 엔진 사용) ---------- */
async function exportAs(kind) {
  if (frames.length < 2) return toast(TXT.needFrames);
  const box = $('progress'), bar = $('bar'), txt = $('progress-txt');
  box.hidden = false; bar.style.width = '3%'; txt.textContent = TXT.engine;
  $('save-gif').disabled = $('save-mp4').disabled = true;
  try {
    const ff = await getFFmpeg();
    for (let i = 0; i < frames.length; i++) {
      const c = applyFx(frames[i]);
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.9));
      await ff.writeFile(`f${String(i).padStart(4, '0')}.jpg`, new Uint8Array(await blob.arrayBuffer()));
      bar.style.width = (5 + (i / frames.length) * 25) + '%';
    }
    const dur = frames.length / fps;
    const onProgress = (p) => { bar.style.width = (30 + p * 70) + '%'; txt.textContent = fmt(TXT.making, { p: Math.round(30 + p * 70) }); };
    txt.textContent = fmt(TXT.making, { p: 30 });
    const out = kind === 'gif' ? 'out.gif' : 'out.mp4';
    const args = kind === 'gif'
      ? ['-framerate', String(fps), '-i', 'f%04d.jpg', '-vf', `scale=480:-2:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4`, '-loop', '0', out]
      : ['-framerate', String(fps), '-i', 'f%04d.jpg', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2,fps=30', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out];
    await run(args, { duration: dur, onProgress });
    const data = await readOutput(out);
    for (let i = 0; i < frames.length; i++) await ff.deleteFile(`f${String(i).padStart(4, '0')}.jpg`).catch(() => {});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([data], { type: kind === 'gif' ? 'image/gif' : 'video/mp4' }));
    a.download = `nuricut-stopmotion.${kind}`;
    document.body.append(a); a.click(); a.remove();
    bar.style.width = '100%'; txt.textContent = TXT.saved;
    kidTrack(kind === 'gif' ? 'kids_stop_gif' : 'kids_stop_mp4', { frames: frames.length, fps, effect: fx });
    toast(TXT.saved);
  } catch (e) {
    console.error(e);
    txt.textContent = '⚠️ ' + (e.message || e);
  } finally {
    $('save-gif').disabled = $('save-mp4').disabled = frames.length < 2;
    setTimeout(() => (box.hidden = true), 4000);
  }
}
$('save-gif').addEventListener('click', () => exportAs('gif'));
$('save-mp4').addEventListener('click', () => exportAs('mp4'));

updateUI();

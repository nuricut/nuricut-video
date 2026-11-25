// 서명·도장 넣기: 직접 그리기 또는 이미지 불러오기(흰 배경 제거) → 쪽 위에 끌어서 배치·크기 조절
import { $, m, UserError, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, renderPage, toBlob, baseName } from '../lib/pdf.js';
import { visual, drawImageVisual, canvasPng, removeWhite, trimCanvas } from '../lib/pdf-place.js';

const opt = (name) => document.querySelector(`input[name=${name}]:checked`)?.value;
let view = null;
let cur = 1; // 지금 보는 쪽
let sizes = []; // 쪽별 보이는 크기(pt) [{vw, vh}]
let marks = []; // 넣은 서명 [{page, left, top, width, height}] (pt, 보이는 쪽의 왼쪽 위 기준)
let stamp = null; // 서명 그림 (투명 배경 canvas)
let stampUrl = '';
const pageCache = new Map();

/* ---------- 서명 그리기 패드 ---------- */
const pad = $('pad');
const pctx = pad.getContext('2d');
let drawing = null, inked = false;
function padPoint(e) { const r = pad.getBoundingClientRect(); return [((e.clientX - r.left) / r.width) * pad.width, ((e.clientY - r.top) / r.height) * pad.height]; }
pad.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  pad.setPointerCapture(e.pointerId);
  drawing = { last: padPoint(e), mid: padPoint(e) };
  pctx.strokeStyle = opt('pen'); pctx.lineWidth = 7; pctx.lineCap = pctx.lineJoin = 'round';
});
pad.addEventListener('pointermove', (e) => {
  if (!drawing) return;
  const p = padPoint(e);
  const mid = [(drawing.last[0] + p[0]) / 2, (drawing.last[1] + p[1]) / 2];
  pctx.beginPath(); pctx.moveTo(...drawing.mid); pctx.quadraticCurveTo(...drawing.last, ...mid); pctx.stroke();
  drawing = { last: p, mid };
  inked = true;
});
const padEnd = () => { if (drawing) { drawing = null; updateStamp(); } };
pad.addEventListener('pointerup', padEnd);
pad.addEventListener('pointercancel', padEnd);
$('pad-clear').addEventListener('click', () => { pctx.clearRect(0, 0, pad.width, pad.height); inked = false; updateStamp(); });

/* ---------- 이미지 불러오기 ---------- */
let uploaded = null;
async function loadUpload() {
  const f = $('sign-img').files[0];
  if (!f) { uploaded = null; return updateStamp(); }
  const bmp = await createImageBitmap(f);
  const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas');
  c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  uploaded = c;
  updateStamp();
}
$('sign-img').addEventListener('change', loadUpload);
$('rm-white').addEventListener('change', updateStamp);

function updateStamp() {
  let src = null;
  if (opt('src') === 'draw') src = inked ? trimCanvas(pad, 10) : null;
  else if (uploaded) {
    const c = document.createElement('canvas');
    c.width = uploaded.width; c.height = uploaded.height;
    c.getContext('2d').drawImage(uploaded, 0, 0);
    src = $('rm-white').checked ? trimCanvas(removeWhite(c), 4) || c : c;
    $('img-preview').replaceChildren(Object.assign(document.createElement('img'), { src: src.toDataURL(), alt: '' }));
  }
  stamp = src;
  stampUrl = src ? src.toDataURL('image/png') : '';
  // 이미 넣은 서명의 그림·비율도 바꿔 줌
  if (stamp) for (const k of marks) k.height = k.width * (stamp.height / stamp.width);
  drawMarks();
}
document.querySelectorAll('input[name=src]').forEach((r) => r.addEventListener('change', () => {
  const draw = opt('src') === 'draw';
  $('draw-box').hidden = !draw; $('upload-box').hidden = draw;
  updateStamp();
}));

/* ---------- 쪽 미리보기와 배치 ---------- */
const stage = $('stage');
const scaleK = () => stage.clientWidth / sizes[cur - 1].vw; // pt → 화면 픽셀

async function showPage(no) {
  cur = Math.min(Math.max(1, no), sizes.length);
  if (!pageCache.has(cur)) pageCache.set(cur, await renderPage(view, cur, 640 * Math.min(2, devicePixelRatio || 1)));
  const c = pageCache.get(cur);
  c.className = 'stage-page';
  stage.replaceChildren(c);
  stage.style.aspectRatio = `${sizes[cur - 1].vw} / ${sizes[cur - 1].vh}`;
  drawMarks();
}

function drawMarks() {
  if (!sizes.length) return;
  stage.querySelectorAll('.sign-box').forEach((n) => n.remove());
  const k = scaleK();
  marks.forEach((mk, idx) => {
    if (mk.page !== cur) return;
    const el = document.createElement('div');
    el.className = 'sign-box';
    Object.assign(el.style, { left: mk.left * k + 'px', top: mk.top * k + 'px', width: mk.width * k + 'px', height: mk.height * k + 'px' });
    el.innerHTML = `<img alt="" draggable="false" src="${stampUrl}"><button class="sb-x" type="button" aria-label="${m('signRemove')}">✕</button><span class="sb-rz"></span>`;
    el.querySelector('.sb-x').addEventListener('click', (e) => { e.stopPropagation(); marks.splice(idx, 1); drawMarks(); });
    dragBox(el, mk);
    stage.append(el);
  });
  const here = marks.filter((x) => x.page === cur).length;
  $('page-no').textContent = m('signPage', { i: cur, n: sizes.length, c: here });
  $('prev').disabled = cur <= 1; $('next').disabled = cur >= sizes.length;
}

/** 서명 상자 끌어서 옮기기 / 오른쪽 아래 모서리로 크기 조절 (비율 유지) */
function dragBox(el, mk) {
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.sb-x')) return;
    e.preventDefault();
    el.setPointerCapture(e.pointerId);
    const k = scaleK();
    const resize = e.target.classList.contains('sb-rz');
    const s = { x: e.clientX, y: e.clientY, left: mk.left, top: mk.top, width: mk.width };
    const { vw, vh } = sizes[cur - 1];
    const move = (ev) => {
      const dx = (ev.clientX - s.x) / k, dy = (ev.clientY - s.y) / k;
      if (resize) {
        mk.width = Math.max(20, Math.min(vw - mk.left, s.width + dx));
        mk.height = mk.width * (stamp ? stamp.height / stamp.width : 0.4);
      } else {
        mk.left = Math.max(0, Math.min(vw - mk.width, s.left + dx));
        mk.top = Math.max(0, Math.min(vh - mk.height, s.top + dy));
      }
      Object.assign(el.style, { left: mk.left * k + 'px', top: mk.top * k + 'px', width: mk.width * k + 'px', height: mk.height * k + 'px' });
    };
    const up = () => { el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
  });
}

$('prev').addEventListener('click', () => showPage(cur - 1));
$('next').addEventListener('click', () => showPage(cur + 1));
$('add').addEventListener('click', () => {
  if (!stamp) return tool.showError(m('signNeed'));
  $('error').hidden = true;
  const { vw, vh } = sizes[cur - 1];
  const width = vw * 0.28, height = width * (stamp.height / stamp.width);
  marks.push({ page: cur, left: vw * 0.62, top: Math.max(0, vh * 0.8 - height), width, height });
  drawMarks();
});
$('all').addEventListener('click', () => {
  const here = marks.filter((x) => x.page === cur);
  if (!here.length) return tool.showError(m('signNone'));
  marks = marks.filter((x) => x.page === cur);
  for (let p = 1; p <= sizes.length; p++) if (p !== cur) for (const h of here) {
    const { vw, vh } = sizes[p - 1];
    marks.push({ ...h, page: p, left: Math.min(h.left, vw - h.width), top: Math.min(h.top, vh - h.height) });
  }
  drawMarks();
});
window.addEventListener('resize', drawMarks);

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    pageCache.clear();
    marks = [];
    view = await openForView(await bytesOf(file));
    sizes = [];
    for (let i = 1; i <= view.numPages; i++) {
      const vp = (await view.getPage(i)).getViewport({ scale: 1 });
      sizes.push({ vw: vp.width, vh: vp.height });
    }
    $('work-title').textContent = m('fileTitle', { name: file.name, n: view.numPages });
    await showPage(1);
  },
  onReset: () => { view?.destroy(); view = null; sizes = []; marks = []; },
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  if (!stamp) return tool.showError(m('signNeed'));
  if (!marks.length) return tool.showError(m('signNone'));
  tool.begin(m('signWorking'));
  try {
    const { degrees } = await getPdfLib();
    const doc = await openForEdit(await bytesOf(file), file.name);
    const img = await doc.embedPng(await canvasPng(stamp));
    const pages = doc.getPages();
    for (const mk of marks) {
      const page = pages[mk.page - 1];
      const v = visual(page);
      // 미리보기 크기(pdf.js)와 실제 쪽 크기가 조금 다를 수 있어 비율로 맞춤
      const fx = v.VW / sizes[mk.page - 1].vw, fy = v.VH / sizes[mk.page - 1].vh;
      const w = mk.width * fx, h = mk.height * fy;
      drawImageVisual(page, img, { cx: mk.left * fx + w / 2, cy: v.VH - mk.top * fy - h / 2, w, h }, degrees);
    }
    const blob = await toBlob(doc);
    const used = new Set(marks.map((x) => x.page)).size;
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxSigned')}.pdf`, info: m('signInfo', { c: marks.length, n: used }), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

export { UserError };

// 워터마크: 글자(어떤 언어든) 또는 이미지를 대각선·가로·바둑판으로 (미리보기 포함)
// 글자는 브라우저 글꼴로 투명 그림(PNG)을 만들어 넣으므로 한글·한자·일본어 모두 그대로 나옵니다.
import { $, m, UserError, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, renderPage, toBlob, baseName, pagesText } from '../lib/pdf.js';
import { visual, drawImageVisual, canvasPng } from '../lib/pdf-place.js';

let view = null;
let base = null; // 미리보기용 1쪽 그림 { canvas, vw, vh }
let userImg = null; // 이미지 워터마크 (canvas)
const opt = (name) => document.querySelector(`input[name=${name}]:checked`)?.value;
const COLORS = { gray: '#6b6b78', red: '#d4262c', blue: '#1f5fd6' };

/** 워터마크 그림(투명 배경) 만들기 */
function stampCanvas() {
  if (opt('kind') === 'image') return userImg;
  const text = $('wm-text').value.trim();
  if (!text) return null;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  const font = `800 200px "Pretendard Variable", Pretendard, "Malgun Gothic", "Microsoft YaHei", "Yu Gothic", sans-serif`;
  ctx.font = font;
  const w = Math.ceil(ctx.measureText(text).width) + 40;
  c.width = w; c.height = 260;
  ctx.font = font;
  ctx.fillStyle = COLORS[opt('color')];
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 20, 135);
  return c;
}

/** 한 쪽(보이는 크기 VW×VH)에 놓을 워터마크 위치들: [{cx, cy, w, h, angle}] */
function placements(VW, VH, ratio) {
  const layout = opt('layout');
  const scale = +opt('scale');
  const diagAngle = (Math.atan2(VH, VW) * 180) / Math.PI;
  if (layout === 'tile') {
    const w = VW * scale * 0.45, h = w / ratio;
    const out = [];
    const stepX = w * 1.5, stepY = Math.max(h * 3, VH / 5);
    for (let y = stepY / 2, row = 0; y < VH + stepY / 2; y += stepY, row++)
      for (let x = (row % 2 ? stepX / 2 : 0) + w / 2; x < VW + w / 2; x += stepX) out.push({ cx: x, cy: y, w, h, angle: 30 });
    return out;
  }
  const angle = layout === 'diag' ? diagAngle : 0;
  // 대각선이면 회전 후에도 쪽 안에 들어오도록 대각선 길이 기준
  const len = layout === 'diag' ? Math.hypot(VW, VH) : VW;
  const w = len * scale, h = w / ratio;
  return [{ cx: VW / 2, cy: VH / 2, w, h, angle }];
}

function preview() {
  if (!base) return;
  const out = $('preview').querySelector('canvas.pv-out') || Object.assign(document.createElement('canvas'), { className: 'pv-out' });
  out.width = base.canvas.width; out.height = base.canvas.height;
  const ctx = out.getContext('2d');
  ctx.drawImage(base.canvas, 0, 0);
  const st = stampCanvas();
  if (st) {
    const k = out.width / base.vw; // pt → 미리보기 픽셀
    ctx.globalAlpha = +opt('opacity');
    for (const p of placements(base.vw, base.vh, st.width / st.height)) {
      ctx.save();
      ctx.translate(p.cx * k, out.height - p.cy * k);
      ctx.rotate((-p.angle * Math.PI) / 180);
      ctx.drawImage(st, (-p.w * k) / 2, (-p.h * k) / 2, p.w * k, p.h * k);
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }
  if (!out.isConnected) $('preview').replaceChildren(out);
}

const syncKind = () => {
  const img = opt('kind') === 'image';
  $('text-field').hidden = img; $('color-field').hidden = img; $('img-field').hidden = !img;
  preview();
};
document.querySelectorAll('input[name=kind]').forEach((r) => r.addEventListener('change', syncKind));
document.querySelectorAll('.options input:not([type=file])').forEach((i) => i.addEventListener('input', preview));
$('wm-img').addEventListener('change', async (e) => {
  const f = e.target.files[0];
  if (!f) return;
  const bmp = await createImageBitmap(f);
  userImg = document.createElement('canvas');
  userImg.width = bmp.width; userImg.height = bmp.height;
  userImg.getContext('2d').drawImage(bmp, 0, 0);
  preview();
});

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    $('work-title').textContent = m('fileTitle', { name: file.name, n: view.numPages });
    const page = await view.getPage(1);
    const vp = page.getViewport({ scale: 1 });
    base = { canvas: await renderPage(view, 1, 300 * Math.min(2, devicePixelRatio || 1)), vw: vp.width, vh: vp.height };
    await document.fonts?.ready;
    syncKind();
  },
  onReset: () => { view?.destroy(); view = null; base = null; },
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const st = stampCanvas();
  if (!st) return tool.showError(m(opt('kind') === 'image' ? 'wmNeedImg' : 'wmNeedText'));
  tool.begin(m('wmWorking', { i: 0, n: 1 }));
  try {
    const { degrees } = await getPdfLib();
    const doc = await openForEdit(await bytesOf(file), file.name);
    const img = await doc.embedPng(await canvasPng(st));
    const pages = doc.getPages();
    const opacity = +opt('opacity');
    pages.forEach((page, i) => {
      tool.progress(i / pages.length, m('wmWorking', { i: i + 1, n: pages.length }));
      const v = visual(page);
      for (const p of placements(v.VW, v.VH, st.width / st.height)) drawImageVisual(page, img, { ...p, opacity }, degrees);
    });
    const blob = await toBlob(doc);
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxWatermark')}.pdf`, info: pagesText(pages.length), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

export { UserError };

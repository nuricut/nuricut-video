// 여백 자르기: 자동(쪽마다 내용에 맞춰) 또는 직접(mm). 쪽 내용은 지우지 않고 보이는 영역(CropBox)만 줄임
import { $, m, UserError, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, renderPage, toBlob, baseName, pagesText } from '../lib/pdf.js';
import { visual, rectToPage, MM } from '../lib/pdf-place.js';

let view = null;
let pv = null; // 1쪽 미리보기 { canvas, vw, vh, auto }
const opt = (name) => document.querySelector(`input[name=${name}]:checked`)?.value;
const mmVal = (id) => Math.max(0, parseFloat($(id).value) || 0) * MM;

/** 쪽 그림에서 흰색이 아닌 부분의 범위 찾기 → 보이는 좌표(pt) { x, y, w, h } */
async function contentBox(no) {
  const scale = 0.5;
  const c = await renderPage(view, no, null, { scale });
  const { width: W, height: H } = c;
  const px = c.getContext('2d').getImageData(0, 0, W, H).data;
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    if (px[i] < 238 || px[i + 1] < 238 || px[i + 2] < 238) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  const vw = W / scale, vh = H / scale;
  if (x1 < 0) return { x: 0, y: 0, w: vw, h: vh }; // 빈 쪽은 그대로
  return { x: x0 / scale, y: vh - (y1 + 1) / scale, w: (x1 - x0 + 1) / scale, h: (y1 - y0 + 1) / scale };
}

/** 이 쪽의 잘라 낼 영역(보이는 좌표) */
function cropRect(VW, VH, auto) {
  if (opt('mode') === 'auto') {
    const pad = mmVal('pad-mm');
    const x = Math.max(0, auto.x - pad), y = Math.max(0, auto.y - pad);
    return { x, y, w: Math.min(VW, auto.x + auto.w + pad) - x, h: Math.min(VH, auto.y + auto.h + pad) - y };
  }
  const l = mmVal('mm-left'), r = mmVal('mm-right'), t = mmVal('mm-top'), b = mmVal('mm-bottom');
  return { x: l, y: b, w: VW - l - r, h: VH - t - b };
}

function preview() {
  if (!pv) return;
  const box = $('preview');
  const k = box.clientWidth / pv.vw;
  const r = cropRect(pv.vw, pv.vh, pv.auto);
  const shade = box.querySelector('.crop-shade') || box.appendChild(Object.assign(document.createElement('div'), { className: 'crop-shade' }));
  Object.assign(shade.style, { left: r.x * k + 'px', top: (pv.vh - r.y - r.h) * k + 'px', width: Math.max(0, r.w) * k + 'px', height: Math.max(0, r.h) * k + 'px' });
}
const syncMode = () => { const auto = opt('mode') === 'auto'; $('auto-field').hidden = !auto; $('manual-field').hidden = auto; preview(); };
document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', syncMode));
document.querySelectorAll('.options input[type=number]').forEach((i) => i.addEventListener('input', preview));
window.addEventListener('resize', preview);

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    $('work-title').textContent = m('fileTitle', { name: file.name, n: view.numPages });
    const page = await view.getPage(1);
    const vp = page.getViewport({ scale: 1 });
    const canvas = await renderPage(view, 1, 300 * Math.min(2, devicePixelRatio || 1));
    pv = { canvas, vw: vp.width, vh: vp.height, auto: await contentBox(1) };
    $('preview').replaceChildren(canvas);
    syncMode();
  },
  onReset: () => { view?.destroy(); view = null; pv = null; },
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const auto = opt('mode') === 'auto';
  tool.begin(m(auto ? 'cropDetect' : 'cropWorking', { i: 0, n: view.numPages }));
  try {
    await getPdfLib();
    const doc = await openForEdit(await bytesOf(file), file.name);
    const pages = doc.getPages();
    for (let i = 0; i < pages.length; i++) {
      tool.progress(i / pages.length, auto ? m('cropDetect', { i: i + 1, n: pages.length }) : m('cropWorking'));
      const v = visual(pages[i]);
      const r = cropRect(v.VW, v.VH, auto ? await contentBox(i + 1) : null);
      if (r.w < 36 || r.h < 36) throw new UserError(m('cropBad'));
      const pr = rectToPage(v, r.x, r.y, r.w, r.h);
      pages[i].setCropBox(pr.x, pr.y, pr.width, pr.height);
    }
    const blob = await toBlob(doc);
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxCropped')}.pdf`, info: pagesText(pages.length), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

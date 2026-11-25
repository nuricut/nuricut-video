// 쪽 번호 넣기: 위치 6곳 · 형식 3가지 · 시작 번호 · 글자 크기 · 표지 건너뛰기 (미리보기 포함)
import { $, m, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, renderPage, toBlob, baseName, pagesText } from '../lib/pdf.js';
import { visual, drawTextVisual } from '../lib/pdf-place.js';

let view = null;
let pv = null; // 미리보기 { canvas, vw, vh } (1쪽, pt 기준 크기)
const opt = (name) => document.querySelector(`input[name=${name}]:checked`)?.value;
const MARGIN = 28; // 쪽 가장자리에서 번호까지 거리(pt, 약 1cm)

function label(no, total) {
  const f = opt('fmt');
  return f === 'nt' ? `${no} / ${total}` : f === 'dash' ? `- ${no} -` : `${no}`;
}

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    $('work-title').textContent = m('fileTitle', { name: file.name, n: view.numPages });
    const page = await view.getPage(1);
    const vp = page.getViewport({ scale: 1 }); // 회전이 반영된 보이는 크기
    const canvas = await renderPage(view, 1, 300 * Math.min(2, devicePixelRatio || 1));
    pv = { canvas, vw: vp.width, vh: vp.height };
    $('preview').replaceChildren(canvas, Object.assign(document.createElement('span'), { className: 'pv-num' }));
    preview();
  },
  onReset: () => { view?.destroy(); view = null; },
});

/** 미리보기: 1쪽 그림 위에 번호 표시 (실제 결과와 같은 비율) */
function preview() {
  if (!pv) return;
  const el = $('preview').querySelector('.pv-num');
  const pos = opt('pos');
  const size = +opt('size');
  const start = Math.max(0, parseInt($('start-no').value, 10) || 0);
  const skip = $('skip-first').checked;
  const scale = $('preview').clientWidth / pv.vw;
  el.textContent = skip ? '' : label(start, (view?.numPages || 1) - (skip ? 1 : 0) + start - 1);
  el.style.fontSize = size * scale + 'px';
  el.style.left = el.style.right = el.style.top = el.style.bottom = '';
  el.style.transform = '';
  const mg = MARGIN * scale + 'px';
  if (pos[0] === 't') el.style.top = (MARGIN - size) * scale + 'px'; else el.style.bottom = (MARGIN - size * 0.25) * scale + 'px';
  if (pos[1] === 'l') el.style.left = mg; else if (pos[1] === 'r') el.style.right = mg; else { el.style.left = '50%'; el.style.transform = 'translateX(-50%)'; }
}
document.querySelectorAll('.options input').forEach((i) => i.addEventListener('input', preview));
window.addEventListener('resize', preview);

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  tool.begin(m('numbering'));
  try {
    const { StandardFonts, rgb, degrees } = await getPdfLib();
    const doc = await openForEdit(await bytesOf(file), file.name);
    const font = await doc.embedFont(StandardFonts.Helvetica);
    const pages = doc.getPages();
    const size = +opt('size');
    const pos = opt('pos');
    const start = Math.max(0, parseInt($('start-no').value, 10) || 0);
    const skip = $('skip-first').checked;
    const total = pages.length - (skip ? 1 : 0) + start - 1;
    pages.forEach((page, i) => {
      if (skip && i === 0) return;
      const no = start + i - (skip ? 1 : 0);
      const text = label(no, total);
      const w = font.widthOfTextAtSize(text, size);
      const v = visual(page);
      const vx = pos[1] === 'l' ? MARGIN : pos[1] === 'r' ? v.VW - MARGIN - w : (v.VW - w) / 2;
      const vy = pos[0] === 't' ? v.VH - MARGIN : MARGIN - size * 0.25;
      drawTextVisual(page, text, { vx, vy, size, font, color: rgb(0.2, 0.2, 0.22) }, degrees);
      tool.progress(i / pages.length);
    });
    const blob = await toBlob(doc);
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxNumbered')}.pdf`, info: pagesText(pages.length), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

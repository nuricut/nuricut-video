// PDF → 이미지: 쪽을 JPG·PNG로 저장 (여러 장은 ZIP)
import { $, m, createPdfTool, openForView, bytesOf, pageGrid, createSelection, renderPage, makeZip, baseName } from '../lib/pdf.js';

const grid = $('pages');
grid.classList.add('picking');
let view = null;
let items = [];
const sel = createSelection(grid, { onChange: () => update() });

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    items = pageGrid(grid, view);
    items.forEach((d) => d.addEventListener('click', () => sel.toggle(d)));
    sel.clear();
    update();
  },
  onReset: () => { view?.destroy(); view = null; },
});

const picked = () => {
  const sel = items.filter((d) => d.classList.contains('sel')).map((d) => +d.dataset.page);
  return sel.length ? sel : items.map((d) => +d.dataset.page);
};

function update() {
  const f = tool.files[0];
  const n = items.filter((d) => d.classList.contains('sel')).length;
  $('work-title').textContent = f ? m('fileTitle', { name: f.name, n: items.length }) : '';
  $('start').textContent = n ? m('toImgSel', { n }) : m('toImgAll', { n: items.length });
}

const canvasToBlob = (c, type, q) => new Promise((r) => c.toBlob(r, type, q));

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const pages = picked();
  const fmt = document.querySelector('input[name=format]:checked').value;
  const dpi = +document.querySelector('input[name=quality]:checked').value;
  const type = fmt === 'png' ? 'image/png' : 'image/jpeg';
  const base = baseName(file.name);
  tool.begin(m('converting'));
  try {
    const outs = [];
    for (let i = 0; i < pages.length; i++) {
      tool.progress(i / pages.length, m('convertingN', { i: i + 1, n: pages.length }));
      const page = await view.getPage(pages[i]);
      const vp = page.getViewport({ scale: 1 });
      // 너무 큰 그림은 브라우저가 못 그리므로 한 변 최대 8000px로 제한
      const scale = Math.min(dpi / 72, 8000 / Math.max(vp.width, vp.height));
      const canvas = await renderPage(view, pages[i], null, { scale });
      const blob = await canvasToBlob(canvas, type, 0.92);
      canvas.width = canvas.height = 0; // 메모리 바로 반환
      outs.push({ name: `${base}_${String(pages[i]).padStart(String(view.numPages).length, '0')}.${fmt}`, blob });
    }
    if (outs.length === 1) {
      tool.done({ blob: outs[0].blob, name: outs[0].name, info: m('img1') });
    } else {
      tool.progress(0.97, m('zipping'));
      const entries = await Promise.all(outs.map(async (o) => ({ name: o.name, data: new Uint8Array(await o.blob.arrayBuffer()) })));
      tool.done({ blob: await makeZip(entries), name: `${base}${m('sfxImages')}.zip`, info: m('imgN', { n: outs.length }) });
    }
  } catch (e) {
    tool.fail(e);
  }
});

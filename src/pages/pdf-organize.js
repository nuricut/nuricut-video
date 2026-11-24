// 페이지 정리: 순서 바꾸기·회전·삭제·빈 쪽 넣기
import { $, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, pageGrid, makeSortable, toBlob, baseName } from '../lib/pdf.js';

const grid = $('pages');
grid.classList.add('picking');
let view = null;

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    pageGrid(grid, view, { handle: true }).forEach((d) => (d.dataset.rot = 0));
    refresh();
  },
  onReset: () => { view?.destroy(); view = null; },
});

const all = () => [...grid.querySelectorAll('.pg')];
const selected = () => all().filter((d) => d.classList.contains('sel'));

function refresh() {
  const items = all();
  items.forEach((d, i) => {
    const r = +d.dataset.rot;
    d.querySelector('.no').textContent = `${i + 1}${r ? ` · ${r}°` : ''}`;
    const c = d.querySelector('.sheet canvas');
    if (c) c.style.transform = `rotate(${r}deg)${r % 180 ? ' scale(.76)' : ''}`;
  });
  const n = selected().length;
  ['rot-l', 'rot-r', 'del'].forEach((id) => ($(id).disabled = !n));
  $('sel-all').textContent = n && n === items.length ? '선택 해제' : '전체 선택';
  const f = tool.files[0];
  $('work-title').textContent = f ? `${f.name} · ${items.length}쪽${n ? ` · ${n}쪽 선택` : ''}` : '';
  $('start').textContent = `PDF 저장 (${items.length}쪽)`;
  $('start').disabled = !items.length;
}

grid.addEventListener('click', (e) => {
  if (e.target.closest('.handle')) return;
  const d = e.target.closest('.pg');
  if (!d) return;
  d.classList.toggle('sel');
  refresh();
});

makeSortable(grid, { item: '.pg', handle: '.handle', onEnd: refresh });

$('sel-all').addEventListener('click', () => {
  const items = all();
  const on = selected().length !== items.length;
  items.forEach((d) => d.classList.toggle('sel', on));
  refresh();
});
const rotate = (deg) => {
  selected().forEach((d) => (d.dataset.rot = (((+d.dataset.rot + deg) % 360) + 360) % 360));
  refresh();
};
$('rot-l').addEventListener('click', () => rotate(-90));
$('rot-r').addEventListener('click', () => rotate(90));
$('del').addEventListener('click', () => {
  const sel = selected();
  if (sel.length === all().length) return tool.showError('모든 쪽을 지울 수는 없어요. 최소 한 쪽은 남겨 주세요.');
  sel.forEach((d) => d.remove());
  refresh();
});
$('blank').addEventListener('click', () => {
  const d = document.createElement('div');
  d.className = 'pg';
  d.dataset.page = 'blank';
  d.dataset.rot = 0;
  d.dataset.key = 'blank' + Date.now();
  d.innerHTML = '<span class="handle" title="끌어서 순서 바꾸기">⠿</span><span class="check"></span><div class="sheet"><div class="blank-page"></div></div><span class="no"></span>';
  const last = selected().at(-1);
  if (last) last.after(d);
  else grid.append(d);
  refresh();
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const items = all();
  tool.begin('저장하는 중…');
  try {
    const { PDFDocument, degrees } = await getPdfLib();
    const src = await openForEdit(await bytesOf(file), file.name);
    const out = await PDFDocument.create();
    let lastSize = src.getPageCount() ? src.getPage(0).getSize() : { width: 595.28, height: 841.89 };
    for (let i = 0; i < items.length; i++) {
      tool.progress(i / items.length);
      const d = items[i];
      const rot = +d.dataset.rot;
      if (d.dataset.page === 'blank') {
        const p = out.addPage([lastSize.width, lastSize.height]);
        if (rot) p.setRotation(degrees(rot));
        continue;
      }
      const [p] = await out.copyPages(src, [+d.dataset.page - 1]);
      if (rot) p.setRotation(degrees((p.getRotation().angle + rot) % 360));
      out.addPage(p);
      lastSize = p.getSize();
    }
    const blob = await toBlob(out);
    tool.done({ blob, name: `${baseName(file.name)}_정리.pdf`, info: `${items.length}쪽`, pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

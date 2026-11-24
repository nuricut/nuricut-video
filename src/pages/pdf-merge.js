// PDF 합치기: 여러 PDF를 순서대로 하나로
import { $, m, pagesText, createPdfTool, openForView, openForEdit, getPdfLib, renderThumb, bytesOf, toBlob, makeSortable, baseName, formatSize, UserError } from '../lib/pdf.js';

const list = $('list');
const meta = new WeakMap(); // 파일 → { pages, canvas }

const tool = createPdfTool({ kind: 'pdf', multiple: true, onFiles: render });

function render(files) {
  list.innerHTML = '';
  files.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.key = i;
    row.innerHTML = `<span class="handle" title="${m('dragTip')}">⠿</span><span class="thumb"></span><span class="nm"><b></b><small>${formatSize(f.size)}</small></span><button class="icon-btn" type="button" title="${m('remove')}" aria-label="${m('remove')}">✕</button>`;
    row.querySelector('b').textContent = f.name;
    row.querySelector('button').onclick = () => tool.setFiles(files.filter((x) => x !== f));
    list.append(row);
    fillMeta(f, row);
  });
  updateTitle();
}

async function fillMeta(f, row) {
  try {
    if (!meta.has(f)) {
      const pdf = await openForView(await bytesOf(f));
      meta.set(f, { pages: pdf.numPages, canvas: await renderThumb(pdf, 1, 34) });
      pdf.destroy();
    }
    const { pages, canvas } = meta.get(f);
    const thumb = row.querySelector('.thumb');
    thumb.innerHTML = '';
    const c = document.createElement('canvas');
    c.width = canvas.width;
    c.height = canvas.height;
    c.getContext('2d').drawImage(canvas, 0, 0);
    thumb.append(c);
    row.querySelector('small').textContent = m('pageSize', { n: pages, size: formatSize(f.size) });
  } catch {
    row.querySelector('small').textContent = m('mergeBad');
    row.querySelector('small').style.color = 'var(--err)';
  }
  updateTitle();
}

function updateTitle() {
  const files = tool.files;
  const total = files.reduce((s, f) => s + (meta.get(f)?.pages || 0), 0);
  $('work-title').textContent = total ? m('mergeTitleTotal', { n: files.length, t: total }) : m('mergeTitle', { n: files.length });
  $('start').textContent = total ? m('mergeBtnN', { t: total }) : m('mergeBtn');
}

makeSortable(list, {
  item: '.file-row',
  handle: '.handle',
  onEnd: (keys) => {
    const files = tool.files;
    tool.setFiles(keys.map((k) => files[+k]));
  },
});

$('start').addEventListener('click', async () => {
  const files = tool.files;
  if (files.length < 2) return tool.showError(m('mergeNeed2'));
  tool.begin(m('merging'));
  try {
    const { PDFDocument } = await getPdfLib();
    const out = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      tool.progress(i / files.length, m('mergingN', { i: i + 1, n: files.length, name: files[i].name }));
      const src = await openForEdit(await bytesOf(files[i]), files[i].name);
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    }
    tool.progress(0.95, m('saving'));
    const blob = await toBlob(out);
    tool.done({ blob, name: `${baseName(files[0].name)}${m('sfxMerged')}.pdf`, info: pagesText(out.getPageCount()), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

export { UserError };

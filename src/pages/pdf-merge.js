// PDF 합치기: 여러 PDF를 순서대로 하나로
import { $, createPdfTool, openForView, openForEdit, getPdfLib, renderThumb, bytesOf, toBlob, makeSortable, baseName, formatSize, UserError } from '../lib/pdf.js';

const list = $('list');
const meta = new WeakMap(); // 파일 → { pages, canvas }

const tool = createPdfTool({ kind: 'pdf', multiple: true, onFiles: render });

function render(files) {
  list.innerHTML = '';
  files.forEach((f, i) => {
    const row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.key = i;
    row.innerHTML = `<span class="handle" title="끌어서 순서 바꾸기">⠿</span><span class="thumb"></span><span class="nm"><b></b><small>${formatSize(f.size)}</small></span><button class="icon-btn" type="button" title="빼기" aria-label="빼기">✕</button>`;
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
    row.querySelector('small').textContent = `${pages}쪽 · ${formatSize(f.size)}`;
  } catch {
    row.querySelector('small').textContent = '열 수 없는 PDF (암호 또는 손상)';
    row.querySelector('small').style.color = 'var(--err)';
  }
  updateTitle();
}

function updateTitle() {
  const files = tool.files;
  const total = files.reduce((s, f) => s + (meta.get(f)?.pages || 0), 0);
  $('work-title').textContent = `PDF ${files.length}개${total ? ` · 총 ${total}쪽` : ''}`;
  $('start').textContent = total ? `PDF 합치기 (${total}쪽)` : 'PDF 합치기';
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
  if (files.length < 2) return tool.showError('PDF를 2개 이상 넣어 주세요.');
  tool.begin('PDF 합치는 중…');
  try {
    const { PDFDocument } = await getPdfLib();
    const out = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      tool.progress(i / files.length, `합치는 중… (${i + 1}/${files.length}) ${files[i].name}`);
      const src = await openForEdit(await bytesOf(files[i]), files[i].name);
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach((p) => out.addPage(p));
    }
    tool.progress(0.95, '저장하는 중…');
    const blob = await toBlob(out);
    tool.done({ blob, name: `${baseName(files[0].name)}_합침.pdf`, info: `${out.getPageCount()}쪽`, pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

export { UserError };

// PDF 나누기: 범위로 / 한 쪽씩 / 골라 뽑기
import { $, show, hide, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, pageGrid, createSelection, parseRanges, makeZip, baseName } from '../lib/pdf.js';

const grid = $('pages');
const rangeIn = $('range');
let view = null; // pdf.js 문서
let items = [];
let total = 0;
const sel = createSelection(grid, { onChange: () => update() });

const mode = () => document.querySelector('input[name=mode]:checked').value;

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    total = view.numPages;
    $('work-title').textContent = `${file.name} · ${total}쪽`;
    items = pageGrid(grid, view);
    items.forEach((d) => d.addEventListener('click', () => { if (mode() === 'pick') sel.toggle(d); }));
    sel.clear();
    const half = Math.ceil(total / 2);
    rangeIn.value = total > 1 ? `1-${half}, ${half + 1}-` : '1';
    update();
  },
  onReset: () => { view?.destroy(); view = null; },
});

/** 지금 설정으로 만들어질 묶음들 (쪽 번호 배열의 배열). 잘못되면 null */
function groups() {
  if (mode() === 'each') return Array.from({ length: total }, (_, i) => [i + 1]);
  if (mode() === 'pick') {
    const sel = items.filter((d) => d.classList.contains('sel')).map((d) => +d.dataset.page);
    return sel.length ? [sel] : null;
  }
  return parseRanges(rangeIn.value, total);
}

function update() {
  const m = mode();
  $('range-field').hidden = m !== 'range';
  $('pick-hint').hidden = m !== 'pick';
  grid.classList.toggle('picking', m === 'pick');
  if (m !== 'pick' && sel.list.length) return sel.clear(); // 고르기 모드를 벗어나면 선택 해제 (다시 update 호출됨)
  const g = groups();
  // 쪽마다 어느 파일로 가는지 색으로 표시
  const where = new Map();
  (g || []).forEach((pages, gi) => pages.forEach((p) => where.set(p, gi)));
  items.forEach((d) => {
    d.querySelector('.gtag')?.remove();
    if (m === 'pick') { delete d.dataset.group; return; }
    const gi = where.get(+d.dataset.page);
    if (gi === undefined) { d.dataset.group = -1; return; }
    d.dataset.group = gi % 6;
    if (m === 'range') d.insertAdjacentHTML('beforeend', `<span class="gtag">${gi + 1}번</span>`);
  });
  const sum = $('summary');
  const btn = $('start');
  if (!g) {
    sum.textContent = m === 'pick' ? '뽑을 쪽을 눌러서 골라 주세요.' : `쪽 범위를 확인해 주세요. (전체 ${total}쪽)`;
    btn.disabled = true;
    return;
  }
  btn.disabled = false;
  if (m === 'each') sum.textContent = `${total}쪽을 한 쪽씩 PDF ${total}개로 나눠요 (ZIP 하나로 받기)`;
  else if (m === 'pick') sum.textContent = `고른 ${g[0].length}쪽(${g[0].join(', ')})을 PDF 하나로 뽑아요`;
  else sum.textContent = `PDF ${g.length}개로 나눠요: ` + g.map((p) => (p.length > 1 ? `${p[0]}–${p.at(-1)}쪽` : `${p[0]}쪽`)).join(', ') + (g.length > 1 ? ' (ZIP 하나로 받기)' : '');
  btn.textContent = g.length > 1 ? `PDF ${g.length}개로 나누기` : 'PDF 만들기';
}

document.querySelectorAll('input[name=mode]').forEach((r) => r.addEventListener('change', update));
rangeIn.addEventListener('input', update);

$('start').addEventListener('click', async () => {
  const g = groups();
  if (!g) return;
  const file = tool.files[0];
  tool.begin('나누는 중…');
  try {
    const { PDFDocument } = await getPdfLib();
    const src = await openForEdit(await bytesOf(file), file.name);
    const base = baseName(file.name);
    const outs = [];
    for (let i = 0; i < g.length; i++) {
      tool.progress(i / g.length, `나누는 중… (${i + 1}/${g.length})`);
      const doc = await PDFDocument.create();
      const pages = await doc.copyPages(src, g[i].map((p) => p - 1));
      pages.forEach((p) => doc.addPage(p));
      const label = g[i].length > 1 ? `${g[i][0]}-${g[i].at(-1)}` : `${g[i][0]}`;
      outs.push({ name: `${base}_${mode() === 'pick' ? '추출' : label}.pdf`, data: await doc.save({ useObjectStreams: true }) });
    }
    if (outs.length === 1) {
      tool.done({ blob: new Blob([outs[0].data], { type: 'application/pdf' }), name: outs[0].name, info: `${g[0].length}쪽`, pdf: true });
    } else {
      tool.progress(0.97, 'ZIP으로 묶는 중…');
      tool.done({ blob: await makeZip(outs), name: `${base}_나눔.zip`, info: `PDF ${outs.length}개 (ZIP)` });
    }
  } catch (e) {
    tool.fail(e);
  }
});

export { show, hide };

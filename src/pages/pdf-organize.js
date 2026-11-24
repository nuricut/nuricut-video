// 페이지 정리: 순서 바꾸기·회전·삭제·빈 쪽 넣기
// 바뀐 쪽은 표시(이동·회전·빈 쪽)를 달고, 위쪽에 변경 사항 요약을 보여 줌
import { $, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, pageGrid, makeSortable, createSelection, toBlob, baseName } from '../lib/pdf.js';

const grid = $('pages');
grid.classList.add('picking');
let view = null;
let deleted = 0;

// 변경 사항 요약 줄 (도구 버튼과 쪽 미리보기 사이)
const log = document.createElement('div');
log.className = 'change-log';
log.hidden = true;
grid.before(log);

const sel = createSelection(grid, { onChange: () => refresh() });

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    deleted = 0;
    pageGrid(grid, view, { handle: true }).forEach((d) => {
      d.dataset.rot = 0;
      d.insertAdjacentHTML('beforeend', '<span class="marks"></span>');
    });
    sel.clear();
    refresh();
  },
  onReset: () => { view?.destroy(); view = null; },
});

const all = () => [...grid.querySelectorAll('.pg')];
/** 고른 쪽 (화면 순서대로) */
const selected = () => { const s = new Set(sel.list); return all().filter((d) => s.has(d)); };

const MARK = { blank: ['빈 쪽 추가', 'blank'], moved: ['이동', 'moved'], rot: (r) => [`회전 ${r > 180 ? `왼쪽 ${360 - r}` : `오른쪽 ${r}`}°`, 'rot'] };

function refresh() {
  const items = all();
  let nMoved = 0, nRot = 0, nBlank = 0;
  items.forEach((d, i) => {
    const r = +d.dataset.rot;
    d.querySelector('.no').textContent = `${i + 1}`;
    const c = d.querySelector('.sheet canvas');
    if (c) c.style.transform = `rotate(${r}deg)${r % 180 ? ' scale(.76)' : ''}`;
    // 바뀐 내용 표시
    const marks = [];
    if (d.dataset.page === 'blank') { marks.push(MARK.blank); nBlank++; }
    if (d.classList.contains('moved')) { marks.push(MARK.moved); nMoved++; }
    if (r) { marks.push(MARK.rot(r)); nRot++; }
    d.classList.toggle('changed', marks.length > 0);
    d.dataset.mark = marks[0]?.[1] || '';
    d.querySelector('.marks').innerHTML = marks.map(([t, k]) => `<span class="mk ${k}">${t}</span>`).join('');
  });
  const parts = [];
  if (nMoved) parts.push(`<span class="mk moved">이동 ${nMoved}</span>`);
  if (nRot) parts.push(`<span class="mk rot">회전 ${nRot}</span>`);
  if (nBlank) parts.push(`<span class="mk blank">빈 쪽 ${nBlank}</span>`);
  if (deleted) parts.push(`<span class="mk del">삭제 ${deleted}</span>`);
  log.hidden = !parts.length;
  log.innerHTML = `<b>변경 사항</b>${parts.join('')}`;

  const n = sel.list.length;
  ['rot-l', 'rot-r', 'del'].forEach((id) => ($(id).disabled = !n));
  $('sel-all').textContent = n && n === items.length ? '선택 해제' : '전체 선택';
  const f = tool.files[0];
  $('work-title').textContent = f ? `${f.name} · ${items.length}쪽` : '';
  $('start').textContent = `PDF 저장 (${items.length}쪽)`;
  $('start').disabled = !items.length;
}

// 쪽을 누르면 고르기 (끌기가 끝난 직후의 클릭은 무시됨)
grid.addEventListener('click', (e) => {
  const d = e.target.closest('.pg');
  if (!d || e.target.closest('.handle')) return;
  sel.toggle(d);
});

// 쪽 어디를 잡아도 끌 수 있음 (터치는 꾹 누른 뒤 끌기)
makeSortable(grid, { item: '.pg', handle: '.handle', anywhere: true, onEnd: refresh, markMoved: true });

$('sel-all').addEventListener('click', () => {
  const items = all();
  if (sel.list.length === items.length) sel.clear();
  else sel.set(items);
});
const rotate = (deg) => {
  selected().forEach((d) => {
    d.dataset.rot = (((+d.dataset.rot + deg) % 360) + 360) % 360;
    d.classList.remove('flash'); void d.offsetWidth; d.classList.add('flash');
  });
  refresh();
};
$('rot-l').addEventListener('click', () => rotate(-90));
$('rot-r').addEventListener('click', () => rotate(90));
$('del').addEventListener('click', () => {
  const s = selected();
  if (s.length === all().length) return tool.showError('모든 쪽을 지울 수는 없어요. 최소 한 쪽은 남겨 주세요.');
  deleted += s.filter((d) => d.dataset.page !== 'blank').length;
  s.forEach((d) => d.remove());
  sel.render();
});
$('blank').addEventListener('click', () => {
  const d = document.createElement('div');
  d.className = 'pg flash';
  d.dataset.page = 'blank';
  d.dataset.rot = 0;
  d.dataset.key = 'blank' + Date.now();
  d.innerHTML = '<span class="handle" title="끌어서 순서 바꾸기">⠿</span><span class="check"></span><div class="sheet"><div class="blank-page"></div></div><span class="no"></span><span class="marks"></span>';
  const last = selected().at(-1);
  if (last) last.after(d);
  else grid.append(d);
  refresh();
  d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
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

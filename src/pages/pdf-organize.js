// 페이지 정리: 순서 바꾸기·회전·삭제·빈 쪽 넣기
// 바뀐 쪽은 표시(이동·회전·빈 쪽)를 달고, 위쪽에 변경 사항 요약 + 되돌리기·처음 상태로 버튼
import { $, m, pagesText, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, pageGrid, makeSortable, createSelection, toBlob, baseName } from '../lib/pdf.js';
import { iconSvg } from '../lib/pdf-icons.js';

const grid = $('pages');
grid.classList.add('picking');
let view = null;
let deleted = 0;

/* ---------- 변경 사항 줄 (요약 + 되돌리기·처음 상태로) ---------- */
const log = document.createElement('div');
log.className = 'change-log';
log.innerHTML = `<span class="sum"></span><span class="hist">
  <button id="undo" type="button" title="${m('undoTitle')}"><span class="ico bare">${iconSvg('undo')}</span>${m('undo')}</button>
  <button id="reset" type="button" title="${m('resetTitle')}"><span class="ico bare">${iconSvg('reset')}</span>${m('reset')}</button></span>`;
grid.before(log);

// 'N쪽 선택됨'은 변경 사항 줄 가운데(되돌리기 버튼 왼쪽)에 표시
const sel = createSelection(grid, { onChange: () => refresh(), mount: (chip) => log.querySelector('.hist').before(chip) });

/* ---------- 되돌리기 기록 ----------
   칸 요소는 지워도 버리지 않고 보관해 두었다가 되돌릴 때 다시 붙임 (썸네일 다시 그릴 필요 없음) */
const pool = new Map(); // key → 칸 요소
let history = [];
let initial = null;
const snapshot = () => ({ items: all().map((d) => ({ key: d.dataset.key, rot: d.dataset.rot, moved: d.classList.contains('moved') })), deleted });
function restore(s) {
  const els = s.items.map((x) => {
    const d = pool.get(x.key);
    d.dataset.rot = x.rot;
    d.classList.toggle('moved', x.moved);
    d.classList.remove('placeholder', 'moved-pop', 'flash');
    d.style.transform = '';
    return d;
  });
  grid.replaceChildren(...els);
  deleted = s.deleted;
  sel.clear();
  refresh();
}
function record() {
  history.push(snapshot());
  if (history.length > 200) history.shift();
}
function undo() { if (history.length) restore(history.pop()); }
function reset() { if (initial && history.length) { history = []; restore(initial); } }

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    view?.destroy();
    view = await openForView(await bytesOf(file));
    deleted = 0;
    pool.clear();
    history = [];
    pageGrid(grid, view, { handle: true }).forEach((d) => {
      d.dataset.rot = 0;
      d.insertAdjacentHTML('beforeend', '<span class="marks"></span>');
      pool.set(d.dataset.key, d);
    });
    initial = snapshot();
    sel.clear();
    refresh();
  },
  onReset: () => { view?.destroy(); view = null; },
});

const all = () => [...grid.querySelectorAll('.pg')];
/** 고른 쪽 (화면 순서대로) */
const selected = () => { const s = new Set(sel.list); return all().filter((d) => s.has(d)); };

const rotLabel = (r) => (r === 180 ? '↻ 180°' : r === 90 ? '↻ 90°' : '↺ 90°');
const rotTitle = (r) => m(r === 180 ? 'rot180' : r === 90 ? 'rotR' : 'rotL');

function refresh() {
  const items = all();
  let nMoved = 0, nRot = 0, nBlank = 0;
  items.forEach((d, i) => {
    const r = +d.dataset.rot;
    d.querySelector('.no').textContent = `${i + 1}`;
    const c = d.querySelector('.sheet canvas');
    if (c) c.style.transform = `rotate(${r}deg)${r % 180 ? ' scale(.76)' : ''}`;
    // 바뀐 내용 표시 [글자, 종류, 설명]
    const marks = [];
    if (d.dataset.page === 'blank') { marks.push([m('mkBlank'), 'blank', m('mkBlankTitle')]); nBlank++; }
    if (d.classList.contains('moved')) { marks.push([m('mkMoved'), 'moved', m('mkMovedTitle')]); nMoved++; }
    if (r) { marks.push([rotLabel(r), 'rot', rotTitle(r)]); nRot++; }
    d.classList.toggle('changed', marks.length > 0);
    d.dataset.mark = marks[0]?.[1] || '';
    d.querySelector('.marks').innerHTML = marks.map(([t, k, title]) => `<span class="mk ${k}" title="${title}">${t}</span>`).join('');
  });
  const parts = [];
  if (nMoved) parts.push(`<span class="mk moved">${m('sumMoved', { n: nMoved })}</span>`);
  if (nRot) parts.push(`<span class="mk rot">${m('sumRot', { n: nRot })}</span>`);
  if (nBlank) parts.push(`<span class="mk blank">${m('sumBlank', { n: nBlank })}</span>`);
  if (deleted) parts.push(`<span class="mk del">${m('sumDel', { n: deleted })}</span>`);
  log.querySelector('.sum').innerHTML = parts.length ? `<b>${m('changes')}</b>${parts.join('')}` : `<span class="empty">${m('noChanges')}</span>`;
  $('undo').disabled = !history.length;
  $('reset').disabled = !history.length;

  const n = sel.list.length;
  ['rot-l', 'rot-r', 'del'].forEach((id) => ($(id).disabled = !n));
  $('sel-all').textContent = n && n === items.length ? m('deselectAll') : m('selectAll');
  const f = tool.files[0];
  $('work-title').textContent = f ? m('fileTitle', { name: f.name, n: items.length }) : '';
  $('start').textContent = m('saveBtn', { n: items.length });
  $('start').disabled = !items.length;
}

// 쪽을 누르면 고르기 (끌기가 끝난 직후의 클릭은 무시됨)
grid.addEventListener('click', (e) => {
  const d = e.target.closest('.pg');
  if (!d || e.target.closest('.handle')) return;
  sel.toggle(d);
});

// 쪽 어디를 잡아도 끌 수 있음 (터치는 꾹 누른 뒤 끌기). 여러 쪽을 골라 둔 상태면 고른 쪽 전체가 함께 이동
makeSortable(grid, {
  item: '.pg',
  handle: '.handle',
  anywhere: true,
  markMoved: true,
  group: (el) => (sel.list.length > 1 && sel.list.includes(el) ? selected() : [el]),
  onStart: record,
  onEnd: (keys, { moved }) => {
    if (!moved) history.pop(); // 제자리에 놓았으면 기록하지 않음
    sel.clear(); // 옮긴 뒤에는 선택 해제
    refresh();
  },
});

$('sel-all').addEventListener('click', () => {
  const items = all();
  if (sel.list.length === items.length) sel.clear();
  else sel.set(items);
});
const rotate = (deg) => {
  record();
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
  if (s.length === all().length) return tool.showError(m('cantDeleteAll'));
  record();
  deleted += s.filter((d) => d.dataset.page !== 'blank').length;
  s.forEach((d) => d.remove());
  sel.render();
});
$('blank').addEventListener('click', () => {
  record();
  const d = document.createElement('div');
  d.className = 'pg flash';
  d.dataset.page = 'blank';
  d.dataset.rot = 0;
  d.dataset.key = 'blank' + Date.now() + Math.random().toString(36).slice(2, 6);
  d.innerHTML = `<span class="handle" title="${m('dragTip')}">⠿</span><span class="check"></span><div class="sheet"><div class="blank-page"></div></div><span class="no"></span><span class="marks"></span>`;
  pool.set(d.dataset.key, d);
  const last = selected().at(-1);
  if (last) last.after(d);
  else grid.append(d);
  refresh();
  d.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
$('undo').addEventListener('click', undo);
$('reset').addEventListener('click', reset);
// Ctrl+Z (맥은 Cmd+Z)로도 되돌리기
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z' && !$('work').hidden && !e.target.closest('input, textarea')) {
    e.preventDefault();
    undo();
  }
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const items = all();
  tool.begin(m('saving'));
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
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxOrganized')}.pdf`, info: pagesText(items.length), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

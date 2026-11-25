// 텍스트 추출: PDF 안의 글자를 TXT로 (스캔본처럼 글자가 그림인 PDF는 불가)
import { $, m, UserError, createPdfTool, openForView, bytesOf, pageGrid, createSelection, baseName } from '../lib/pdf.js';

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

function update() {
  const f = tool.files[0];
  const n = sel.list.length;
  $('work-title').textContent = f ? m('fileTitle', { name: f.name, n: items.length }) : '';
  $('start').textContent = n ? m('textBtnSel', { n }) : m('textBtnAll', { n: items.length });
}

/** 한 쪽의 글자를 읽는 순서대로 이어 붙이기 */
async function pageText(no) {
  const page = await view.getPage(no);
  const tc = await page.getTextContent();
  let out = '';
  for (const it of tc.items) {
    if (!('str' in it)) continue;
    out += it.str + (it.hasEOL ? '\n' : '');
  }
  page.cleanup();
  return out.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

// 결과 화면에 글자 미리보기 + 복사 버튼
const box = document.createElement('div');
box.className = 'text-result';
box.innerHTML = `<textarea id="text-out" class="text-input" rows="10" readonly></textarea><button id="copy" class="btn-small" type="button">${m('copy')}</button>`;
$('result-info').after(box);
$('copy').addEventListener('click', async () => {
  const ta = $('text-out');
  try { await navigator.clipboard.writeText(ta.value); } catch { ta.select(); document.execCommand('copy'); }
  $('copy').textContent = m('copied');
  setTimeout(() => ($('copy').textContent = m('copy')), 1800);
});

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const s = new Set(sel.list);
  const pages = items.filter((d) => !s.size || s.has(d)).map((d) => +d.dataset.page);
  const sep = $('sep').checked;
  tool.begin(m('textExtracting', { i: 0, n: pages.length }));
  try {
    const parts = [];
    for (let i = 0; i < pages.length; i++) {
      tool.progress(i / pages.length, m('textExtracting', { i: i + 1, n: pages.length }));
      const t = await pageText(pages[i]);
      parts.push(sep ? `${m('pageSep', { n: pages[i] })}\n${t}` : t);
    }
    const text = parts.join(sep ? '\n\n' : '\n\n').trim();
    const chars = text.replace(/\s|---.*---/g, '').length;
    if (!chars) throw new UserError(m('textNone'));
    $('text-out').value = text;
    // 메모장에서 한글이 깨지지 않게 BOM을 붙여 UTF-8로 저장
    const blob = new Blob(['﻿' + text.replace(/\n/g, '\r\n')], { type: 'text/plain;charset=utf-8' });
    tool.done({ blob, name: `${baseName(file.name)}.txt`, info: m('textInfo', { n: pages.length, c: chars.toLocaleString() }) });
  } catch (e) {
    tool.fail(e);
  }
});

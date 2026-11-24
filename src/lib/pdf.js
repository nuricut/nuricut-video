// PDF 도구 공통: 파일 받기·기억, PDF 열기/그리기, 진행·결과 화면, 끌어서 순서 바꾸기, ZIP
// 모든 처리는 브라우저 안에서만 이루어지고, 파일은 이 기기 밖으로 나가지 않습니다.
import { $, show, hide, formatSize, track } from './common.js';
import { lang } from './i18n.js';
import { renderIcons } from './pdf-icons.js';

export { $, show, hide, formatSize, track };

/* ---------- 문구 (지금은 한국어만, 다른 언어는 공개 전에 추가) ---------- */
const MSG = {
  ko: {
    onlyPdf: 'PDF 파일만 넣을 수 있어요.',
    onlyImage: 'JPG·PNG·WebP 같은 이미지 파일만 넣을 수 있어요.',
    encrypted: '"{name}"은(는) 암호가 걸린 PDF라 아직 열 수 없어요.',
    broken: '"{name}"을(를) 열 수 없어요. 손상된 PDF일 수 있어요.',
    failed: '처리에 실패했어요. 다른 파일로 다시 시도해 주세요.',
    loading: 'PDF 여는 중…',
    working: '처리 중…',
    pages: '{n}쪽',
    done: '✓ 완성! {info}',
    restored: '이전에 넣은 파일을 불러왔어요.',
  },
};
export function m(key, vars = {}) {
  const s = (MSG[lang] || MSG.ko)[key] ?? MSG.ko[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? '').toString());
}

/* ---------- 라이브러리 (필요할 때만 불러오기) ---------- */
let pdfjsPromise;
export function getPdfjs() {
  pdfjsPromise ??= (async () => {
    const pdfjs = await import('pdfjs-dist');
    const { default: workerUrl } = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
    pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
    return pdfjs;
  })();
  return pdfjsPromise;
}
export const getPdfLib = () => import('pdf-lib');

/** 화면에 그리기용 PDF 열기 (pdf.js). bytes는 복사해서 넘겨 원본이 손상되지 않게 함 */
export async function openForView(bytes) {
  const pdfjs = await getPdfjs();
  return pdfjs.getDocument({
    data: bytes.slice(0),
    cMapUrl: '/pdfjs/cmaps/',
    cMapPacked: true,
    standardFontDataUrl: '/pdfjs/standard_fonts/',
  }).promise;
}

/** 편집용 PDF 열기 (pdf-lib). 암호·손상 PDF는 알아보기 쉬운 메시지로 */
export async function openForEdit(bytes, name) {
  const { PDFDocument } = await getPdfLib();
  try {
    return await PDFDocument.load(bytes, { updateMetadata: false });
  } catch (e) {
    if (/encrypt/i.test(e?.message || '') || e?.name === 'EncryptedPDFError') throw new UserError(m('encrypted', { name }));
    throw new UserError(m('broken', { name }));
  }
}

export class UserError extends Error {}

/** PDF 한 쪽을 지정한 폭의 canvas로 그리기 */
export async function renderPage(pdf, pageNo, width, { scale: fixedScale } = {}) {
  const page = await pdf.getPage(pageNo);
  const base = page.getViewport({ scale: 1 });
  const scale = fixedScale ?? width / base.width;
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  page.cleanup();
  return canvas;
}

/** 썸네일: 화면 선명도를 위해 기기 배율만큼 크게 그림 */
export function renderThumb(pdf, pageNo, cssWidth = 120) {
  return renderPage(pdf, pageNo, cssWidth * Math.min(2, window.devicePixelRatio || 1));
}

/* ---------- 파일 기억 (탭을 옮겨도 유지) ----------
   IndexedDB는 이 브라우저 안에만 저장되는 공간입니다. 서버로 가지 않습니다. */
const DB = 'nuricut-pdf';
function db() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => req.result.createObjectStore('kv');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function kv(mode, fn) {
  try {
    const d = await db();
    return await new Promise((resolve, reject) => {
      const tx = d.transaction('kv', mode);
      const r = fn(tx.objectStore('kv'));
      tx.oncomplete = () => resolve(r?.result);
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    return undefined; // 사생활 보호 모드 등에서 저장이 막혀도 도구는 그대로 동작
  }
}
export async function saveFiles(key, files) {
  const list = files.map((f) => ({ name: f.name, type: f.type, blob: f instanceof Blob ? f : f.blob }));
  await kv('readwrite', (s) => s.put(list, key));
}
export async function loadFiles(key) {
  const list = await kv('readonly', (s) => s.get(key));
  if (!Array.isArray(list)) return [];
  return list.map((x) => new File([x.blob], x.name, { type: x.type }));
}
export const clearFiles = (key) => kv('readwrite', (s) => s.delete(key));

/* ---------- 파일 종류 ---------- */
export const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
export const isImage = (f) => /^image\/(jpeg|png|webp|gif|bmp|avif)$/.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name);

/* ---------- ZIP 묶기 (이미 압축된 PDF·이미지라 '보관'만) ---------- */
export async function makeZip(entries) {
  const { zipSync } = await import('fflate');
  const files = {};
  const used = new Set();
  for (const { name, data } of entries) {
    let n = name, i = 2;
    while (used.has(n)) n = name.replace(/(\.[^.]+)$/, ` (${i++})$1`);
    used.add(n);
    files[n] = [data instanceof Uint8Array ? data : new Uint8Array(data), { level: 0 }];
  }
  return new Blob([zipSync(files)], { type: 'application/zip' });
}

/** "1-3, 5, 8-" 같은 쪽 범위를 [[1,2,3],[5],[8..max]]로. 잘못되면 null */
export function parseRanges(text, max) {
  const groups = [];
  for (const part of text.split(/[,，、\s]+/).filter(Boolean)) {
    const mm = part.match(/^(\d+)?\s*[-~–]\s*(\d+)?$|^(\d+)$/);
    if (!mm) return null;
    let a, b;
    if (mm[3]) a = b = +mm[3];
    else { a = mm[1] ? +mm[1] : 1; b = mm[2] ? +mm[2] : max; }
    if (a < 1 || b > max || a > b) return null;
    groups.push(Array.from({ length: b - a + 1 }, (_, i) => a + i));
  }
  return groups.length ? groups : null;
}

export const baseName = (name) => name.replace(/\.[^.]+$/, '');

/* ---------- 끌어서 순서 바꾸기 (마우스·터치 공통, 손잡이로만 시작) ---------- */
// - 끄는 동안: 흐린 복사본이 손가락/마우스를 따라오고, 원래 자리는 점선 빈칸으로 표시
// - 다른 칸들은 순간이동하지 않고 부드럽게 미끄러져 자리를 바꿈
// - 놓으면 복사본이 새 자리로 내려앉고, markMoved면 옮긴 칸에 테두리 표시
const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** 칸 위치가 바뀔 때 미끄러지듯 움직이게 (FLIP 방식) */
function slide(els, mutate) {
  const before = new Map(els.map((n) => [n, n.getBoundingClientRect()]));
  mutate();
  if (reduceMotion()) return;
  for (const n of els) {
    const a = before.get(n), b = n.getBoundingClientRect();
    const dx = a.left - b.left, dy = a.top - b.top;
    if (!dx && !dy) continue;
    n.style.transition = 'none';
    n.style.transform = `translate(${dx}px, ${dy}px)`;
    requestAnimationFrame(() => {
      n.style.transition = 'transform .24s cubic-bezier(.2, .8, .2, 1)';
      n.style.transform = '';
      n.addEventListener('transitionend', () => { n.style.transition = ''; }, { once: true });
    });
  }
}

/** 끄는 칸의 흐린 복사본 (canvas 그림까지 복사) */
function makeGhost(el) {
  const r = el.getBoundingClientRect();
  const g = el.cloneNode(true);
  const src = el.querySelectorAll('canvas'), dst = g.querySelectorAll('canvas');
  dst.forEach((c, i) => { c.width = src[i].width; c.height = src[i].height; c.getContext('2d').drawImage(src[i], 0, 0); });
  g.classList.add('drag-ghost');
  g.classList.remove('sel', 'moved');
  Object.assign(g.style, { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px' });
  document.body.append(g);
  return { g, r };
}

export function makeSortable(container, { item, handle, onEnd, markMoved = false, anywhere = false }) {
  let drag = null;
  let pending = null; // anywhere 모드: 클릭인지 끌기인지 아직 모르는 상태
  let skipClick = false;
  const items = () => [...container.querySelectorAll(item)];

  function start(el, e, captureEl) {
    const { g, r } = makeGhost(el);
    drag = { el, id: e.pointerId, g, dx: e.clientX - r.left, dy: e.clientY - r.top, start: items().indexOf(el) };
    el.classList.add('placeholder');
    container.classList.add('sorting');
    try { captureEl.setPointerCapture(e.pointerId); } catch {}
    moveGhost(e);
  }
  function moveGhost(e) {
    drag.g.style.transform = `translate(${e.clientX - drag.dx - parseFloat(drag.g.style.left)}px, ${e.clientY - drag.dy - parseFloat(drag.g.style.top)}px) scale(1.04) rotate(-1.5deg)`;
  }

  container.addEventListener('pointerdown', (e) => {
    if (e.button > 0 || drag) return;
    const h = handle && e.target.closest(handle);
    const el = e.target.closest(item);
    if (!el || !container.contains(el)) return;
    if (h) { e.preventDefault(); start(el, e, h); return; } // 손잡이: 바로 끌기
    if (!anywhere || e.target.closest('button, a, input, select')) return;
    // 마우스는 6px 넘게 움직이면 끌기, 터치는 0.3초 꾹 누르면 끌기 (그냥 밀면 화면 스크롤)
    pending = { el, e, x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
    if (pending.touch) {
      pending.timer = setTimeout(() => {
        if (!pending) return;
        const p = pending; pending = null;
        navigator.vibrate?.(15);
        start(p.el, p.e, p.el);
      }, 300);
    }
  });
  // 터치로 끄는 중에는 화면이 스크롤되지 않게
  container.addEventListener('touchmove', (e) => { if (drag) e.preventDefault(); }, { passive: false });
  container.addEventListener('click', (e) => { if (skipClick) { skipClick = false; e.stopPropagation(); e.preventDefault(); } }, true);

  container.addEventListener('pointermove', (e) => {
    if (pending && e.pointerId === pending.e.pointerId) {
      const dist = Math.hypot(e.clientX - pending.x, e.clientY - pending.y);
      if (pending.touch) { if (dist > 8) { clearTimeout(pending.timer); pending = null; } return; }
      if (dist > 6) { const p = pending; pending = null; start(p.el, e, p.el); drag.dx = p.x - p.el.getBoundingClientRect().left; drag.dy = p.y - p.el.getBoundingClientRect().top; }
      else return;
    }
    if (!drag || e.pointerId !== drag.id) return;
    moveGhost(e);
    const over = document.elementFromPoint(e.clientX, e.clientY)?.closest(item);
    if (!over || over === drag.el || !container.contains(over) || over.style.transform) return; // 움직이는 중인 칸은 건너뜀
    const r = over.getBoundingClientRect();
    const horizontal = getComputedStyle(container).display.includes('grid') && r.width < container.clientWidth * 0.9;
    const after = horizontal ? e.clientX > r.left + r.width / 2 : e.clientY > r.top + r.height / 2;
    if ((after && over.nextElementSibling === drag.el) || (!after && over.previousElementSibling === drag.el)) return;
    slide(items(), () => over[after ? 'after' : 'before'](drag.el));
  });
  const end = (e) => {
    if (pending && e.pointerId === pending.e.pointerId) { clearTimeout(pending.timer); pending = null; return; } // 그냥 클릭
    if (!drag || e.pointerId !== drag.id) return;
    const { el, g, start } = drag;
    drag = null;
    skipClick = true; // 끌기 끝에 생기는 클릭으로 선택이 바뀌지 않게
    setTimeout(() => (skipClick = false), 350);
    container.classList.remove('sorting');
    const moved = items().indexOf(el) !== start;
    // 복사본을 새 자리로 내려앉힌 뒤 지우기
    const r = el.getBoundingClientRect();
    g.style.transition = reduceMotion() ? 'none' : 'transform .2s ease, opacity .2s ease';
    g.style.transform = `translate(${r.left - parseFloat(g.style.left)}px, ${r.top - parseFloat(g.style.top)}px)`;
    g.style.opacity = '0.4';
    setTimeout(() => {
      g.remove();
      el.classList.remove('placeholder');
      if (moved && markMoved) {
        el.classList.add('moved');
        el.classList.remove('moved-pop');
        void el.offsetWidth;
        el.classList.add('moved-pop');
      }
      onEnd?.(items().map((n) => n.dataset.key), { moved, el });
    }, reduceMotion() ? 0 : 200);
  };
  container.addEventListener('pointerup', end);
  container.addEventListener('pointercancel', end);
}

/* ---------- 도구 페이지 공통 틀 ----------
   HTML의 정해진 id: dropzone, file-input, work, progress-box, status, bar-fill, result, result-info,
   download, continue, again, error */
export function createPdfTool({ kind = 'pdf', key = kind === 'pdf' ? 'pdfs' : 'images', multiple = true, onFiles, onReset }) {
  renderIcons();
  const el = {
    dropzone: $('dropzone'), input: $('file-input'), work: $('work'), progress: $('progress-box'), status: $('status'),
    bar: $('bar-fill'), result: $('result'), resultInfo: $('result-info'), download: $('download'), cont: $('continue'),
    again: $('again'), error: $('error'), add: $('add-files'), clear: $('clear-files'),
  };
  const accept = kind === 'pdf' ? isPdf : isImage;
  let files = [];

  const showError = (msg) => { el.error.textContent = msg; show(el.error); };

  async function setFiles(list, { persist = true } = {}) {
    files = list;
    hide(el.error, el.result, el.progress);
    if (!files.length) { hide(el.work); show(el.dropzone); onReset?.(); if (persist) clearFiles(key); return; }
    hide(el.dropzone);
    show(el.work);
    if (persist) saveFiles(key, files);
    try {
      await onFiles(files);
    } catch (e) {
      console.error(e);
      showError(e instanceof UserError ? e.message : m('failed'));
    }
  }

  function take(list, append) {
    const all = [...list];
    const ok = all.filter(accept);
    if (all.length && !ok.length) return showError(m(kind === 'pdf' ? 'onlyPdf' : 'onlyImage'));
    if (!ok.length) return;
    track('file_selected', { file_type: kind, count: ok.length });
    setFiles(multiple ? (append ? [...files, ...ok] : ok) : [ok[0]]);
  }

  el.input.multiple = multiple;
  el.input.addEventListener('change', (e) => { take(e.target.files, el.input.dataset.append === '1'); el.input.value = ''; el.input.dataset.append = ''; });
  const zone = el.dropzone;
  ['dragenter', 'dragover'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.add('drag'); }));
  ['dragleave', 'drop'].forEach((t) => zone.addEventListener(t, (e) => { e.preventDefault(); zone.classList.remove('drag'); }));
  zone.addEventListener('drop', (e) => take(e.dataTransfer.files, false));
  // 작업 화면에 파일을 떨어뜨려도 추가
  el.work.addEventListener('dragover', (e) => e.preventDefault());
  el.work.addEventListener('drop', (e) => { e.preventDefault(); take(e.dataTransfer.files, multiple); });
  el.add?.addEventListener('click', () => { el.input.dataset.append = '1'; el.input.click(); });
  el.clear?.addEventListener('click', () => setFiles([]));
  el.again?.addEventListener('click', () => { hide(el.result); show(el.work); });

  // 이전 탭에서 넣어 둔 파일 불러오기
  loadFiles(key).then((saved) => { if (saved.length && !files.length) setFiles(multiple ? saved : [saved[0]], { persist: false }); });

  return {
    el,
    get files() { return files; },
    setFiles,
    showError,
    begin(text = m('working')) {
      hide(el.work, el.error, el.result);
      show(el.progress);
      this.progress(0, text);
    },
    progress(ratio, text) {
      el.bar.style.width = Math.round(Math.max(0, Math.min(1, ratio)) * 100) + '%';
      if (text) el.status.textContent = text;
    },
    /** 결과 표시. output: {blob, name, info, pdf(다른 도구로 이어서 쓸 수 있으면 true)} */
    done({ blob, name, info, pdf = false }) {
      hide(el.progress);
      if (el.download._url) URL.revokeObjectURL(el.download._url);
      el.download._url = URL.createObjectURL(blob);
      el.download.href = el.download._url;
      el.download.download = name;
      el.resultInfo.textContent = m('done', { info: `${info} · ${formatSize(blob.size)}` });
      if (el.cont) {
        el.cont.hidden = !pdf;
        el.cont.onclick = async () => {
          await saveFiles('pdfs', [new File([blob], name, { type: 'application/pdf' })]);
          document.querySelector('.pdf-tabs')?.classList.add('pulse');
          el.cont.textContent = el.cont.dataset.doneText || el.cont.textContent;
          el.cont.disabled = true;
          document.querySelector('.pdf-tabs')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };
        el.cont.disabled = false;
        if (el.cont.dataset.text) el.cont.textContent = el.cont.dataset.text;
      }
      show(el.result);
      track('pdf_done', { tool: document.body.dataset.tool });
    },
    fail(e) {
      console.error(e);
      hide(el.progress);
      show(el.work);
      showError(e instanceof UserError ? e.message : m('failed'));
      track('process_error');
    },
  };
}

/** 쪽 미리보기 칸들을 만들고 썸네일을 차례로 채움. 반환: 칸 요소 배열 (1쪽부터) */
export function pageGrid(container, pdf, { handle = false } = {}) {
  container.innerHTML = '';
  const items = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const d = document.createElement('div');
    d.className = 'pg';
    d.dataset.page = i;
    d.dataset.key = i;
    d.innerHTML = `${handle ? '<span class="handle" title="끌어서 순서 바꾸기">⠿</span>' : ''}<span class="check"></span><div class="sheet"></div><span class="no">${i}</span>`;
    container.append(d);
    items.push(d);
  }
  const token = (container._token = Symbol());
  (async () => {
    for (const d of items) {
      if (container._token !== token) return; // 다른 파일로 바뀌면 중단
      try {
        const c = await renderThumb(pdf, +d.dataset.page, 110);
        d.querySelector('.sheet').prepend(c);
      } catch (e) {
        console.warn(e);
      }
    }
  })();
  return items;
}

/** 파일 → ArrayBuffer (캐시) */
const bufCache = new WeakMap();
export async function bytesOf(file) {
  if (!bufCache.has(file)) bufCache.set(file, new Uint8Array(await file.arrayBuffer()));
  return bufCache.get(file);
}

/** PDF 저장 → Blob */
export async function toBlob(doc) {
  const bytes = await doc.save({ useObjectStreams: true });
  return new Blob([bytes], { type: 'application/pdf' });
}

/* ---------- 쪽 여러 개 고르기 ----------
   2개 이상 고르면 고른 순서대로 번호를 달고, 위쪽에 "N쪽 선택됨" 표시. 1개일 때는 체크만 */
export function createSelection(grid, { onChange, unit = '쪽' } = {}) {
  let order = [];
  const chip = document.createElement('div');
  chip.className = 'sel-chip';
  chip.hidden = true;
  grid.before(chip);
  chip.addEventListener('click', (e) => { if (e.target.closest('button')) api.clear(); });
  function render() {
    order = order.filter((el) => el.isConnected);
    const multi = order.length >= 2;
    grid.querySelectorAll('.pg').forEach((el) => {
      const i = order.indexOf(el);
      el.classList.toggle('sel', i >= 0);
      el.classList.toggle('multi', multi && i >= 0);
      const c = el.querySelector('.check');
      if (c) c.textContent = multi && i >= 0 ? i + 1 : '';
    });
    chip.hidden = !multi;
    if (multi) chip.innerHTML = `<span><b>${order.length}</b>${unit} 선택됨</span><button type="button" class="btn-link">선택 해제</button>`;
    onChange?.(order.slice());
  }
  const api = {
    toggle(el) { const i = order.indexOf(el); if (i >= 0) order.splice(i, 1); else order.push(el); render(); },
    set(list) { order = list.slice(); render(); },
    clear() { if (order.length) { order = []; render(); } },
    /** 고른 순서 */
    get list() { return order.filter((el) => el.isConnected); },
    render,
  };
  return api;
}

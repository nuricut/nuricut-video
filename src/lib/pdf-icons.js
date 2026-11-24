// PDF 도구 아이콘 (직접 그린 것): 24×24, 둥근 선, 흰 문서 + 토끼색 포인트 하나
// HTML에 <span class="ico" data-icon="merge"></span> 처럼 두면 그림이 채워집니다.

const DOC = '<path d="M6.5 3h7.2L18 7.3V20a1 1 0 0 1-1 1H6.5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M13.5 3v4.5H18"/>';

export const ICONS = {
  merge: '<path d="M9 2.5h6.5L19 6v10.5"/><path d="M4.5 6.5h7.2l3.8 3.8V20a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V7.5a1 1 0 0 1 1-1z"/><path class="a" d="M9.5 13v5M7 15.5h5"/>',
  split: DOC + '<path class="a" d="M2.5 13.5h19" stroke-dasharray="2.2 2.4"/><path class="a" d="M9 10.5l3 3 3-3"/>',
  organize: '<rect x="3.5" y="3" width="7" height="8" rx="1.2"/><rect x="13.5" y="3" width="7" height="8" rx="1.2"/><rect x="3.5" y="13" width="7" height="8" rx="1.2"/><rect class="a" x="13.5" y="13" width="7" height="8" rx="1.2"/>',
  img2pdf: DOC + '<circle class="a" cx="9.6" cy="11.3" r="1.4"/><path class="a" d="M8 17.5l2.6-2.6 2 2 1.4-1.4 1.6 1.6"/>',
  pdf2img: '<rect x="3" y="4.5" width="18" height="15" rx="2"/><circle class="a" cx="8.5" cy="9.5" r="1.6"/><path class="a" d="M5.5 17l4.5-4.5 3 3 2-2 3.5 3.5"/>',
  text: DOC + '<path class="a" d="M8.8 11h6.4M12 11v6.5"/>',
  number: DOC + '<path d="M8.5 9.5h7M8.5 12.5h5"/><rect class="a" x="9.3" y="15" width="5.4" height="3.8" rx="1.9"/>',
  watermark: DOC + '<path class="a" d="M12 10c1.9 2.2 2.9 3.8 2.9 5a2.9 2.9 0 0 1-5.8 0c0-1.2 1-2.8 2.9-5z"/>',
  sign: DOC + '<path class="a" d="M8 16.3c1-2.6 1.9-2.7 2.4-.4.4 1.8 1.2 1.7 2.1-.3.7-1.4 1.4-1.3 1.9.6"/><path d="M8 18.8h7.5"/>',
  crop: '<path d="M7 2.5V17h14.5"/><path class="a" d="M2.5 7H17v14.5"/>',
  compress: DOC + '<path class="a" d="M12 8.5v3.2M10 10l2 1.8 2-1.8M12 18.8v-3.2M10 17.2l2-1.8 2 1.8"/>',
  clean: DOC + '<path class="a" d="M14.5 12.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/><path class="a" d="M9.3 10.5l.4 1 1 .4-1 .4-.4 1-.4-1-1-.4 1-.4z"/>',
  // 동영상 도구 (흰 영상 화면 + 토끼색 포인트)
  v_compress: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path class="a" d="M6.3 12h3.4M8.2 10.1 10 12l-1.8 1.9M17.7 12h-3.4M15.8 10.1 14 12l1.8 1.9"/>',
  v_shorts: '<rect x="7.3" y="2.5" width="9.4" height="19" rx="2.3"/><path d="M10.6 19h2.8"/><path class="a" d="M10.9 9.2v4.6l3.7-2.3z"/>',
  v_gif: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path class="a" d="M12 12c-1.2-1.5-2-2.1-2.9-2.1a2.1 2.1 0 0 0 0 4.2c.9 0 1.7-.6 2.9-2.1s2-2.1 2.9-2.1a2.1 2.1 0 0 1 0 4.2c-.9 0-1.7-.6-2.9-2.1z"/>',
  v_thumb: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path class="a" d="M6.4 9.6V8.2h1.4M16.2 8.2h1.4v1.4M17.6 14.4v1.4h-1.4M7.8 15.8H6.4v-1.4"/><path d="M11 10.4v3.2l2.6-1.6z"/>',
  v_trim: '<rect x="3" y="5" width="18" height="14" rx="2.6"/><path class="a" d="M8.5 8.5v7M15.5 8.5v7"/><path d="M8.5 12h7" stroke-dasharray="1.6 2"/>',
  // 사용방법 4단계
  s_pick: '<path d="M4 15.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3.5"/><path class="a" d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/>',
  s_options: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle class="a" cx="15" cy="7" r="2.2"/><circle class="a" cx="9" cy="17" r="2.2"/>',
  s_start: '<circle cx="12" cy="12" r="8.5"/><path class="a" d="M10.3 8.8v6.4l5.2-3.2z"/>',
  s_done: '<path d="M4 15.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3.5"/><path class="a" d="M12 4v11M7.5 10.5 12 15l4.5-4.5"/>',
  // 화면 조작용 작은 아이콘
  top: '<path class="a" d="M12 19V6M6.5 11.5 12 6l5.5 5.5"/>',
  undo: '<path class="a" d="M9 5.5 4.5 10 9 14.5"/><path class="a" d="M4.5 10H14a4.75 4.75 0 0 1 0 9.5h-3"/>',
  reset: '<path class="a" d="M4 12a8 8 0 1 0 2.4-5.7"/><path class="a" d="M4 4v4.5h4.5"/>',
  rotateL: '<path class="a" d="M5 12a7 7 0 1 0 2.1-5"/><path class="a" d="M5 4.5V8h3.5"/>',
  rotateR: '<path class="a" d="M19 12a7 7 0 1 1-2.1-5"/><path class="a" d="M19 4.5V8h-3.5"/>',
  trash: '<path d="M4.5 7h15M9.5 7V4.5h5V7M7 7l.8 13h8.4L17 7"/><path class="a" d="M10.5 11v5.5M13.5 11v5.5"/>',
  blank: DOC + '<path class="a" d="M12 11v6M9 14h6"/>',
  upload: '<path d="M4 15.5V19a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 20 19v-3.5"/><path class="a" d="M12 15V4M7.5 8.5L12 4l4.5 4.5"/>',
};

const GRADIENT = '<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs><linearGradient id="nuri-grad" gradientUnits="userSpaceOnUse" x1="3" y1="3" x2="21" y2="21"><stop offset="0" stop-color="#ff6fae"/><stop offset=".5" stop-color="#ffb38a"/><stop offset="1" stop-color="#e59bff"/></linearGradient></defs></svg>';

export function iconSvg(name) {
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;
}

/** 페이지 안의 [data-icon] 요소에 아이콘을 채웁니다. */
export function renderIcons(root = document) {
  if (!document.getElementById('nuri-grad')) document.body.insertAdjacentHTML('afterbegin', GRADIENT);
  root.querySelectorAll('[data-icon]').forEach((el) => {
    if (!el.firstElementChild) el.innerHTML = iconSvg(el.dataset.icon);
  });
}

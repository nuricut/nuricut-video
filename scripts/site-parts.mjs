// 여러 페이지가 함께 쓰는 HTML 조각 (로고 등). PDF 페이지 생성기와 로고 일괄 교체에 사용.

export const HOME = { en: '/', ko: '/ko/', zh: '/zh/', ja: '/ja/' };
// PDF 페이지가 번역된 언어 (아직 번역 전인 언어는 한국어 PDF 페이지로 연결)
export const PDF_READY = ['ko'];
export const pdfHome = (lang) => (PDF_READY.includes(lang) ? `${HOME[lang]}pdf/` : '/ko/pdf/');

const TIP = {
  en: { videoHere: "You're using the <b>video tools</b>", videoGo: 'Switch to video tools?', videoSub: 'Compress · Shorts · GIF · Thumbnails',
        pdfHere: "You're using the <b>PDF tools</b>", pdfGo: 'Switch to PDF tools?', pdfSub: 'Merge · Split · Convert · Edit', home: 'Home' },
  ko: { videoHere: '지금 <b>동영상 도구</b>를 보고 있어요', videoGo: '동영상 도구로 이동할까요?', videoSub: '압축 · 쇼츠 변환 · GIF · 썸네일',
        pdfHere: '지금 <b>PDF 도구</b>를 보고 있어요', pdfGo: 'PDF 도구로 이동할까요?', pdfSub: '합치기 · 나누기 · 변환 · 편집', home: '처음으로' },
  zh: { videoHere: '当前正在使用<b>视频工具</b>', videoGo: '切换到视频工具？', videoSub: '压缩 · 竖屏视频 · GIF · 封面',
        pdfHere: '当前正在使用<b>PDF 工具</b>', pdfGo: '切换到 PDF 工具？', pdfSub: '合并 · 拆分 · 转换 · 编辑', home: '首页' },
  ja: { videoHere: 'いま<b>動画ツール</b>を使っています', videoGo: '動画ツールに移動しますか？', videoSub: '圧縮 · ショート · GIF · サムネイル',
        pdfHere: 'いま<b>PDFツール</b>を使っています', pdfGo: 'PDFツールに移動しますか？', pdfSub: '結合 · 分割 · 変換 · 編集', home: 'ホーム' },
};

/** 문장 속 이름 "nuricut.video PDF": 지금 보는 쪽만 토끼색 (링크·툴팁 없음) */
export function brandText(mode) {
  return `<span class="brand-text">nuricut<span class="bt-video${mode === 'video' ? ' is-on' : ''}">.video</span> <span class="bt-pdf${mode === 'pdf' ? ' is-on' : ''}">PDF</span></span>`;
}

/** 로고: mode = 'video' | 'pdf'. 지금 보는 쪽은 토끼색, 다른 쪽은 회색 + 이동 툴팁 */
export function brandHtml(lang, mode) {
  const t = TIP[lang];
  const home = mode === 'pdf' ? pdfHome(lang) : HOME[lang];
  const seg = (k, label) => {
    const on = k === mode;
    const tip = on
      ? `<span class="brand-tip" role="tooltip">${t[k + 'Here']}</span>`
      : `<span class="brand-tip" role="tooltip"><span class="go">${t[k + 'Go']}</span><small>${t[k + 'Sub']}</small></span>`;
    return on
      ? `<span class="brand-seg ${k} is-on" tabindex="0" aria-current="page">${label}${tip}</span>`
      : `<a class="brand-seg ${k}" href="${k === 'pdf' ? pdfHome(lang) : HOME[lang]}">${label}${tip}</a>`;
  };
  return `<div class="brand"><a class="brand-home" href="${home}" aria-label="nuricut.video ${t.home}"><img src="/logo.svg" alt="" width="30" height="30" />nuricut</a>${seg('video', '.video')}${seg('pdf', 'PDF')}</div>`;
}

// 여러 페이지가 함께 쓰는 HTML 조각 (로고 등). PDF 페이지 생성기와 로고 일괄 교체에 사용.

export const HOME = { en: '/', ko: '/ko/', zh: '/zh/', ja: '/ja/' };
// PDF 페이지가 번역된 언어 (아직 번역 전인 언어는 한국어 PDF 페이지로 연결)
export const PDF_READY = ['en', 'ko', 'zh', 'ja'];
export const pdfHome = (lang) => (PDF_READY.includes(lang) ? `${HOME[lang]}pdf/` : '/pdf/');

const TIP = {
  en: { videoHere: "You're using the <b>video tools</b>", videoGo: 'Switch to video tools?', videoSub: 'Compress · Shorts · GIF · Thumbnails',
        pdfHere: "You're using the <b>PDF tools</b>", pdfGo: 'Switch to PDF tools?', pdfSub: 'Merge · Split · Convert · Edit', kidsGo: 'Go to nuricut kids?', kidsSub: '👧 An app made for kids · Stop motion · Pixel art', home: 'Home', videoHome: 'Go to the <b>video tools</b> home', pdfHome: 'Go to the <b>PDF tools</b> home' },
  ko: { videoHere: '지금 <b>동영상 도구</b>를 보고 있어요', videoGo: '동영상 도구로 이동할까요?', videoSub: '압축 · 쇼츠 변환 · GIF · 썸네일',
        pdfHere: '지금 <b>PDF 도구</b>를 보고 있어요', pdfGo: 'PDF 도구로 이동할까요?', pdfSub: '합치기 · 나누기 · 변환 · 편집', kidsGo: '키즈 놀이터로 이동할까요?', kidsSub: '👧 아이들을 위한 앱 · 스톱모션 · 픽셀아트', home: '처음으로', videoHome: '<b>동영상 도구</b> 홈으로 이동', pdfHome: '<b>PDF 도구</b> 홈으로 이동' },
  zh: { videoHere: '当前正在使用<b>视频工具</b>', videoGo: '切换到视频工具？', videoSub: '压缩 · 竖屏视频 · GIF · 封面',
        pdfHere: '当前正在使用<b>PDF 工具</b>', pdfGo: '切换到 PDF 工具？', pdfSub: '合并 · 拆分 · 转换 · 编辑', kidsGo: '要前往儿童乐园吗？', kidsSub: '👧 专为孩子设计的应用 · 定格动画 · 像素画', home: '首页', videoHome: '前往<b>视频工具</b>首页', pdfHome: '前往<b>PDF 工具</b>首页' },
  ja: { videoHere: 'いま<b>動画ツール</b>を使っています', videoGo: '動画ツールに移動しますか？', videoSub: '圧縮 · ショート · GIF · サムネイル',
        pdfHere: 'いま<b>PDFツール</b>を使っています', pdfGo: 'PDFツールに移動しますか？', pdfSub: '結合 · 分割 · 変換 · 編集', kidsGo: 'キッズ広場に移動しますか？', kidsSub: '👧 子どものためのアプリ · コマ撮り · ドット絵', home: 'ホーム', videoHome: '<b>動画ツール</b>のホームへ', pdfHome: '<b>PDFツール</b>のホームへ' },
};

/** 문장 속 이름 "nuricut.video PDF": nuricut. 과 지금 보는 쪽이 토끼색 (링크·툴팁 없음) */
export function brandText(mode, withKids = false) {
  const k = withKids ? ' <span class="bt-kids">&amp; kids</span>' : '';
  return (mode === 'video'
    ? '<span class="brand-text"><span class="is-on">nuricut.video</span> <span class="bt-pdf">PDF</span>'
    : '<span class="brand-text"><span class="is-on">nuricut.</span><span class="bt-video">video</span> <span class="bt-pdf is-on">PDF</span>') + k + '</span>';
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
  return `<div class="brand"><a class="brand-home" href="${home}" aria-label="nuricut.video ${t.home}"><img src="/logo.svg" alt="" width="30" height="30" />nuricut.<span class="brand-tip" role="tooltip">${t[mode + 'Home']}</span></a>${seg('video', 'video')}${seg('pdf', 'PDF')}<a class="brand-seg kids" href="${kidsHome(lang)}"><span class="amp">&amp;</span><span class="kg">kids</span><span class="brand-tip" role="tooltip"><span class="go">${t.kidsGo}</span><small>${t.kidsSub}</small></span></a></div>`;
}

// nuricut kids (4개 언어 모두 있음)
export const KIDS_READY = ["en", "ko", "zh", "ja"];
export const kidsHome = (lang) => (lang === "en" ? "/kids/" : `/${lang}/kids/`);

// 바닥글 "다른 도구" 묶음: 구분선 + 동영상 편집/PDF 편집 + 키즈 놀이터 (각자 고유 그라데이션 + 말풍선)
const XL = {
  en: { video: ["Video editing", "Go to the video tools?", "Compress · Shorts · GIF · Thumbnails"], pdf: ["PDF editing", "Go to the PDF tools?", "Merge · Split · Organize · Convert"], kids: ["Kids playground", "Go to the kids playground?", "Stop motion · Pixel art for kids"], label: "Other tools" },
  ko: { video: ["동영상 편집", "동영상 편집으로 넘어갈까요?", "압축 · 쇼츠 · GIF · 썸네일"], pdf: ["PDF 편집", "PDF 편집으로 넘어갈까요?", "합치기 · 나누기 · 페이지 정리 · 변환"], kids: ["키즈 놀이터", "키즈 놀이터로 넘어갈까요?", "아이들을 위한 스톱모션 · 픽셀아트"], label: "다른 도구" },
  zh: { video: ["视频编辑", "要前往视频编辑吗？", "压缩 · 竖屏视频 · GIF · 封面"], pdf: ["PDF 编辑", "要前往 PDF 编辑吗？", "合并 · 拆分 · 整理页面 · 转换"], kids: ["儿童乐园", "要前往儿童乐园吗？", "给孩子的定格动画 · 像素画"], label: "其他工具" },
  ja: { video: ["動画編集", "動画編集に移動しますか？", "圧縮 · ショート · GIF · サムネイル"], pdf: ["PDF編集", "PDF編集に移動しますか？", "結合 · 分割 · ページ整理 · 変換"], kids: ["キッズ広場", "キッズ広場に移動しますか？", "子ども向けコマ撮り · ドット絵"], label: "ほかのツール" },
};
/** mode = "video"(동영상 페이지) | "pdf"(PDF 페이지): 지금 보는 쪽을 뺀 나머지 두 곳 */
export function footerXLinks(lang, mode) {
  const t = XL[lang];
  const link = (k, href) => `<a class="foot-x ${k}" href="${href}">${t[k][0]}<span class="foot-tip" role="tooltip"><b>${t[k][1]}</b><small>${t[k][2]}</small></span></a>`;
  const items = mode === "pdf" ? [link("video", HOME[lang])] : [link("pdf", pdfHome(lang))];
  items.push(link("kids", kidsHome(lang)));
  return `<!-- x-links --><span class="foot-other" aria-label="${t.label}"><span class="foot-sep" aria-hidden="true"></span>${items.join("")}</span><!-- /x-links -->`;
}

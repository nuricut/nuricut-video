// PDF 도구 페이지 생성기: node scripts/build-pdf-pages.mjs
// 문구(T)를 고치고 다시 실행하면 ko/pdf/*.html 이 새로 만들어집니다. (다른 언어는 T에 추가하면 됨)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandHtml, brandText } from './site-parts.mjs';
import { INTL } from './pdf-texts-intl.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://nuricut.video';
export const STEP_ICONS = ['s_pick', 's_options', 's_start', 's_done'];

/* ---------- 도구 목록 ---------- */
const TOOLS = [
  // [키, 파일, 아이콘, 묶음, 준비됨]
  ['merge', 'merge.html', 'merge', 'arrange', true],
  ['split', 'split.html', 'split', 'arrange', true],
  ['organize', 'organize.html', 'organize', 'arrange', true],
  ['img2pdf', 'images-to-pdf.html', 'img2pdf', 'convert', true],
  ['pdf2img', 'pdf-to-images.html', 'pdf2img', 'convert', true],
  ['text', null, 'text', 'convert', false],
  ['number', null, 'number', 'edit', false],
  ['watermark', null, 'watermark', 'edit', false],
  ['sign', null, 'sign', 'edit', false],
  ['crop', null, 'crop', 'optimize', false],
  ['compress', null, 'compress', 'optimize', false],
  ['clean', null, 'clean', 'optimize', false],
];

/* ---------- 문구 ---------- */
const T = {
  ko: {
    groups: { arrange: '정리', convert: '변환', edit: '편집', optimize: '최적화' },
    tool: {
      merge: ['PDF 합치기', '여러 파일을 하나로', '합치기'],
      split: ['PDF 나누기', '쪽 범위로 분리', '나누기'],
      organize: ['페이지 정리', '순서·회전·삭제', '페이지 정리'],
      img2pdf: ['이미지 → PDF', '사진 여러 장을 PDF로', '이미지→PDF'],
      pdf2img: ['PDF → 이미지', 'JPG·PNG로 저장', 'PDF→이미지'],
      text: ['텍스트 추출', '글자만 TXT로'],
      number: ['쪽 번호', '번호 자동 넣기'],
      watermark: ['워터마크', '글자·로고 넣기'],
      sign: ['서명·도장', '원하는 위치에'],
      crop: ['여백 자르기', '쪽 테두리 정리'],
      compress: ['용량 줄이기', '사진 많은 PDF에 효과적'],
      clean: ['문서 정보 지우기', '작성자 등 숨은 정보 삭제'],
    },
    soon: '곧 추가',
    nav: { hub: 'PDF 도구', guide: '사용방법' },
    hub: {
      title: '무료 PDF 도구 - 합치기·나누기·변환 | nuricut.video',
      desc: 'PDF 합치기, 나누기, 페이지 정리, 이미지를 PDF로, PDF를 이미지로. 설치·가입 없이 브라우저에서 바로, 파일은 서버로 전송되지 않아 안전합니다.',
      h1: 'PDF 도구 모음',
      sub: '합치기·나누기·변환까지, 업로드 없이 브라우저에서',
    },
    page: {
      merge: { title: 'PDF 합치기 - 여러 PDF를 하나로 무료 병합 | nuricut.video', desc: '여러 PDF 파일을 원하는 순서로 하나로 합치세요. 설치·가입 없이 브라우저에서 바로, 파일이 서버로 전송되지 않아 안전합니다.', h1: 'PDF 합치기', sub: '여러 PDF를 원하는 순서대로 하나로' },
      split: { title: 'PDF 나누기 - 쪽 범위로 분리·추출 | nuricut.video', desc: 'PDF를 쪽 범위로 나누거나 한 쪽씩 분리하고, 원하는 쪽만 뽑아내세요. 업로드 없이 브라우저에서 무료로.', h1: 'PDF 나누기', sub: '쪽 범위로 나누거나 원하는 쪽만 뽑기' },
      organize: { title: 'PDF 페이지 정리 - 순서 변경·회전·삭제 | nuricut.video', desc: 'PDF 쪽을 미리 보면서 순서를 바꾸고, 회전하고, 삭제하세요. 빈 쪽 넣기도 가능. 업로드 없이 무료.', h1: '페이지 정리', sub: '쪽을 보면서 순서 바꾸기·회전·삭제' },
      img2pdf: { title: '이미지를 PDF로 변환 - JPG·PNG 여러 장 한 번에 | nuricut.video', desc: 'JPG, PNG 사진 여러 장을 PDF 하나로 만드세요. A4·사진 크기 선택, 여백 조절. 업로드 없이 무료.', h1: '이미지 → PDF', sub: '사진 여러 장을 PDF 하나로' },
      pdf2img: { title: 'PDF를 이미지로 변환 - JPG·PNG 저장 | nuricut.video', desc: 'PDF 쪽을 고화질 JPG·PNG 이미지로 저장하세요. 여러 쪽은 ZIP으로 한 번에. 업로드 없이 무료.', h1: 'PDF → 이미지', sub: 'PDF 쪽을 JPG·PNG 이미지로 저장' },
    },
    drop: { pdf: '여기에 PDF를 끌어다 놓거나 클릭해서 선택', pdfMany: '여기에 PDF 여러 개를 끌어다 놓거나 클릭해서 선택', img: '여기에 사진을 끌어다 놓거나 클릭해서 선택', hintPdf: '파일은 이 기기 밖으로 나가지 않아요', hintImg: 'JPG · PNG · WebP · GIF 여러 장' },
    common: { add: '＋ 추가', clear: '비우기', change: '다른 파일', download: '다운로드', again: '다시 조정하기', cont: '이 결과로 다른 도구 이어서 쓰기', contDone: '✓ 준비됐어요! 위쪽 탭에서 다음 도구를 고르세요', support: '☕ 도움이 되셨나요? 커피 한 잔 후원하기', handle: '⠿ 손잡이를 끌어서 순서를 바꿀 수 있어요' },
    safe: ['파일은 이 기기를 떠나지 않아요', '서버 업로드·저장 없음'],
    free: ['무료', '워터마크 없음', '횟수 제한 없음'],
    merge: { start: 'PDF 합치기' },
    split: { mode: '나누는 방법', range: ['범위로', '1-3, 4-6'], each: ['한 쪽씩', '쪽마다 파일'], pick: ['골라 뽑기', '원하는 쪽만'], rangeLabel: '쪽 범위', rangePh: '예: 1-3, 4-6, 7-', rangeHint: '쉼표로 나눈 묶음마다 파일 하나가 만들어져요. "7-"은 7쪽부터 끝까지.', pickHint: '뽑을 쪽을 눌러서 고르세요.', start: '나누기' },
    organize: { all: '전체 선택', rotL: '왼쪽 회전', rotR: '오른쪽 회전', del: '삭제', blank: '빈 쪽 넣기', hint: '쪽을 눌러 고른 뒤 위 버튼을 누르세요. 쪽을 잡고 끌면 순서가 바뀌어요(휴대폰은 꾹 누른 뒤 끌기). 바뀐 쪽은 색 테두리로 표시돼요.', start: 'PDF 저장' },
    img2pdf: { size: '용지 크기', a4: ['A4', '문서용'], fit: ['사진 크기', '여백 없이 그대로'], letter: ['레터', '미국 용지'], orient: '방향', auto: '자동', portrait: '세로', landscape: '가로', margin: '여백', m0: '없음', m1: '좁게', m2: '보통', start: 'PDF 만들기' },
    pdf2img: { format: '저장 형식', jpg: ['JPG', '가벼움'], png: ['PNG', '선명함'], quality: '화질', q1: ['가볍게', '96dpi'], q2: ['보통', '150dpi'], q3: ['고화질', '300dpi'], pickHint: '저장할 쪽을 눌러서 고르세요. 아무것도 안 고르면 전체를 저장해요.', start: '이미지로 저장' },
    guide: {
      title: 'PDF 도구 사용방법 - 합치기·나누기·정리·변환 | nuricut.video',
      desc: 'nuricut.video PDF 도구로 PDF 합치기, 나누기, 페이지 정리, 이미지를 PDF로, PDF를 이미지로 바꾸는 방법을 단계별로 안내합니다.',
      h1: '{BRAND} 사용방법',
      intro: '모든 PDF 도구는 같은 순서로 사용해요. 위쪽 탭으로 도구를 옮겨 다니며 이어서 작업할 수도 있어요.',
      quick: ['파일 넣기', '옵션 고르기', '시작 누르기', '결과 다운로드'],
      go: '바로가기 →',
      tipLabel: '💡 팁',
      tocTip: '↓ {name} 사용방법으로 이동',
      sections: {
        merge: {
          steps: ['PDF 여러 개를 상자에 끌어다 놓거나, 상자를 눌러 한꺼번에 고릅니다.', '왼쪽 <b>⠿ 손잡이</b>를 끌어서 합칠 순서를 정합니다. 빼고 싶은 파일은 <b>✕</b>를 누르세요.', '빠뜨린 파일은 <b>＋ 추가</b>로 더 넣을 수 있어요.', '<b>PDF 합치기</b>를 누르고 <b>다운로드</b>합니다.'],
          tip: '계약서 본문 뒤에 사업자등록증·통장 사본을 붙여 한 파일로 보낼 때 편해요.',
        },
        split: {
          steps: ['나눌 PDF를 하나 고릅니다. 모든 쪽이 미리보기로 펼쳐져요.', '나누는 방법을 고릅니다: <b>범위로</b>(예: 1-3, 4-6), <b>한 쪽씩</b>(쪽마다 파일), <b>골라 뽑기</b>(원하는 쪽만).', '범위로 나누면 같은 파일로 묶이는 쪽이 같은 색 테두리로 표시돼요.', '<b>나누기</b>를 누르고 다운로드합니다. 파일이 여러 개면 ZIP 하나로 받아요.'],
          tip: '"7-"처럼 끝 번호를 비우면 7쪽부터 마지막 쪽까지예요.',
        },
        organize: {
          steps: ['정리할 PDF를 고릅니다.', '쪽을 눌러 고른 뒤 <b>왼쪽·오른쪽 회전</b>이나 <b>삭제</b>를 누릅니다. <b>전체 선택</b>도 있어요.', '쪽을 잡고 끌어서 순서를 바꿉니다. 휴대폰에서는 꾹 누른 뒤 끌어요. 옮기거나 돌리거나 새로 넣은 쪽은 색 테두리와 표시가 붙어요.', '<b>빈 쪽 넣기</b>를 누르면 고른 쪽 뒤(없으면 맨 끝)에 빈 쪽이 들어가요.', '<b>PDF 저장</b>을 누르고 다운로드합니다.'],
          tip: '스캔하다 거꾸로 들어간 쪽은 오른쪽 회전을 두 번 누르면 바로잡혀요.',
        },
        img2pdf: {
          steps: ['사진(JPG·PNG·WebP·GIF)을 여러 장 고릅니다.', '<b>⠿ 손잡이</b>로 쪽 순서를 정합니다.', '용지 크기(<b>A4</b>·<b>사진 크기</b>·<b>레터</b>), 방향, 여백을 고릅니다. 방향을 <b>자동</b>으로 두면 가로 사진은 가로 용지에 들어가요.', '<b>PDF 만들기</b>를 누르고 다운로드합니다.'],
          tip: '휴대폰으로 찍은 서류 사진을 제출용 PDF로 만들 때 A4 + 여백 좁게를 추천해요.',
        },
        pdf2img: {
          steps: ['이미지로 바꿀 PDF를 고릅니다.', '저장 형식(<b>JPG</b>는 가볍게, <b>PNG</b>는 선명하게)과 화질(96·150·300dpi)을 고릅니다.', '원하는 쪽만 저장하려면 쪽을 눌러 고르세요. 안 고르면 전체를 저장해요.', '<b>이미지로 저장</b>을 누르고 다운로드합니다. 여러 장이면 ZIP으로 받아요.'],
          tip: '인쇄용이면 300dpi, 메신저로 보낼 거면 150dpi가 적당해요.',
        },
      },
      trouble: '문제가 생겼을 때',
      troubles: [
        ['PDF가 열리지 않아요.', '암호가 걸린 PDF는 아직 열 수 없어요. 손상된 파일일 수도 있으니 다른 프로그램에서 열리는지 확인해 주세요.'],
        ['쪽이 많으면 느려요.', '사용자 기기가 직접 처리하기 때문에 수백 쪽짜리는 미리보기를 그리는 데 시간이 걸려요. 탭을 닫지 말고 기다려 주세요.'],
        ['다른 도구로 넘어가면 파일이 그대로 있어요.', '도구를 옮겨 다니며 이어서 작업할 수 있도록 이 브라우저 안에만 잠시 기억해 둔 거예요. 서버로는 가지 않고, "비우기"나 "다른 파일"을 누르면 지워져요.'],
        ['휴대폰에서도 되나요?', '네, 됩니다. 쪽 순서는 쪽을 꾹 누른 채 끌어서 바꿀 수 있어요.'],
      ],
      formats: '지원 형식',
      formatList: ['PDF: 암호가 없는 일반 PDF', '이미지: JPG, PNG, WebP, GIF', '브라우저: 최신 크롬, 엣지, 파이어폭스, 사파리'],
    },
    faq: [
      ['정말 무료인가요?', '네. 회원가입, 결제, 횟수 제한이 없고 결과물에 워터마크도 넣지 않습니다.'],
      ['제 파일이 서버에 올라가나요?', '아니요. 모든 처리는 이 기기의 브라우저 안에서 이루어지고, 파일은 서버로 전송되거나 저장되지 않아요. 도구를 옮겨 다니는 동안 파일을 기억해 두는 것도 이 브라우저 안에만 저장되며, "비우기"를 누르면 지워져요.'],
      ['암호가 걸린 PDF도 되나요?', '지금은 암호가 걸린 PDF는 열 수 없어요. 암호 풀기 기능은 나중에 추가할 예정이에요.'],
      ['도구를 이어서 쓸 수 있나요?', '네. 결과 화면에서 "이 결과로 다른 도구 이어서 쓰기"를 누른 뒤 위쪽 탭에서 다른 도구를 고르면, 방금 만든 PDF로 바로 이어서 작업할 수 있어요.'],
    ],
    faqTitle: '자주 묻는 질문',
    footerNote: '🔒 {BRAND}는 사용자의 파일을 서버로 전송하거나 저장하지 않습니다.<br />모든 처리는 사용자 기기의 브라우저 안에서 이루어집니다.',
    videoTools: '동영상 도구',
    footerPdf: ['PDF 합치기', 'PDF 나누기', '페이지 정리', '이미지 → PDF', 'PDF → 이미지'],
  },
};

Object.assign(T, INTL);
const LANGS = ['en', 'ko', 'zh', 'ja'];
const HREFLANG = { en: 'en', ko: 'ko', zh: 'zh-Hans', ja: 'ja' };
const pdfBase = (l) => (l === 'en' ? '/pdf/' : `/${l}/pdf/`);

/* ---------- 각 언어의 기존 동영상 첫 페이지에서 공통 조각(언어 메뉴·푸터 등) 가져오기 ---------- */
function refParts(lang) {
  const ref = fs.readFileSync(path.join(root, lang === 'en' ? 'index.html' : `${lang}/index.html`), 'utf8');
  return {
    langMenu: ref.match(/<details class="lang-menu">[\s\S]*?<\/details>/)[0],
    headTop: ref.match(/<meta charset="UTF-8" \/>[\s\S]*?<meta name="viewport"[^>]*\/>/)[0],
    footerRef: ref.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0],
    lockSvg: ref.match(/<span class="card-safe">(<svg[\s\S]*?<\/svg>)/)[1],
  };
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const radio = (name, value, [label, small], checked) =>
  `<label><input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''} /><span>${label}${small ? `<small>${small}</small>` : ''}</span></label>`;

function build(lang) {
  const t = T[lang];
  const { langMenu: menuRef, headTop, footerRef, lockSvg } = refParts(lang);
  // 언어 메뉴: 같은 PDF 페이지의 다른 언어판으로 연결
  const langMenu = (file) => menuRef.replace(/href="[^"]*"(\s+data-lang="(\w+)")/g, (_, rest, l) => `href="${pdfBase(l)}${file === 'index.html' ? '' : file}"${rest}`);
  const base = lang === 'en' ? '/pdf/' : `/${lang}/pdf/`;
  const url = (file) => base + (file === 'index.html' ? '' : file);
  const toolUrl = (key) => url(TOOLS.find((x) => x[0] === key)[1]);
  const outDir = path.join(root, lang === 'en' ? 'pdf' : `${lang}/pdf`);
  fs.mkdirSync(outDir, { recursive: true });

  let curFile = 'index.html';
  const header = (activeNav) => `<header class="site-header">
      <div class="wrap">
        ${brandHtml(lang, 'pdf')}
        <nav class="nav">
          <a href="${base}"${activeNav === 'hub' ? ' class="active"' : ''}>${t.nav.hub}</a>
          <a href="${toolUrl('merge')}"${activeNav === 'merge' ? ' class="active"' : ''}>${t.tool.merge[2]}</a>
          <a href="${toolUrl('split')}"${activeNav === 'split' ? ' class="active"' : ''}>${t.tool.split[2]}</a>
          <a href="${toolUrl('organize')}"${activeNav === 'organize' ? ' class="active"' : ''}>${t.tool.organize[2]}</a>
          <a href="${url('guide.html')}"${activeNav === 'guide' ? ' class="active"' : ''}>${t.nav.guide}</a>
        </nav>
        ${langMenu(curFile)}
      </div>
    </header>`;

  const tabs = (active) => `<nav class="pdf-tabs" aria-label="PDF tools">${TOOLS.filter((x) => x[4])
    .map(([k, f, ic]) => `<a href="${url(f)}"${k === active ? ' class="active" aria-current="page"' : ''}><span class="ico" data-icon="${ic}"></span>${t.tool[k][2]}</a>`)
    .join('')}</nav>`;

  const footer = footerRef
    .replace(/<div class="footer-links">[\s\S]*?<\/div>/, `<div class="footer-links">
          ${TOOLS.filter((x) => x[4]).map(([k, f], i) => `<a href="${url(f)}">${t.footerPdf[i]}</a>`).join('\n          ')}
          <a href="${url('guide.html')}">${t.nav.guide}</a>
          <a href="${lang === 'en' ? '/' : `/${lang}/`}">${t.videoTools}</a>
        </div>`)
    .replace(/<p class="footer-note">[\s\S]*?<\/p>/, `<p class="footer-note">${t.footerNote.replace('{BRAND}', brandText('pdf'))}</p>`);

  const cardFoot = `<div class="card-foot"><span class="card-safe">${lockSvg}<span><span class="nb">${t.safe[0]}</span> · <span class="nb">${t.safe[1]}</span></span></span><span class="card-free"><span class="nb"><b>${t.free[0]}</b></span> · <span class="nb">${t.free[1]}</span> · <span class="nb">${t.free[2]}</span></span></div>`;

  const faq = `<section class="faq">
        <h2>${t.faqTitle}</h2>
        ${t.faq.map(([q, a]) => `<details>\n          <summary>${q}</summary>\n          <p>${a}</p>\n        </details>`).join('\n        ')}
      </section>`;

  const page = ({ file, title, desc, body, script, tool = 'hub' }) => {
    curFile = file;
    const alt = (l) => `${SITE}${pdfBase(l)}${file === 'index.html' ? '' : file}`;
    const hreflang = LANGS.map((l) => `<link rel="alternate" hreflang="${HREFLANG[l]}" href="${alt(l)}" />`).join('\n    ') + `\n    <link rel="alternate" hreflang="x-default" href="${alt('en')}" />`;
    const html = `<!doctype html>
<html lang="${lang}">
  <head>
    ${headTop}
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${SITE}${url(file)}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="nuricut.video" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
    <meta property="og:url" content="${SITE}${url(file)}" />
    <meta property="og:image" content="${SITE}/og/og-${lang}.png" />
    <meta name="twitter:card" content="summary_large_image" />
    ${hreflang}
  </head>
  <body data-tool="${tool}">
    ${header(tool)}

    <main class="wrap">
${body}
    </main>

    ${footer}
    <script type="module" src="/src/pages/${script}"></script>
  </body>
</html>
`;
    fs.writeFileSync(path.join(outDir, file), html);
  };

  /* ----- 도구 모음 ----- */
  const groups = Object.entries(t.groups).map(([g, name]) => `      <section class="tool-group">
        <h2>${name}</h2>
        <div class="tool-grid">
          ${TOOLS.filter((x) => x[3] === g).map(([k, f, ic, , ready]) => ready
            ? `<a class="tool-card" href="${url(f)}"><span class="ico" data-icon="${ic}"></span><span><b>${t.tool[k][0]}</b><span class="d">${t.tool[k][1]}</span></span></a>`
            : `<div class="tool-card soon" aria-disabled="true"><span class="ico" data-icon="${ic}"></span><span><b>${t.tool[k][0]}</b><span class="d">${t.tool[k][1]}</span></span><span class="soon-tag">${t.soon}</span></div>`).join('\n          ')}
        </div>
      </section>`).join('\n');
  page({ file: 'index.html', title: t.hub.title, desc: t.hub.desc, script: 'pdf-hub.js', body: `      <section class="hero">
        <h1>${t.hub.h1}</h1>
        <p class="sub">${t.hub.sub}</p>
      </section>
${groups}
      ${faq}` });

  /* ----- 도구 페이지 공통 틀 ----- */
  const c = t.common;
  const toolPage = (key, { kind, many, work }) => {
    const p = t.page[key];
    const file = TOOLS.find((x) => x[0] === key)[1];
    const accept = kind === 'pdf' ? 'application/pdf,.pdf' : 'image/*';
    page({ file, title: p.title, desc: p.desc, tool: key, script: `pdf-${key}.js`, body: `      ${tabs(key)}
      <section class="hero">
        <h1>${p.h1}</h1>
        <p class="sub">${p.sub}</p>
      </section>

      <section class="card">
        <label id="dropzone" class="dropzone">
          <input id="file-input" type="file" accept="${accept}"${many ? ' multiple' : ''} hidden />
          <span class="ico lg" data-icon="${kind === 'pdf' ? key === 'merge' ? 'merge' : 'upload' : 'img2pdf'}"></span>
          <div class="dz-title">${kind === 'pdf' ? (many ? t.drop.pdfMany : t.drop.pdf) : t.drop.img}</div>
          <div class="dz-hint">${kind === 'pdf' ? t.drop.hintPdf : t.drop.hintImg}</div>
        </label>

        <div id="work" hidden>
${work}
        </div>

        <div id="progress-box" class="progress-box" hidden>
          <div id="status" class="status"></div>
          <div class="bar"><div id="bar-fill" class="bar-fill"></div></div>
        </div>

        <div id="result" class="result" hidden>
          <div id="result-info" class="saved"></div>
          <div class="result-actions">
            <a id="download" class="btn-primary" download>${c.download}</a>
            <button id="again" class="btn-secondary" type="button">${c.again}</button>
          </div>
          <button id="continue" class="btn-secondary" type="button" data-text="${c.cont}" data-done-text="${c.contDone}" hidden>${c.cont}</button>
          <a class="btn-support" data-support hidden target="_blank" rel="noopener">${c.support}</a>
        </div>

        <div id="error" class="error" hidden></div>
        ${cardFoot}
      </section>

      ${faq}` });
  };

  const head = (withAdd) => `          <div class="work-head">
            <span id="work-title" class="title"></span>
            ${withAdd ? `<button id="add-files" class="btn-small" type="button">${c.add}</button>` : `<select id="file-pick" class="text-input" style="width:auto;max-width:220px" hidden></select>`}
            <button id="clear-files" class="btn-link" type="button">${withAdd ? c.clear : c.change}</button>
          </div>`;

  toolPage('merge', { kind: 'pdf', many: true, work: `${head(true)}
          <div id="list" class="filelist"></div>
          <p class="hint">${c.handle}</p>
          <div class="options"><button id="start" class="btn-primary" type="button">${t.merge.start}</button></div>` });

  const s = t.split;
  toolPage('split', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options" style="margin-top:0">
            <div class="field">
              <span class="label">${s.mode}</span>
              <div class="seg" role="radiogroup">${radio('mode', 'range', s.range, true)}${radio('mode', 'each', s.each)}${radio('mode', 'pick', s.pick)}</div>
            </div>
            <div id="range-field" class="field">
              <label class="label" for="range">${s.rangeLabel}</label>
              <input id="range" class="text-input" type="text" inputmode="numeric" placeholder="${s.rangePh}" autocomplete="off" />
              <p class="hint">${s.rangeHint}</p>
            </div>
            <p id="pick-hint" class="hint" hidden>${s.pickHint}</p>
            <div id="pages" class="pages"></div>
            <div id="summary" class="notice"></div>
            <button id="start" class="btn-primary" type="button">${s.start}</button>
          </div>` });

  const o = t.organize;
  toolPage('organize', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="toolbar">
            <button id="sel-all" type="button">${o.all}</button>
            <button id="rot-l" type="button" disabled><span class="ico bare" data-icon="rotateL"></span>${o.rotL}</button>
            <button id="rot-r" type="button" disabled><span class="ico bare" data-icon="rotateR"></span>${o.rotR}</button>
            <button id="del" type="button" disabled><span class="ico bare" data-icon="trash"></span>${o.del}</button>
            <button id="blank" type="button"><span class="ico bare" data-icon="blank"></span>${o.blank}</button>
          </div>
          <div id="pages" class="pages"></div>
          <p class="hint">${o.hint}</p>
          <div class="options"><button id="start" class="btn-primary" type="button">${o.start}</button></div>` });

  const ip = t.img2pdf;
  toolPage('img2pdf', { kind: 'image', many: true, work: `${head(true)}
          <div id="list" class="filelist"></div>
          <p class="hint">${c.handle}</p>
          <div class="options">
            <div class="field"><span class="label">${ip.size}</span><div class="seg" role="radiogroup">${radio('size', 'a4', ip.a4, true)}${radio('size', 'fit', ip.fit)}${radio('size', 'letter', ip.letter)}</div></div>
            <div class="row2">
              <div id="orient-field" class="field"><span class="label">${ip.orient}</span><div class="seg" role="radiogroup">${radio('orient', 'auto', [ip.auto], true)}${radio('orient', 'portrait', [ip.portrait])}${radio('orient', 'landscape', [ip.landscape])}</div></div>
              <div id="margin-field" class="field"><span class="label">${ip.margin}</span><div class="seg" role="radiogroup">${radio('margin', '0', [ip.m0])}${radio('margin', '1', [ip.m1], true)}${radio('margin', '2', [ip.m2])}</div></div>
            </div>
            <button id="start" class="btn-primary" type="button">${ip.start}</button>
          </div>` });

  const pi = t.pdf2img;
  toolPage('pdf2img', { kind: 'pdf', many: false, work: `${head(false)}
          <div class="options" style="margin-top:0">
            <div class="row2">
              <div class="field"><span class="label">${pi.format}</span><div class="seg" style="grid-template-columns:1fr 1fr" role="radiogroup">${radio('format', 'jpg', pi.jpg, true)}${radio('format', 'png', pi.png)}</div></div>
              <div class="field"><span class="label">${pi.quality}</span><div class="seg" role="radiogroup">${radio('quality', '96', pi.q1)}${radio('quality', '150', pi.q2, true)}${radio('quality', '300', pi.q3)}</div></div>
            </div>
            <p class="hint">${pi.pickHint}</p>
            <div id="pages" class="pages"></div>
            <button id="start" class="btn-primary" type="button">${pi.start}</button>
          </div>` });

  /* ----- 사용방법 ----- */
  const g = t.guide;
  const ready = TOOLS.filter((x) => x[4]);
  page({ file: 'guide.html', title: g.title, desc: g.desc, tool: 'guide', script: 'pdf-hub.js', body: `      <div class="doc guide">
      <h1>${g.h1.replace('{BRAND}', brandText('pdf'))}</h1>
      <p>${g.intro}</p>
      <ol class="guide-quick">${g.quick.map((q, i) => `<li><span class="ico" data-icon="${STEP_ICONS[i]}"></span><span class="gq-step">STEP ${i + 1}</span><span class="gq-label">${q}</span></li>`).join('')}</ol>
      <nav class="guide-toc">${ready.map(([k, , ic]) => `<a class="guide-toc-item" href="#${k}" data-tip="${g.tocTip.replace('{name}', t.tool[k][0])}"><span class="ico" data-icon="${ic}"></span>${t.tool[k][2]}</a>`).join('')}</nav>
${ready.map(([k, f, ic]) => `
      <section class="guide-section" id="${k}">
        <div class="guide-head"><h2><span class="ico" data-icon="${ic}"></span>${t.tool[k][0]}</h2><a class="btn-small" href="${url(f)}">${g.go}</a></div>
        <ol class="guide-steps">${g.sections[k].steps.map((x) => `<li>${x}</li>`).join('')}</ol>
        <p class="guide-tip"><b>${g.tipLabel}</b> ${g.sections[k].tip}</p>
      </section>`).join('')}
      <section class="faq">
        <h2>${g.trouble}</h2>
        ${g.troubles.map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
      </section>

      <h2>${g.formats}</h2>
      <ul>${g.formatList.map((x) => `<li>${x}</li>`).join('')}</ul>
      </div>` });

  console.log(lang, 'PDF 페이지 7개 생성 →', path.relative(root, outDir));
}

for (const lang of LANGS) build(lang);

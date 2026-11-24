// PDF 도구 페이지 생성기: node scripts/build-pdf-pages.mjs
// 문구(T)를 고치고 다시 실행하면 ko/pdf/*.html 이 새로 만들어집니다. (다른 언어는 T에 추가하면 됨)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandHtml } from './site-parts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://nuricut.video';

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
    organize: { all: '전체 선택', rotL: '왼쪽 회전', rotR: '오른쪽 회전', del: '삭제', blank: '빈 쪽 넣기', hint: '쪽을 눌러 고른 뒤 위 버튼을 누르세요. ⠿ 손잡이를 끌면 순서가 바뀌어요.', start: 'PDF 저장' },
    img2pdf: { size: '용지 크기', a4: ['A4', '문서용'], fit: ['사진 크기', '여백 없이 그대로'], letter: ['레터', '미국 용지'], orient: '방향', auto: '자동', portrait: '세로', landscape: '가로', margin: '여백', m0: '없음', m1: '좁게', m2: '보통', start: 'PDF 만들기' },
    pdf2img: { format: '저장 형식', jpg: ['JPG', '가벼움'], png: ['PNG', '선명함'], quality: '화질', q1: ['가볍게', '96dpi'], q2: ['보통', '150dpi'], q3: ['고화질', '300dpi'], pickHint: '저장할 쪽을 눌러서 고르세요. 아무것도 안 고르면 전체를 저장해요.', start: '이미지로 저장' },
    faq: [
      ['정말 무료인가요?', '네. 회원가입, 결제, 횟수 제한이 없고 결과물에 워터마크도 넣지 않습니다.'],
      ['제 파일이 서버에 올라가나요?', '아니요. 모든 처리는 이 기기의 브라우저 안에서 이루어지고, 파일은 서버로 전송되거나 저장되지 않아요. 도구를 옮겨 다니는 동안 파일을 기억해 두는 것도 이 브라우저 안에만 저장되며, "비우기"를 누르면 지워져요.'],
      ['암호가 걸린 PDF도 되나요?', '지금은 암호가 걸린 PDF는 열 수 없어요. 암호 풀기 기능은 나중에 추가할 예정이에요.'],
      ['도구를 이어서 쓸 수 있나요?', '네. 결과 화면에서 "이 결과로 다른 도구 이어서 쓰기"를 누른 뒤 위쪽 탭에서 다른 도구를 고르면, 방금 만든 PDF로 바로 이어서 작업할 수 있어요.'],
    ],
    footerNote: '🔒 nuricut.video는 사용자의 파일을 서버로 전송하거나 저장하지 않습니다.<br />모든 처리는 사용자 기기의 브라우저 안에서 이루어집니다.',
    footerPdf: ['PDF 합치기', 'PDF 나누기', '페이지 정리', '이미지 → PDF', 'PDF → 이미지'],
  },
};

/* ---------- 기존 한국어 페이지에서 공통 조각 가져오기 ---------- */
const ref = fs.readFileSync(path.join(root, 'ko/index.html'), 'utf8');
const langMenu = ref.match(/<details class="lang-menu">[\s\S]*?<\/details>/)[0];
const headTop = ref.match(/<meta charset="UTF-8" \/>[\s\S]*?<meta name="viewport"[^>]*\/>/)[0];
const footerRef = ref.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0];
const lockSvg = ref.match(/<span class="card-safe">(<svg[\s\S]*?<\/svg>)/)[1];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const radio = (name, value, [label, small], checked) =>
  `<label><input type="radio" name="${name}" value="${value}"${checked ? ' checked' : ''} /><span>${label}${small ? `<small>${small}</small>` : ''}</span></label>`;

function build(lang) {
  const t = T[lang];
  const base = lang === 'en' ? '/pdf/' : `/${lang}/pdf/`;
  const url = (file) => base + (file === 'index.html' ? '' : file);
  const toolUrl = (key) => url(TOOLS.find((x) => x[0] === key)[1]);
  const outDir = path.join(root, lang === 'en' ? 'pdf' : `${lang}/pdf`);
  fs.mkdirSync(outDir, { recursive: true });

  const header = (activeNav) => `<header class="site-header">
      <div class="wrap">
        ${brandHtml(lang, 'pdf')}
        <nav class="nav">
          <a href="${base}"${activeNav === 'hub' ? ' class="active"' : ''}>${t.nav.hub}</a>
          <a href="${toolUrl('merge')}"${activeNav === 'merge' ? ' class="active"' : ''}>${t.tool.merge[2]}</a>
          <a href="${toolUrl('split')}"${activeNav === 'split' ? ' class="active"' : ''}>${t.tool.split[2]}</a>
          <a href="${toolUrl('organize')}"${activeNav === 'organize' ? ' class="active"' : ''}>${t.tool.organize[2]}</a>
          <a href="/${lang}/guide.html">${t.nav.guide}</a>
        </nav>
        ${langMenu}
      </div>
    </header>`;

  const tabs = (active) => `<nav class="pdf-tabs" aria-label="PDF tools">${TOOLS.filter((x) => x[4])
    .map(([k, f, ic]) => `<a href="${url(f)}"${k === active ? ' class="active" aria-current="page"' : ''}><span class="ico" data-icon="${ic}"></span>${t.tool[k][2]}</a>`)
    .join('')}</nav>`;

  const footer = footerRef
    .replace(/<div class="footer-links">[\s\S]*?<\/div>/, `<div class="footer-links">
          ${TOOLS.filter((x) => x[4]).map(([k, f], i) => `<a href="${url(f)}">${t.footerPdf[i]}</a>`).join('\n          ')}
          <a href="/${lang}/">동영상 도구</a>
        </div>`)
    .replace(/<p class="footer-note">[\s\S]*?<\/p>/, `<p class="footer-note">${t.footerNote}</p>`);

  const cardFoot = `<div class="card-foot"><span class="card-safe">${lockSvg}<span><span class="nb">${t.safe[0]}</span> · <span class="nb">${t.safe[1]}</span></span></span><span class="card-free"><span class="nb"><b>${t.free[0]}</b></span> · <span class="nb">${t.free[1]}</span> · <span class="nb">${t.free[2]}</span></span></div>`;

  const faq = `<section class="faq">
        <h2>자주 묻는 질문</h2>
        ${t.faq.map(([q, a]) => `<details>\n          <summary>${q}</summary>\n          <p>${a}</p>\n        </details>`).join('\n        ')}
      </section>`;

  const page = ({ file, title, desc, body, script, tool = 'hub' }) => {
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
  </head>
  <body data-tool="${tool}">
    ${header(tool === 'hub' ? 'hub' : tool)}

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

  console.log(lang, 'PDF 페이지 6개 생성 →', path.relative(root, outDir));
}

for (const lang of Object.keys(T)) build(lang);

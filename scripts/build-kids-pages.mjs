// nuricut kids 페이지 생성기: node scripts/build-kids-pages.mjs
// 지금은 한국어만 (/ko/kids/). 다른 언어는 T에 추가하면 /kids/, /zh/kids/ ... 로 생성됩니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE = 'https://nuricut.video';

/* ---------- 도구 아이콘 (--c = 지금 고른 색. 색을 고르면 그린 자국·쏟아지는 물감 색이 바뀜) ---------- */
export const KID_ICONS = {
  pencil: `<svg viewBox="0 0 48 48" class="ki"><path d="M5 41c4-1 6-6 10-5s3 5 8 3 5-7 9-6" fill="none" stroke="var(--c)" stroke-width="3.2" stroke-linecap="round"/>
    <g transform="rotate(45 30 18)"><rect x="25" y="2" width="10" height="26" rx="2" fill="#ffd27a" stroke="#24203a" stroke-width="2"/><rect x="25" y="2" width="10" height="6" rx="2" fill="#ff9ed2" stroke="#24203a" stroke-width="2"/>
    <path d="M25 28l5 9 5-9z" fill="#f6dcc0" stroke="#24203a" stroke-width="2" stroke-linejoin="round"/><path d="M28.4 34.2L30 37l1.6-2.8z" fill="var(--c)"/></g></svg>`,
  fill: `<svg viewBox="0 0 48 48" class="ki"><ellipse cx="30" cy="42" rx="13" ry="3.6" fill="var(--c)"/>
    <path d="M32.5 22c2 5 3 9 1.6 14.5" fill="none" stroke="var(--c)" stroke-width="4.5" stroke-linecap="round"/>
    <g transform="rotate(-35 18 18)"><path d="M7 11h22l-3 21H10z" fill="#9ad7ff" stroke="#24203a" stroke-width="2.2" stroke-linejoin="round"/><ellipse cx="18" cy="11" rx="11" ry="3.4" fill="var(--c)" stroke="#24203a" stroke-width="2.2"/>
    <path d="M8 13c-4-6 0-11 10-11s14 5 10 11" fill="none" stroke="#24203a" stroke-width="2"/></g></svg>`,
  eraser: `<svg viewBox="0 0 48 48" class="ki"><g transform="rotate(-35 24 24)"><rect x="8" y="16" width="32" height="16" rx="4" fill="#ff9ed2" stroke="#24203a" stroke-width="2.2"/><rect x="8" y="16" width="12" height="16" rx="4" fill="#fff" stroke="#24203a" stroke-width="2.2"/></g>
    <path d="M10 43h28" stroke="#c9c1d6" stroke-width="2.4" stroke-dasharray="3 4" stroke-linecap="round"/></svg>`,
  mirror: `<svg viewBox="0 0 48 48" class="ki"><path d="M24 5v38" stroke="#24203a" stroke-width="2.2" stroke-dasharray="3 3"/><path d="M20 12a10 12 0 0 0 0 24z" fill="var(--c)" stroke="#24203a" stroke-width="2.2"/><path d="M28 12a10 12 0 0 1 0 24z" fill="#fff" stroke="#24203a" stroke-width="2.2" stroke-dasharray="3 2"/></svg>`,
  undo: `<svg viewBox="0 0 48 48" class="ki"><path d="M18 12L8 21l10 9" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M9 21h18a11 11 0 0 1 0 22h-6" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round"/></svg>`,
  redo: `<svg viewBox="0 0 48 48" class="ki"><path d="M30 12l10 9-10 9" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M39 21H21a11 11 0 0 0 0 22h6" fill="none" stroke="#24203a" stroke-width="3" stroke-linecap="round"/></svg>`,
  // 만드는 법 4단계
  s1: `<svg viewBox="0 0 48 48"><rect x="4" y="14" width="22" height="18" rx="4" fill="#9ad7ff" stroke="#24203a" stroke-width="2"/><circle cx="15" cy="23" r="5" fill="#fff" stroke="#24203a" stroke-width="2"/><rect x="9" y="11" width="7" height="4" rx="1.5" fill="#24203a"/>
    <g transform="translate(22 18)"><rect width="22" height="22" rx="4" fill="#fff" stroke="#24203a" stroke-width="2"/><rect x="4" y="4" width="5" height="5" fill="#ff6fae"/><rect x="9" y="4" width="5" height="5" fill="#ffd27a"/><rect x="4" y="9" width="5" height="5" fill="#5fd4a8"/><rect x="9" y="9" width="5" height="5" fill="#ff6fae"/><rect x="14" y="9" width="4" height="5" fill="#b99bff"/><rect x="9" y="14" width="5" height="4" fill="#6cc4ff"/></g></svg>`,
  s2: `<svg viewBox="0 0 48 48"><rect x="5" y="8" width="30" height="34" rx="4" fill="#fff" stroke="#24203a" stroke-width="2"/><path d="M10 32c4-6 7-6 9-1s5 4 8-3" fill="none" stroke="#ff6fae" stroke-width="3" stroke-linecap="round"/><path d="M10 16h16M10 22h10" stroke="#e2d8e6" stroke-width="2.5" stroke-linecap="round"/>
    <g transform="rotate(40 36 22)"><rect x="32" y="6" width="8" height="22" rx="2" fill="#ffd27a" stroke="#24203a" stroke-width="2"/><path d="M32 28l4 7 4-7z" fill="#f6dcc0" stroke="#24203a" stroke-width="2" stroke-linejoin="round"/></g></svg>`,
  s3: `<svg viewBox="0 0 48 48"><rect x="4" y="9" width="40" height="30" rx="6" fill="#5fd4a8" stroke="#24203a" stroke-width="2"/><g fill="#fff">${[0,1,2,3,4].map(i=>`<rect x="${8+i*7.5}" y="12" width="4" height="3" rx="1"/><rect x="${8+i*7.5}" y="33" width="4" height="3" rx="1"/>`).join("")}</g><path d="M20 18v12l10-6z" fill="#fff" stroke="#24203a" stroke-width="2" stroke-linejoin="round"/></svg>`,
  s4: `<svg viewBox="0 0 48 48"><path d="M8 30v8a3 3 0 0 0 3 3h26a3 3 0 0 0 3-3v-8" fill="none" stroke="#24203a" stroke-width="2.6" stroke-linecap="round"/><path d="M24 6v22M15 19l9 9 9-9" fill="none" stroke="#ff6fae" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M38 6l1.4 3 3 1.4-3 1.4L38 15l-1.4-3.2-3-1.4 3-1.4z" fill="#ffd27a" stroke="#24203a" stroke-width="1.4" stroke-linejoin="round"/></svg>`,
  trash: `<svg viewBox="0 0 48 48" class="ki"><path d="M10 14h28M19 14V9h10v5M13 14l2 27h18l2-27" fill="none" stroke="#24203a" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 21v13M27 21v13" stroke="#ff6fae" stroke-width="2.6" stroke-linecap="round"/></svg>`,
};

const T = {
  ko: {
    home: '/ko/kids/', main: '/ko/', mainLabel: 'nuricut으로',
    nav: ['홈', '스톱모션', '픽셀아트'],
    safe: '🔒 사진·그림은 내 기기에만',
    footer: '🔒 nuricut kids는 가입·광고·채팅이 없고, 사진과 그림을 서버로 보내지 않아요.<br />모든 작업은 지금 쓰는 기기 안에서만 이루어져요.',
    hub: {
      title: 'nuricut kids - 스톱모션·픽셀아트 만들기 놀이터',
      desc: '초등·중학생을 위한 무료 만들기 놀이터. 사진을 이어 스톱모션 애니메이션을 만들고, 픽셀아트 캐릭터를 그려 움직이는 GIF로 저장해요. 가입·광고 없음.',
      h1: ['내가 만든 그림이', '움직이기 시작해요!'],
      sub: '찰칵찰칵 사진을 이어 붙이거나, 네모 칸을 칠해서 나만의 움직이는 작품을 만들어 보세요.',
      starts: [['stopmotion.html', '📸 스톱모션 만들기', 'sky'], ['pixel.html', '👾 픽셀아트 그리기', 'mint']],
      cards: [
        ['stopmotion.html', '📸', '스톱모션 애니메이션', '레고·클레이를 조금씩 움직이며 찍으면 영상이 돼요', ['카메라', 'GIF·영상 저장'], 'sky'],
        ['pixel.html', '👾', '픽셀아트 공방', '네모 칸을 칠해서 캐릭터를 그리고 움직여요', ['마우스·손가락', '움직이는 그림 저장'], 'mint'],
      ],
      go: '시작하기 →',
      trust: ['🙅 가입·로그인 없음', '🚫 광고 없음', '🔒 서버로 보내지 않아요', '🆓 무료'],
      how: '이렇게 만들어요',
      steps: [['1', '도구 고르기', '스톱모션이나 픽셀아트를 골라요'], ['2', '만들기', '사진을 찍거나 칸을 칠해요'], ['3', '움직여 보기', '재생 버튼으로 바로 확인해요'], ['4', '저장하기', 'GIF나 영상으로 저장해서 자랑해요']],
    },
    pixel: {
      title: '픽셀아트 공방 - 움직이는 도트 그림 만들기 | nuricut kids',
      desc: '네모 칸을 칠해서 픽셀아트 캐릭터를 그리고, 여러 장을 이어 움직이는 GIF로 저장해요. 무료, 가입 없음.',
      h1: '👾 픽셀아트 공방', sub: '네모 칸을 칠해서 나만의 캐릭터를 그리고 움직여 보세요',
      colors: '🎨 색 고르기', myColor: '원하는 색 만들기', rainbow: '무지개 붓 (칠할 때마다 색이 바뀌어요)', pngBg: ['투명 배경', '흰 배경'],
      tools: '🛠️ 도구',
      pencil: ['연필', '한 칸씩 칠해요'], eraser: ['지우개', '칸을 지워요'], fill: ['채우기', '같은 색 칸을 한 번에'],
      mirror: ['좌우 대칭', '반만 그려도 양쪽에'], undo: ['되돌리기', ''], redo: ['다시하기', ''], clear: ['모두 지우기', ''],
      size: '칸 크기', onion: '앞 그림 비쳐 보기',
      frames: '🎞️ 그림 칸 (여러 장을 이어서 움직여요)', addFrame: '＋ 새 칸', dupFrame: '⧉ 복사', delFrame: '✕ 빼기',
      preview: '👀 움직이는 모습', speed: ['느리게', '보통', '빠르게'],
      save: '💾 저장하기', saveGif: '움직이는 GIF', savePng: '지금 그림 (PNG)',
      starters: '🐰 따라 그리기', starterNames: ['토끼', '하트', '별'],
      confirmClear: '지금 그림 칸을 모두 지울까요?',
      saved: '저장했어요!',
      undone: '↩ 한 번 되돌렸어요', redone: '↪ 다시 했어요', cleared: '🧽 모두 지웠어요', nothing: '더 되돌릴 게 없어요',
    },
    stop: {
      title: '스톱모션 애니메이션 만들기 - 사진을 이어서 영상으로 | nuricut kids',
      desc: '카메라로 사진을 한 장씩 찍어 스톱모션 애니메이션을 만들고 GIF·영상으로 저장해요. 사진은 서버로 가지 않아요. 무료, 가입 없음.',
      h1: '📸 스톱모션 애니메이션', sub: '물건을 조금씩 움직이며 찍으면, 사진들이 이어져 움직이는 영상이 돼요',
      camOn: '📷 카메라 켜기', camHint: '카메라를 켜도 사진은 이 기기에만 저장돼요.', camSwitch: '🔄 카메라 바꾸기',
      orPhotos: '카메라가 없나요?', photos: '🖼️ 사진 파일로 만들기',
      shoot: '찰칵! (사진 찍기)', shootHint: '스페이스바를 눌러도 찍혀요',
      onion: '👻 전 사진 겹쳐 보기',
      frames: '🎞️ 찍은 사진', delFrame: '선택한 사진 빼기',
      play: '▶ 재생', stop: '■ 멈춤', backToCam: '📷 다시 찍기',
      speed: '🐢 빠르기 🐇', speeds: ['느리게', '보통', '빠르게'],
      effect: '✨ 효과', effects: ['없음', '흑백', '옛날 영화'],
      save: '💾 저장하기', saveGif: 'GIF로 저장', saveMp4: '영상(MP4)으로 저장',
      engine: '처음 한 번은 만드는 프로그램(약 10MB)을 받아요…', making: '만드는 중… {p}%',
      needFrames: '사진을 2장 이상 찍어 주세요.', camFail: '카메라를 켤 수 없어요. 카메라 사용을 허락했는지 확인하거나, 사진 파일로 만들어 보세요.',
      count: '사진 {n}장', saved: '저장했어요!',
    },
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

function build(lang) {
  const t = T[lang];
  const outDir = path.join(root, lang === 'en' ? 'kids' : `${lang}/kids`);
  fs.mkdirSync(outDir, { recursive: true });
  const pages = [['index.html', 0], ['stopmotion.html', 1], ['pixel.html', 2]];
  const header = (active) => `<header class="k-head">
      <div class="k-wrap k-head-in">
        <a class="k-logo" href="${t.home}"><img src="/logo.svg" alt="" width="34" height="34" /><span class="k-word">nuricut<span class="k-dot">.</span><span class="k-kids">kids</span></span></a>
        <nav class="k-nav">${pages.map(([f, i]) => `<a href="${t.home}${f === 'index.html' ? '' : f}"${i === active ? ' class="on" aria-current="page"' : ''}>${t.nav[i]}</a>`).join('')}</nav>
        <span class="k-safe">${t.safe}</span>
      </div>
    </header>`;
  const footer = `<footer class="k-foot"><div class="k-wrap"><p>${t.footer}</p><p><a href="${t.main}">← ${t.mainLabel}</a> · <a href="${t.main}privacy.html">개인정보처리방침</a> · <a href="${t.main}terms.html">이용약관</a></p></div></footer>`;
  const page = (file, active, { title, desc }, body, script) => {
    fs.writeFileSync(path.join(outDir, file), `<!doctype html>
<html lang="${lang}">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" href="/favicon.ico" sizes="48x48" />
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="theme-color" content="#fff8f3" />
    <link rel="stylesheet" href="/src/kids.css" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(desc)}" />
    <link rel="canonical" href="${SITE}${t.home}${file === 'index.html' ? '' : file}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${esc(title)}" />
    <meta property="og:description" content="${esc(desc)}" />
  </head>
  <body data-kid="${file.replace('.html', '')}">
    ${header(active)}
    <main class="k-wrap">
${body}
    </main>
    ${footer}
    <script type="module" src="/src/pages/${script}"></script>
  </body>
</html>
`);
  };

  /* ----- 첫 화면 ----- */
  const h = t.hub;
  const I = KID_ICONS;
  page('index.html', 0, h, `      <section class="k-hero">
        <div>
          <h1>${h.h1[0]}<br /><span class="k-rainbow">${h.h1[1]}</span></h1>
          <p>${h.sub}</p>
          <div class="k-hero-btns">${h.starts.map(([f, l, c]) => `<a class="k-btn ${c}" href="${f}">${l}</a>`).join('')}</div>
        </div>
        <div class="k-mascot"><img src="/logo.svg" alt="" /><span style="left:16%;top:18%">✨</span><span style="right:14%;top:22%">🎨</span><span style="right:22%;bottom:14%">📸</span></div>
      </section>
      <section id="tools" class="k-tools">
        ${h.cards.map(([f, emo, name, d, tags, color]) => `<a class="k-card k-tool" href="${f}"><span class="k-art ${color}">${emo}</span><span><b>${name}</b><span class="k-d">${d}</span><span class="k-tags">${tags.map((x) => `<i>${x}</i>`).join('')}</span><span class="k-btn sm ${color}">${h.go}</span></span></a>`).join('\n        ')}
      </section>
      <section class="k-how"><h2>${h.how}</h2><ol>${h.steps.map(([n, a, b]) => `<li><span class="ks">${I['s' + n]}</span><b><em>${n}</em>${a}</b><span>${b}</span></li>`).join('')}</ol></section>
      <div class="k-trust">${h.trust.map((x) => `<span>${x}</span>`).join('')}</div>`, 'kids-hub.js');

  /* ----- 픽셀아트 ----- */
  const p = t.pixel;
  const tool = (id, icon, [a, b], extra = '') => `<button id="${id}" class="k-tool-btn" type="button"${extra}>${I[icon]}<span class="kt-l"><b>${a}</b>${b ? `<small>${b}</small>` : ''}</span></button>`;
  page('pixel.html', 2, p, `      <section class="k-title"><h1>${p.h1}</h1><p>${p.sub}</p></section>
      <section class="px-app">
        <div class="k-card px-left">
          <h3>${p.colors}</h3>
          <div id="palette" class="px-pal"></div>
          <label class="px-mycolor"><input id="my-color" type="color" value="#ff6fae" /> ${p.myColor}</label>
          <h3>${p.tools}</h3>
          <div class="px-tools">
            ${tool('t-pencil', 'pencil', p.pencil, ' data-tool="pencil" aria-pressed="true"')}
            ${tool('t-fill', 'fill', p.fill, ' data-tool="fill"')}
            ${tool('t-eraser', 'eraser', p.eraser, ' data-tool="eraser"')}
            ${tool('t-mirror', 'mirror', p.mirror, ' aria-pressed="false"')}
          </div>
          <div class="px-mini-tools">${tool('t-undo', 'undo', p.undo)}${tool('t-redo', 'redo', p.redo)}${tool('t-clear', 'trash', p.clear)}</div>
        </div>
        <div class="k-card px-center">
          <div class="px-top"><label>${p.size} <select id="grid-size"><option value="16" selected>16 × 16</option><option value="24">24 × 24</option><option value="32">32 × 32</option></select></label>
            <label class="k-check"><input id="onion" type="checkbox" checked /> ${p.onion}</label></div>
          <div class="px-board"><canvas id="board" width="512" height="512"></canvas></div>
          <h3>${p.frames}</h3>
          <div class="px-frames"><div id="frames" class="px-frame-list"></div>
            <div class="px-frame-btns"><button id="f-add" class="k-btn sm ghost" type="button">${p.addFrame}</button><button id="f-dup" class="k-btn sm ghost" type="button">${p.dupFrame}</button><button id="f-del" class="k-btn sm ghost" type="button">${p.delFrame}</button></div></div>
        </div>
        <div class="px-right">
          <div class="k-card"><h3>${p.preview}</h3><canvas id="preview" class="px-preview" width="256" height="256"></canvas>
            <div class="k-seg" id="speed">${p.speed.map((s, i) => `<button type="button" data-ms="${[320, 160, 80][i]}"${i === 1 ? ' class="on"' : ''}>${s}</button>`).join('')}</div></div>
          <div class="k-card"><h3>${p.save}</h3><button id="save-gif" class="k-btn mint full" type="button">${p.saveGif}</button><button id="save-png" class="k-btn ghost full" type="button">${p.savePng}</button><div class="k-seg px-save-bg" id="png-bg"><button type="button" data-bg="clear" class="on">${p.pngBg[0]}</button><button type="button" data-bg="white">${p.pngBg[1]}</button></div></div>
          <div class="k-card"><h3>${p.starters}</h3><div class="k-seg" id="starters">${p.starterNames.map((n, i) => `<button type="button" data-starter="${i}">${n}</button>`).join('')}</div></div>
        </div>
      </section>
      <script>window.KIDS_TXT = ${JSON.stringify({ confirmClear: p.confirmClear, saved: p.saved, rainbow: p.rainbow, undone: p.undone, redone: p.redone, cleared: p.cleared, nothing: p.nothing })};</script>`, 'kids-pixel.js');

  /* ----- 스톱모션 ----- */
  const s = t.stop;
  page('stopmotion.html', 1, s, `      <section class="k-title"><h1>${s.h1}</h1><p>${s.sub}</p></section>
      <section class="sm-app">
        <div class="sm-main">
          <div id="viewport" class="sm-view">
            <video id="cam" playsinline muted></video>
            <canvas id="onion-layer" class="sm-onion"></canvas>
            <canvas id="player" class="sm-player" hidden></canvas>
            <div id="start-box" class="sm-start">
              <button id="cam-on" class="k-btn" type="button">${s.camOn}</button>
              <p>${s.camHint}</p>
              <p class="sm-or">${s.orPhotos} <label class="k-btn sm ghost">${s.photos}<input id="photos" type="file" accept="image/*" multiple hidden /></label></p>
            </div>
            <span id="count" class="sm-count" hidden></span>
            <button id="cam-switch" class="sm-switch" type="button" hidden>${s.camSwitch}</button>
            <div id="flash" class="sm-flash"></div>
          </div>
          <div class="sm-shoot-row"><button id="shoot" class="sm-shutter" type="button" aria-label="${s.shoot}" disabled></button><span class="sm-shoot-txt"><b>${s.shoot}</b><small>${s.shootHint}</small></span>
            <label class="k-check"><input id="onion" type="checkbox" checked /> ${s.onion}</label></div>
          <div class="k-card sm-strip-box"><h3>${s.frames}</h3><div id="strip" class="sm-strip"></div><button id="del-frame" class="k-btn sm ghost" type="button" disabled>${s.delFrame}</button></div>
        </div>
        <div class="sm-side">
          <div class="k-card"><button id="play" class="k-btn full" type="button" disabled>${s.play}</button><button id="back-cam" class="k-btn ghost full" type="button" hidden>${s.backToCam}</button></div>
          <div class="k-card"><h3>${s.speed}</h3><div class="k-seg" id="speed">${s.speeds.map((x, i) => `<button type="button" data-fps="${[4, 8, 12][i]}"${i === 1 ? ' class="on"' : ''}>${x}</button>`).join('')}</div></div>
          <div class="k-card"><h3>${s.effect}</h3><div class="k-seg" id="effect">${s.effects.map((x, i) => `<button type="button" data-fx="${['none', 'gray', 'old'][i]}"${i === 0 ? ' class="on"' : ''}>${x}</button>`).join('')}</div></div>
          <div class="k-card"><h3>${s.save}</h3><button id="save-gif" class="k-btn mint full" type="button" disabled>${s.saveGif}</button><button id="save-mp4" class="k-btn ghost full" type="button" disabled>${s.saveMp4}</button>
            <div id="progress" class="k-progress" hidden><div class="k-bar"><i id="bar"></i></div><span id="progress-txt"></span></div></div>
        </div>
      </section>
      <script>window.KIDS_TXT = ${JSON.stringify({ engine: s.engine, making: s.making, needFrames: s.needFrames, camFail: s.camFail, count: s.count, saved: s.saved, play: s.play, stop: s.stop })};</script>`, 'kids-stopmotion.js');

  console.log(lang, 'kids 페이지 3개 생성 →', path.relative(root, outDir));
}

for (const lang of Object.keys(T)) build(lang);

// 동영상 도구 페이지에 nuricut kids 안내를 넣습니다. (키즈가 번역된 언어만, 여러 번 실행해도 안전)
//  - 압축·쇼츠·GIF·썸네일: PDF 안내 아래에 '아이와 함께 만들기' 띠
//  - 모든 페이지 바닥글: '키즈 놀이터' 링크
// PDF 페이지 바닥글은 build-pdf-pages.mjs 가 넣습니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIDS_READY, KIDS_LABEL, kidsHome } from './site-parts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = { en: '', ko: 'ko', zh: 'zh', ja: 'ja' };
// 페이지마다 가장 가까운 놀이로 연결: [제목, 설명, 버튼, 연결할 놀이]
const PROMO = {
  ko: {
    'index.html': ['아이와 함께 만드는 놀이터, nuricut kids', '사진을 이어 붙이는 스톱모션 · 칸을 칠하는 픽셀아트 — 가입·광고 없음', '놀러 가기', ''],
    'shorts.html': ['아이와 함께 스톱모션 영상 만들기', '레고·클레이를 조금씩 움직이며 찍으면 영상이 돼요 — nuricut kids', '만들러 가기', 'stopmotion.html'],
    'gif.html': ['직접 그린 픽셀아트를 움직이는 GIF로', '네모 칸을 칠해 캐릭터를 그리고 움직여요 — nuricut kids', '그리러 가기', 'pixel.html'],
    'thumbnail.html': ['아이와 함께 만드는 놀이터, nuricut kids', '사진을 이어 붙이는 스톱모션 · 칸을 칠하는 픽셀아트 — 가입·광고 없음', '놀러 가기', ''],
  },
};
let n = 0;
for (const lang of KIDS_READY) {
  const dir = path.join(root, DIR[lang]);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
    const p = path.join(dir, f);
    const s = fs.readFileSync(p, 'utf8');
    let out = s;
    const pr = PROMO[lang]?.[f];
    if (pr) {
      const [title, sub, btn, to] = pr;
      const block = `<!-- kids-promo -->
      <a class="pdf-promo kids-promo" href="${kidsHome(lang)}${to}">
        <span class="kp-art"><img src="/logo.svg" alt="" width="40" height="40" /></span>
        <span class="pp-text"><b>${title}</b><small>${sub}</small></span>
        <span class="pp-btn">${btn} →</span>
      </a>
      <!-- /kids-promo -->`;
      out = out.includes('<!-- kids-promo -->')
        ? out.replace(/<!-- kids-promo -->[\s\S]*?<!-- \/kids-promo -->/, block)
        : out.replace('<!-- /pdf-promo -->', `<!-- /pdf-promo -->\n      ${block}`);
    }
    const link = `<a href="${kidsHome(lang)}">${KIDS_LABEL[lang]}</a>`;
    if (!out.includes(link)) out = out.replace(/(<div class="footer-links">[\s\S]*?)(\n\s*<\/div>)/, `$1\n          ${link}$2`);
    if (out !== s) { fs.writeFileSync(p, out); n++; }
  }
}
console.log('키즈 안내 적용', n, '페이지');

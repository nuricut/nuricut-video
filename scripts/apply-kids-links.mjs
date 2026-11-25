// 동영상 도구 페이지에 다른 도구(PDF·키즈) 안내를 넣습니다. 여러 번 실행해도 안전.
//  - 압축·쇼츠·GIF·썸네일: PDF 안내 아래에 '아이와 함께 만들기' 띠
//  - 모든 페이지 바닥글: 사용방법 옆에 구분선 + PDF 편집 · 키즈 놀이터 (말풍선)
// PDF 페이지 바닥글은 build-pdf-pages.mjs 가 같은 함수(footerXLinks)로 넣습니다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { KIDS_READY, kidsHome, footerXLinks } from './site-parts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIR = { en: '', ko: 'ko', zh: 'zh', ja: 'ja' };
// 페이지마다 가장 가까운 놀이로 연결: [제목, 설명, 버튼, 연결할 놀이]
const P = {
  ko: { home: ['아이와 함께 만드는 놀이터, nuricut kids', '사진을 이어 붙이는 스톱모션 · 칸을 칠하는 픽셀아트 — 가입·광고 없음', '놀러 가기'],
        shorts: ['아이와 함께 스톱모션 영상 만들기', '레고·클레이를 조금씩 움직이며 찍으면 영상이 돼요 — nuricut kids', '만들러 가기'],
        gif: ['직접 그린 픽셀아트를 움직이는 GIF로', '네모 칸을 칠해 캐릭터를 그리고 움직여요 — nuricut kids', '그리러 가기'] },
  en: { home: ['A making playground for kids: nuricut kids', 'Stop motion from photos · pixel art by coloring squares — no sign-up, no ads', 'Visit'],
        shorts: ['Make a stop motion video with your kids', 'Move LEGO or clay a little between photos and it becomes a video — nuricut kids', 'Make one'],
        gif: ['Turn hand-drawn pixel art into a moving GIF', 'Color in squares to draw a character and make it move — nuricut kids', 'Draw one'] },
  zh: { home: ['和孩子一起创作的乐园：nuricut kids', '用照片做定格动画 · 给方格涂色画像素画 — 无需注册，没有广告', '去看看'],
        shorts: ['和孩子一起做定格动画视频', '把乐高、黏土一点点移动着拍下来就变成视频 — nuricut kids', '去制作'],
        gif: ['把亲手画的像素画变成会动的 GIF', '给方格涂色画出角色并让它动起来 — nuricut kids', '去画画'] },
  ja: { home: ['子どもと一緒に作る遊び場、nuricut kids', '写真をつなぐコマ撮り · マスをぬるドット絵 — 登録・広告なし', '遊びに行く'],
        shorts: ['子どもと一緒にコマ撮り動画を作ろう', 'レゴや粘土を少しずつ動かして撮ると動画に — nuricut kids', '作りに行く'],
        gif: ['手描きのドット絵を動くGIFに', 'マスをぬってキャラクターを描いて動かそう — nuricut kids', '描きに行く'] },
};
const PAGE = { 'index.html': ['home', ''], 'thumbnail.html': ['home', ''], 'shorts.html': ['shorts', 'stopmotion.html'], 'gif.html': ['gif', 'pixel.html'] };
let n = 0;
for (const lang of KIDS_READY) {
  const dir = path.join(root, DIR[lang]);
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.html'))) {
    const p = path.join(dir, f);
    const s = fs.readFileSync(p, 'utf8');
    if (!s.includes('class="site-footer"')) continue;
    let out = s;
    if (PAGE[f]) {
      const [key, to] = PAGE[f];
      const [title, sub, btn] = P[lang][key];
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
    // 예전 방식의 키즈 링크 한 줄은 지움
    out = out.split(`<a href="${kidsHome(lang)}">`).length > 1 ? out.replace(/\n[ \t]*<a href="\/(?:[a-z]{2}\/)?kids\/">[^<]*<\/a>/, '') : out;
    const x = footerXLinks(lang, 'video');
    out = out.includes('<!-- x-links -->')
      ? out.replace(/<!-- x-links -->[\s\S]*?<!-- \/x-links -->/, x)
      : out.replace(/(<div class="footer-links">[\s\S]*?)(\n\s*<\/div>)/, `$1\n          ${x}$2`);
    if (out !== s) { fs.writeFileSync(p, out); n++; }
  }
}
console.log('다른 도구 안내 적용', n, '페이지');

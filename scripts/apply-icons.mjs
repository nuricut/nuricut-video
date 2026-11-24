// 동영상 페이지의 이모지 아이콘을 직접 그린 아이콘으로 바꿉니다. 여러 번 실행해도 안전.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ico = (name, cls = '') => `<span class="ico${cls}" data-icon="${name}"></span>`;
const DZ = { 'index.html': 'v_compress', 'shorts.html': 'v_shorts', 'gif.html': 'v_gif', 'thumbnail.html': 'v_thumb' };
const EMOJI = { '🗜️': 'v_compress', '📱': 'v_shorts', '🎞️': 'v_gif', '🖼️': 'v_thumb' };
let n = 0;
for (const d of ['', 'ko', 'zh', 'ja']) {
  for (const f of fs.readdirSync(path.join(root, d)).filter((x) => x.endsWith('.html'))) {
    const p = path.join(root, d, f);
    const s = fs.readFileSync(p, 'utf8');
    let out = s;
    if (DZ[f]) out = out.replace(/<div class="dz-icon">[^<]*<\/div>/, ico(DZ[f], ' lg dz-ico'));
    out = out.replace(/(<div class="trim-title">)✂️ /, `$1${ico('v_trim', ' bare')}`);
    if (f === 'guide.html') {
      for (const [e, name] of Object.entries(EMOJI)) {
        out = out.split(`<span>${e}</span>`).join(ico(name));
        out = out.split(`<h2>${e} `).join(`<h2>${ico(name)}`);
      }
    }
    if (out !== s) { fs.writeFileSync(p, out); n++; }
  }
}
console.log('아이콘 교체', n, '페이지');

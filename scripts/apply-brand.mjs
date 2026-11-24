// 기존 동영상 페이지 32개의 로고를 새 로고(동영상/PDF 전환)로 바꿉니다. 여러 번 실행해도 안전.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandHtml } from './site-parts.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = { en: '', ko: 'ko', zh: 'zh', ja: 'ja' };
let n = 0;
for (const [lang, d] of Object.entries(dirs)) {
  for (const f of fs.readdirSync(path.join(root, d)).filter((x) => x.endsWith('.html'))) {
    const p = path.join(root, d, f);
    const s = fs.readFileSync(p, 'utf8');
    const out = s.replace(/<a class="logo"[\s\S]*?<\/span><\/span><\/a>|<div class="brand">[\s\S]*?<\/span><\/a><\/div>|<div class="brand">[\s\S]*?<\/span><\/span><\/div>/, brandHtml(lang, 'video'));
    if (out !== s) { fs.writeFileSync(p, out); n++; }
  }
}
console.log('로고 교체', n, '페이지');

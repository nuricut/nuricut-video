// 기존 동영상 페이지 32개에 새 로고·이름 표기를 적용합니다. 여러 번 실행해도 안전.
// - 위쪽 로고: 동영상/PDF 전환 (지금 보는 쪽 토끼색 + 툴팁)
// - 하단 안내 문구와 사용방법 제목: "nuricut.video PDF" (지금 보는 쪽만 토끼색)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brandHtml, brandText } from './site-parts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dirs = { en: '', ko: 'ko', zh: 'zh', ja: 'ja' };
// 동영상 전용 표현을 '파일'로 (PDF 도구도 함께 쓰므로)
const FILES = { en: ['your video files', 'your files'], ko: ['사용자의 동영상 파일을', '사용자의 파일을'], zh: ['您的视频文件', '您的文件'], ja: ['動画ファイルを', 'ファイルを'] };
const BT = brandText('video');
let n = 0;
for (const [lang, d] of Object.entries(dirs)) {
  for (const f of fs.readdirSync(path.join(root, d)).filter((x) => x.endsWith('.html'))) {
    const p = path.join(root, d, f);
    const s = fs.readFileSync(p, 'utf8');
    let out = s.replace(/<a class="logo"[\s\S]*?<\/span><\/span><\/a>|<div class="brand">[\s\S]*?<\/span><\/a><\/div>|<div class="brand">[\s\S]*?<\/span><\/span><\/div>/, brandHtml(lang, 'video'));
    // 하단 안내 문구
    out = out.replace(/(<p class="footer-note">🔒 )(?:nuricut\.video|<span class="brand-text">[\s\S]*?<\/span><\/span>)/, `$1${brandText('video', true)}`); // 바닥글: & kids 까지
    out = out.replace(/(<p class="footer-note">[\s\S]*?)<\/p>/, (m) => m.replace(FILES[lang][0], FILES[lang][1]));
    // 사용방법 제목
    if (f === 'guide.html') out = out.replace(/(<h1>[^<]*?)(?:nuricut\.video|<span class="brand-text">[\s\S]*?<\/span><\/span>)/, `$1${BT}`);
    if (out !== s) { fs.writeFileSync(p, out); n++; }
  }
}
console.log('적용', n, '페이지');

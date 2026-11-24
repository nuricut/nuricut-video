// 동영상 도구 페이지(압축·쇼츠·GIF·썸네일) 카드 아래에 'PDF 도구' 안내를 넣습니다. 여러 번 실행해도 안전.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pdfHome } from './site-parts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TXT = {
  en: ['Need to edit a PDF too?', 'Merge · Split · Organize · Convert — free, no upload', 'Open PDF tools'],
  ko: ['PDF도 업로드 없이 바로 편집하세요', '합치기 · 나누기 · 페이지 정리 · 이미지 변환 — 무료', 'PDF 도구 보기'],
  zh: ['也需要处理 PDF 吗？', '合并 · 拆分 · 整理 · 转换 — 免费，无需上传', '打开 PDF 工具'],
  ja: ['PDFの編集もできます', '結合・分割・ページ整理・変換 — 無料、アップロード不要', 'PDFツールを開く'],
};
const html = (lang) => {
  const [title, sub, btn] = TXT[lang];
  return `<!-- pdf-promo -->
      <a class="pdf-promo" href="${pdfHome(lang)}">
        <span class="pp-icons"><span class="ico" data-icon="merge"></span><span class="ico" data-icon="split"></span><span class="ico" data-icon="pdf2img"></span></span>
        <span class="pp-text"><b>${title}</b><small>${sub}</small></span>
        <span class="pp-btn">${btn} →</span>
      </a>
      <!-- /pdf-promo -->`;
};
let n = 0;
for (const [lang, d] of Object.entries({ en: '', ko: 'ko', zh: 'zh', ja: 'ja' })) {
  for (const f of ['index.html', 'shorts.html', 'gif.html', 'thumbnail.html']) {
    const p = path.join(root, d, f);
    const s = fs.readFileSync(p, 'utf8');
    const block = html(lang);
    let out = s.includes('<!-- pdf-promo -->')
      ? s.replace(/<!-- pdf-promo -->[\s\S]*?<!-- \/pdf-promo -->/, block)
      : s.replace(/(\n\s*)<section class="faq">/, `$1${block}$1<section class="faq">`);
    if (out !== s) { fs.writeFileSync(p, out); n++; }
  }
}
console.log('PDF 안내 적용', n, '페이지');

import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// 영어 페이지는 루트(/), 한국어는 /ko/, 중국어(간체)는 /zh/ 폴더
const pages = ['index', 'shorts', 'gif', 'thumbnail', 'guide', 'privacy', 'terms', 'licenses'];
const input = {};
for (const p of pages) {
  input[`en-${p}`] = resolve(__dirname, `${p}.html`);
  input[`ko-${p}`] = resolve(__dirname, `ko/${p}.html`);
  input[`zh-${p}`] = resolve(__dirname, `zh/${p}.html`);
  input[`ja-${p}`] = resolve(__dirname, `ja/${p}.html`);
}
// PDF 도구 (scripts/build-pdf-pages.mjs 로 생성). 번역된 언어만 추가
const pdfPages = ['index', 'guide', 'merge', 'split', 'organize', 'images-to-pdf', 'pdf-to-images'];
for (const lang of ['en', 'ko', 'zh', 'ja']) {
  for (const p of pdfPages) input[`${lang}-pdf-${p}`] = resolve(__dirname, lang === 'en' ? `pdf/${p}.html` : `${lang}/pdf/${p}.html`);
}

// nuricut kids (scripts/build-kids-pages.mjs 로 생성)
for (const p of ['index', 'stopmotion', 'pixel']) input['ko-kids-' + p] = resolve(__dirname, 'ko/kids/' + p + '.html');

export default defineConfig({
  // ffmpeg.wasm은 자체 워커를 쓰므로 Vite 사전 번들링에서 제외해야 정상 동작합니다.
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
  },
  // 도구마다 별도 페이지 (검색 노출에 유리)
  build: {
    target: 'es2022', // PDF 엔진(pdf.js)이 최신 문법을 사용
    rollupOptions: { input },
  },
});

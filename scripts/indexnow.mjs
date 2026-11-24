// 바뀐 페이지를 Bing 등 IndexNow 참여 검색엔진에 바로 알립니다.
// 사용법 (배포가 끝난 뒤 실행):
//   npm run indexnow                      → 사이트맵의 모든 페이지
//   npm run indexnow -- /ko/ /gif.html    → 지정한 페이지만
import fs from 'node:fs';

const HOST = 'nuricut.video';
const KEY = 'b2edd9cb485f150cd90911c2e648f125'; // public/<KEY>.txt 와 같아야 함

const args = process.argv.slice(2);
let urls;
if (args.length) {
  urls = args.map((a) => (a.startsWith('http') ? a : `https://${HOST}${a.startsWith('/') ? '' : '/'}${a}`));
} else {
  const xml = fs.readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8');
  urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
});
console.log(`IndexNow: ${urls.length}개 제출 → ${res.status} ${res.statusText}`);
if (res.status >= 300) {
  console.log(await res.text());
  process.exit(1);
}

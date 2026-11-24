// 이미지 → PDF: 사진 여러 장을 PDF 하나로
import { $, m, pagesText, createPdfTool, getPdfLib, bytesOf, toBlob, makeSortable, baseName, formatSize } from '../lib/pdf.js';

const list = $('list');
const urls = new WeakMap();

const tool = createPdfTool({ kind: 'image', multiple: true, onFiles: render });

function render(files) {
  list.innerHTML = '';
  files.forEach((f, i) => {
    if (!urls.has(f)) urls.set(f, URL.createObjectURL(f));
    const row = document.createElement('div');
    row.className = 'file-row';
    row.dataset.key = i;
    row.innerHTML = `<span class="handle" title="${m('dragTip')}">⠿</span><span class="thumb"><img alt="" /></span><span class="nm"><b></b><small>${m('imgRow', { i: i + 1, size: formatSize(f.size) })}</small></span><button class="icon-btn" type="button" title="${m('remove')}" aria-label="${m('remove')}">✕</button>`;
    row.querySelector('img').src = urls.get(f);
    row.querySelector('b').textContent = f.name;
    row.querySelector('button').onclick = () => tool.setFiles(files.filter((x) => x !== f));
    list.append(row);
  });
  $('work-title').textContent = m('imgTitle', { n: files.length });
  $('start').textContent = m('imgBtn', { n: files.length });
}

makeSortable(list, { item: '.file-row', handle: '.handle', onEnd: (keys) => tool.setFiles(keys.map((k) => tool.files[+k])) });

const opt = (name) => document.querySelector(`input[name=${name}]:checked`).value;
const syncOptions = () => { $('orient-field').hidden = opt('size') === 'fit'; };
document.querySelectorAll('input[name=size]').forEach((r) => r.addEventListener('change', syncOptions));
syncOptions();

/* JPG 사진의 회전 정보(EXIF) 읽기: 1이면 그대로, 그 외는 돌려서 다시 저장해야 똑바로 보임 */
function jpegOrientation(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return 0;
  let i = 2;
  while (i + 4 < b.length && i < 131072) {
    if (b[i] !== 0xff) return 1;
    const marker = b[i + 1];
    const len = (b[i + 2] << 8) | b[i + 3];
    if (marker === 0xe1 && b[i + 4] === 0x45 && b[i + 5] === 0x78) {
      const t = i + 10;
      const le = b[t] === 0x49;
      const u16 = (o) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
      const u32 = (o) => (le ? (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16)) + b[o + 3] * 16777216 : b[o] * 16777216 + ((b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]));
      const ifd = t + u32(t + 4);
      const n = u16(ifd);
      for (let k = 0; k < n; k++) {
        const e = ifd + 2 + k * 12;
        if (u16(e) === 0x0112) return u16(e + 8);
      }
      return 1;
    }
    i += 2 + len;
  }
  return 1;
}

/** 브라우저로 그려서 JPG로 다시 저장 (회전 정보 반영, WebP·GIF 등 변환) */
async function redraw(file) {
  const bmp = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const c = document.createElement('canvas');
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.drawImage(bmp, 0, 0);
  bmp.close?.();
  const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92));
  c.width = c.height = 0;
  return new Uint8Array(await blob.arrayBuffer());
}

const SIZES = { a4: [595.28, 841.89], letter: [612, 792] };
const MARGINS = [0, 24, 48];

$('start').addEventListener('click', async () => {
  const files = tool.files;
  const size = opt('size');
  const orient = opt('orient');
  const margin = MARGINS[+opt('margin')];
  tool.begin(m('making'));
  try {
    const { PDFDocument } = await getPdfLib();
    const doc = await PDFDocument.create();
    for (let i = 0; i < files.length; i++) {
      tool.progress(i / files.length, m('makingN', { i: i + 1, n: files.length }));
      const f = files[i];
      const b = await bytesOf(f);
      let img;
      const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
      const orientation = jpegOrientation(b);
      if (isPng) img = await doc.embedPng(b);
      else if (orientation === 1) img = await doc.embedJpg(b);
      else img = await doc.embedJpg(await redraw(f)); // 회전된 JPG, WebP, GIF 등
      let pw, ph;
      if (size === 'fit') {
        pw = img.width * 0.75 + margin * 2; // 화면 픽셀 → 인쇄 단위(pt)
        ph = img.height * 0.75 + margin * 2;
        const k = Math.min(1, 14400 / Math.max(pw, ph)); // PDF 최대 크기 제한
        pw *= k; ph *= k;
      } else {
        [pw, ph] = SIZES[size];
        const landscape = orient === 'landscape' || (orient === 'auto' && img.width > img.height);
        if (landscape) [pw, ph] = [ph, pw];
      }
      const page = doc.addPage([pw, ph]);
      const k = Math.min((pw - margin * 2) / img.width, (ph - margin * 2) / img.height);
      const w = img.width * k, h = img.height * k;
      page.drawImage(img, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
    }
    tool.progress(0.97, m('saving'));
    const blob = await toBlob(doc);
    tool.done({ blob, name: `${baseName(files[0].name)}${files.length > 1 ? m('sfxMore', { n: files.length - 1 }) : ''}.pdf`, info: pagesText(files.length), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

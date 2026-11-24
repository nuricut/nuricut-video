// PDF 용량 줄이기
// - 기본: PDF 속 사진(JPEG, 압축 안 된 RGB·흑백)만 줄여서 다시 압축. 글자·선은 그대로라 선택·검색 가능
// - 최대 압축: 쪽 전체를 JPEG 그림으로 바꿈 (글자 선택 불가)
import { $, m, createPdfTool, openForView, openForEdit, getPdfLib, bytesOf, renderPage, toBlob, baseName, formatSize } from '../lib/pdf.js';

const LEVELS = { 1: { q: 0.8, max: 2200, dpi: 150 }, 2: { q: 0.65, max: 1600, dpi: 120 }, 3: { q: 0.5, max: 1100, dpi: 96 } };
const opt = (name) => document.querySelector(`input[name=${name}]:checked`)?.value;

const tool = createPdfTool({
  kind: 'pdf',
  multiple: false,
  onFiles: async ([file]) => {
    const doc = await openForEdit(await bytesOf(file), file.name);
    $('work-title').textContent = `${m('fileTitle', { name: file.name, n: doc.getPageCount() })} · ${formatSize(file.size)}`;
  },
});

const toJpeg = (canvas, q) => new Promise((r) => canvas.toBlob(async (b) => r(new Uint8Array(await b.arrayBuffer())), 'image/jpeg', q));

/** 압축 안 된(Flate) 8비트 RGB/흑백 이미지 → canvas (예측 필터·특수 색공간은 건너뜀) */
async function flateToCanvas(L, dict, contents, w, h) {
  const { unzlibSync } = await import('fflate');
  const parms = dict.get(L.PDFName.of('DecodeParms'));
  if (parms) return null;
  const cs = dict.get(L.PDFName.of('ColorSpace'));
  const csName = cs instanceof L.PDFName ? cs.asString() : '';
  const n = csName === '/DeviceRGB' ? 3 : csName === '/DeviceGray' ? 1 : 0;
  if (!n) return null;
  const raw = unzlibSync(contents);
  if (raw.length < w * h * n) return null;
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(w, h);
  for (let i = 0, j = 0; i < w * h; i++, j += n) {
    img.data[i * 4] = raw[j]; img.data[i * 4 + 1] = raw[j + (n === 3 ? 1 : 0)]; img.data[i * 4 + 2] = raw[j + (n === 3 ? 2 : 0)]; img.data[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** 사진 다시 압축 (글자는 그대로) */
async function recompressImages(doc, L, level) {
  const { PDFName, PDFRawStream, PDFNumber, PDFArray } = L;
  const imgs = [];
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    const d = obj.dict;
    if (d.get(PDFName.of('Subtype')) !== PDFName.of('Image')) continue;
    if (d.get(PDFName.of('ImageMask')) || d.get(PDFName.of('Mask')) || d.get(PDFName.of('Decode'))) continue;
    const bpc = d.get(PDFName.of('BitsPerComponent'));
    if (!(bpc instanceof PDFNumber) || bpc.asNumber() !== 8) continue;
    let filter = d.get(PDFName.of('Filter'));
    if (filter instanceof PDFArray) filter = filter.size() === 1 ? filter.get(0) : null;
    const f = filter instanceof PDFName ? filter.asString() : '';
    if (f !== '/DCTDecode' && f !== '/FlateDecode') continue;
    const cs = d.get(PDFName.of('ColorSpace'));
    if (cs instanceof PDFName && cs.asString() === '/DeviceCMYK') continue; // 인쇄용 CMYK는 색이 바뀔 수 있어 건너뜀
    imgs.push({ ref, obj, f });
  }
  for (let i = 0; i < imgs.length; i++) {
    tool.progress(i / Math.max(1, imgs.length), m('compImages', { i: i + 1, n: imgs.length }));
    const { ref, obj, f } = imgs[i];
    const d = obj.dict;
    const w = d.get(PDFName.of('Width')).asNumber(), h = d.get(PDFName.of('Height')).asNumber();
    try {
      let src;
      if (f === '/DCTDecode') src = await createImageBitmap(new Blob([obj.contents], { type: 'image/jpeg' }));
      else src = await flateToCanvas(L, d, obj.contents, w, h);
      if (!src) continue;
      const k = Math.min(1, level.max / Math.max(w, h));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(w * k)); c.height = Math.max(1, Math.round(h * k));
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(src, 0, 0, c.width, c.height);
      src.close?.();
      const jpg = await toJpeg(c, level.q);
      c.width = c.height = 0;
      if (jpg.length >= obj.contents.length * 0.92) continue; // 거의 안 줄면 원래 그림 유지
      const nd = { Type: 'XObject', Subtype: 'Image', Width: Math.round(w * k), Height: Math.round(h * k), ColorSpace: 'DeviceRGB', BitsPerComponent: 8, Filter: 'DCTDecode' };
      const stream = doc.context.stream(jpg, nd);
      const smask = d.get(PDFName.of('SMask'));
      if (smask) stream.dict.set(PDFName.of('SMask'), smask);
      doc.context.assign(ref, stream);
    } catch (e) {
      console.warn('이미지 건너뜀', e);
    }
  }
}

/** 최대 압축: 쪽 전체를 JPEG로 */
async function rasterize(file, L, level) {
  const view = await openForView(await bytesOf(file));
  const out = await L.PDFDocument.create();
  for (let i = 1; i <= view.numPages; i++) {
    tool.progress((i - 1) / view.numPages, m('compRaster', { i, n: view.numPages }));
    const page = await view.getPage(i);
    const vp = page.getViewport({ scale: 1 });
    const c = await renderPage(view, i, null, { scale: level.dpi / 72 });
    const img = await out.embedJpg(await toJpeg(c, level.q));
    c.width = c.height = 0;
    out.addPage([vp.width, vp.height]).drawImage(img, { x: 0, y: 0, width: vp.width, height: vp.height });
  }
  view.destroy();
  return out;
}

$('start').addEventListener('click', async () => {
  const file = tool.files[0];
  const level = LEVELS[opt('level')];
  tool.begin(m('compAnalyzing'));
  try {
    const L = await getPdfLib();
    let doc;
    if ($('raster').checked) doc = await rasterize(file, L, level);
    else {
      doc = await openForEdit(await bytesOf(file), file.name);
      await recompressImages(doc, L, level);
    }
    tool.progress(0.97, m('saving'));
    const blob = await toBlob(doc);
    const a = formatSize(file.size), b = formatSize(blob.size);
    if (blob.size >= file.size) {
      // 더 커지면 원본을 그대로 돌려줌
      tool.done({ blob: file, name: file.name, info: m('compNoGain', { a }) });
      tool.showError(m('compTip'));
      return;
    }
    const p = Math.round((1 - blob.size / file.size) * 100);
    tool.done({ blob, name: `${baseName(file.name)}${m('sfxCompressed')}.pdf`, info: m('compInfo', { a, b, p }), pdf: true });
  } catch (e) {
    tool.fail(e);
  }
});

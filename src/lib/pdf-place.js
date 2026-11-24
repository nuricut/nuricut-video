// PDF 쪽 위에 글자·그림을 '보이는 모습 기준'으로 놓기 위한 계산 도우미.
// 쪽에 회전(/Rotate)이 걸려 있어도 화면에 보이는 방향 그대로 위치·각도를 맞춥니다.
// 좌표: 보이는 쪽의 왼쪽 아래가 (0,0), 단위는 pt(1/72인치)

/** 보이는 쪽 정보: 크기(VW·VH), 회전, 잘린 영역(CropBox) */
export function visual(page) {
  const box = page.getCropBox();
  const rot = ((page.getRotation().angle % 360) + 360) % 360;
  const swap = rot === 90 || rot === 270;
  return { box, rot, VW: swap ? box.height : box.width, VH: swap ? box.width : box.height };
}

/** 보이는 좌표 → 쪽 좌표 */
export function toPage(v, vx, vy) {
  const { box, rot } = v;
  const W = box.width, H = box.height;
  let x, y;
  if (rot === 90) { x = W - vy; y = vx; }
  else if (rot === 180) { x = W - vx; y = H - vy; }
  else if (rot === 270) { x = vy; y = H - vx; }
  else { x = vx; y = vy; }
  return { x: x + box.x, y: y + box.y };
}

/** 보이는 사각형 → 쪽 좌표 사각형 (자르기용) */
export function rectToPage(v, vx, vy, vw, vh) {
  const pts = [[vx, vy], [vx + vw, vy], [vx, vy + vh], [vx + vw, vy + vh]].map(([a, b]) => toPage(v, a, b));
  const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
  const x = Math.min(...xs), y = Math.min(...ys);
  return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
}

/** 보이는 위치(vx, vy = 글자 시작점·기준선)에 똑바로 보이게 글자 쓰기 */
export function drawTextVisual(page, text, { vx, vy, size, font, color, opacity = 1 }, degrees) {
  const v = visual(page);
  const p = toPage(v, vx, vy);
  page.drawText(text, { x: p.x, y: p.y, size, font, color, opacity, rotate: degrees(v.rot) });
}

/** 보이는 중심(cx, cy)에 너비 w·높이 h, 보이는 각도 angle(도, 반시계)로 그림 놓기 */
export function drawImageVisual(page, img, { cx, cy, w, h, angle = 0, opacity = 1 }, degrees) {
  const v = visual(page);
  const a = (angle * Math.PI) / 180;
  // 중심 기준 회전 → 그림의 왼쪽 아래 모서리(보이는 좌표)
  const bx = cx - ((w / 2) * Math.cos(a) - (h / 2) * Math.sin(a));
  const by = cy - ((w / 2) * Math.sin(a) + (h / 2) * Math.cos(a));
  const p = toPage(v, bx, by);
  page.drawImage(img, { x: p.x, y: p.y, width: w, height: h, rotate: degrees(angle + v.rot), opacity });
}

/** canvas → PNG 바이트 */
export async function canvasPng(canvas) {
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/png'));
  return new Uint8Array(await blob.arrayBuffer());
}

/** 흰 배경을 투명하게 (스캔한 도장·서명 이미지용) */
export function removeWhite(canvas, hi = 235, lo = 200) {
  const ctx = canvas.getContext('2d');
  const d = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const v = (px[i] + px[i + 1] + px[i + 2]) / 3;
    if (v >= hi) px[i + 3] = 0;
    else if (v > lo) px[i + 3] = Math.round(px[i + 3] * (hi - v) / (hi - lo));
  }
  ctx.putImageData(d, 0, 0);
  return canvas;
}

/** 투명하지 않은 부분만 남기게 잘라내기 (여백 제거) */
export function trimCanvas(canvas, pad = 6) {
  const ctx = canvas.getContext('2d');
  const { width: w, height: h } = canvas;
  const px = ctx.getImageData(0, 0, w, h).data;
  let x0 = w, y0 = h, x1 = -1, y1 = -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (px[(y * w + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  if (x1 < 0) return null; // 아무것도 없음
  x0 = Math.max(0, x0 - pad); y0 = Math.max(0, y0 - pad); x1 = Math.min(w - 1, x1 + pad); y1 = Math.min(h - 1, y1 + pad);
  const out = document.createElement('canvas');
  out.width = x1 - x0 + 1; out.height = y1 - y0 + 1;
  out.getContext('2d').drawImage(canvas, x0, y0, out.width, out.height, 0, 0, out.width, out.height);
  return out;
}

export const MM = 72 / 25.4; // 1mm = 약 2.83pt

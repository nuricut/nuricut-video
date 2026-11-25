// 아주 작은 GIF 만들기 도구 (색이 256개 이하인 그림용 — 픽셀아트에 딱 맞음)
// frames: [{ pixels: Uint8Array(색 번호), delay: 1/100초 }], palette: [[r,g,b], ...]

function lzw(indices, minCode) {
  const out = [];
  let cur = 0, bits = 0;
  const write = (code, size) => {
    cur |= code << bits; bits += size;
    while (bits >= 8) { out.push(cur & 255); cur >>= 8; bits -= 8; }
  };
  const clear = 1 << minCode, eoi = clear + 1;
  let size = minCode + 1, next = eoi + 1;
  let dict = new Map();
  write(clear, size);
  let prefix = indices[0];
  for (let i = 1; i < indices.length; i++) {
    const k = indices[i];
    const key = prefix * 4096 + k;
    if (dict.has(key)) { prefix = dict.get(key); continue; }
    write(prefix, size);
    if (next < 4096) {
      dict.set(key, next++);
      if (next > (1 << size) && size < 12) size++;
    } else {
      write(clear, size);
      dict = new Map(); size = minCode + 1; next = eoi + 1;
    }
    prefix = k;
  }
  write(prefix, size);
  write(eoi, size);
  if (bits > 0) out.push(cur & 255);
  return out;
}

export function encodeGif({ width, height, palette, frames, loop = true }) {
  const bytes = [];
  const put = (...b) => bytes.push(...b);
  const u16 = (v) => put(v & 255, (v >> 8) & 255);
  let depth = 1;
  while (1 << depth < palette.length) depth++;
  const size = 1 << depth;
  put(...[...'GIF89a'].map((c) => c.charCodeAt(0)));
  u16(width); u16(height);
  put(0xf0 | (depth - 1), 0, 0);
  for (let i = 0; i < size; i++) { const c = palette[i] || [0, 0, 0]; put(c[0], c[1], c[2]); }
  if (loop) put(0x21, 0xff, 11, ...[...'NETSCAPE2.0'].map((c) => c.charCodeAt(0)), 3, 1, 0, 0, 0);
  for (const f of frames) {
    put(0x21, 0xf9, 4, 0x04, f.delay & 255, (f.delay >> 8) & 255, 0, 0); // 그래픽 제어(지연시간)
    put(0x2c); u16(0); u16(0); u16(width); u16(height); put(0);
    const min = Math.max(2, depth);
    put(min);
    const data = lzw(f.pixels, min);
    for (let i = 0; i < data.length; i += 255) { const chunk = data.slice(i, i + 255); put(chunk.length, ...chunk); }
    put(0);
  }
  put(0x3b);
  return new Uint8Array(bytes);
}

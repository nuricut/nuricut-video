// 썸네일은 압축 엔진 없이 브라우저 기본 기능(캔버스)만으로 처리 → 빠르고 가볍습니다.
import { $, formatTime, baseName, createToolPage, loadPreview, track, t } from '../lib/common.js';

const PICK_COUNT = 8;        // 한 번에 보여줄 추천 장면 수
const SAMPLES_PER_ROUND = 36; // 한 번에 새로 분석할 장면 수

const video = $('preview-video');
const thumbs = $('thumbs');
const autoBtn = $('auto');
let duration = null;
let urls = [];

// 추천 상태: 분석한 후보 장면들과 이미 보여준 장면들
let pool = [];   // { time, score, sig }
let shown = [];  // { time, sig }
let round = 0;

const page = createToolPage({
  async onFile(file) {
    resetAll();
    $('error').hidden = true;
    duration = await loadPreview(video, file);
    const playable = duration && (await waitForFrame());
    $('capture').disabled = autoBtn.disabled = !playable;
    if (!playable) {
      page.showError(t('unplayable'));
    }
  },
  onReset() {
    video.pause();
    resetAll();
  },
});

function resetAll() {
  urls.forEach((u) => URL.revokeObjectURL(u));
  urls = [];
  thumbs.innerHTML = '';
  pool = [];
  shown = [];
  round = 0;
  autoBtn.textContent = t('autoFirst', { n: PICK_COUNT });
}

/** 영상 화면(프레임)이 실제로 그려질 수 있는지 확인 */
function waitForFrame() {
  return new Promise((resolve) => {
    if (video.readyState >= 2 && video.videoWidth) return resolve(true);
    const t = setTimeout(() => resolve(false), 5000);
    video.addEventListener('loadeddata', () => { clearTimeout(t); resolve(video.videoWidth > 0); }, { once: true });
  });
}

/** 지정 시간으로 이동하고 화면이 바뀔 때까지 기다립니다 (탭이 뒤에 있어도 멈추지 않게 타이머 사용). */
function seek(time) {
  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(fallback);
      setTimeout(resolve, 60);
    };
    const fallback = setTimeout(finish, 3000);
    video.addEventListener('seeked', finish, { once: true });
    video.currentTime = time;
  });
}

/* =========================================================
   장면 품질 분석
   좋은 썸네일의 조건을 숫자로 계산합니다.
   - 선명도: 흔들리거나 흐릿한 장면 제외 (가장 중요)
   - 밝기: 너무 어둡거나(페이드인·아웃) 하얗게 날아간 장면 제외
   - 대비: 단색 화면, 자막만 있는 화면 제외
   - 색감: 생동감 있는 장면 우대
   ========================================================= */
const AW = 320, AH = 180; // 분석용 작은 크기
const analyzeCanvas = document.createElement('canvas');
analyzeCanvas.width = AW;
analyzeCanvas.height = AH;
const actx = analyzeCanvas.getContext('2d', { willReadFrequently: true });

function analyzeFrame() {
  actx.drawImage(video, 0, 0, AW, AH);
  const px = actx.getImageData(0, 0, AW, AH).data;
  const n = AW * AH;
  const Y = new Float32Array(n);
  let sumY = 0, sumY2 = 0;
  let sumRG = 0, sumRG2 = 0, sumYB = 0, sumYB2 = 0;
  for (let i = 0, p = 0; i < n; i++, p += 4) {
    const r = px[p], g = px[p + 1], b = px[p + 2];
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    Y[i] = y;
    sumY += y; sumY2 += y * y;
    const rg = r - g, yb = 0.5 * (r + g) - b;
    sumRG += rg; sumRG2 += rg * rg; sumYB += yb; sumYB2 += yb * yb;
  }
  const mean = sumY / n;
  const std = Math.sqrt(Math.max(0, sumY2 / n - mean * mean));

  // 선명도: 라플라시안(윤곽선 강도)의 분산
  let lapSum = 0, lapSum2 = 0, cnt = 0;
  for (let y = 1; y < AH - 1; y++) {
    for (let x = 1; x < AW - 1; x++) {
      const i = y * AW + x;
      const l = 4 * Y[i] - Y[i - 1] - Y[i + 1] - Y[i - AW] - Y[i + AW];
      lapSum += l; lapSum2 += l * l; cnt++;
    }
  }
  const lapMean = lapSum / cnt;
  const lapVar = lapSum2 / cnt - lapMean * lapMean;

  // 색감 (Hasler–Süsstrunk colorfulness)
  const mRG = sumRG / n, mYB = sumYB / n;
  const sRG = Math.sqrt(Math.max(0, sumRG2 / n - mRG * mRG));
  const sYB = Math.sqrt(Math.max(0, sumYB2 / n - mYB * mYB));
  const colorful = Math.hypot(sRG, sYB) + 0.3 * Math.hypot(mRG, mYB);

  const sharpScore = Math.min(1, Math.log1p(lapVar) / Math.log1p(1500));
  const contrastScore = Math.min(1, std / 64);
  const colorScore = Math.min(1, colorful / 90);
  const brightScore = 1 - Math.min(1, Math.abs(mean - 125) / 125);

  const score = 0.45 * sharpScore + 0.2 * contrastScore + 0.2 * colorScore + 0.15 * brightScore;
  // 거의 검정·흰 화면, 거의 단색 화면은 아예 후보에서 제외
  const bad = mean < 35 || mean > 230 || std < 12;

  return { score, bad, sig: signature(Y) };
}

/** 장면 비교용 지문: 16×9 흑백 축소본 */
function signature(Y) {
  const sig = new Float32Array(16 * 9);
  const bw = AW / 16, bh = AH / 9;
  for (let by = 0; by < 9; by++) {
    for (let bx = 0; bx < 16; bx++) {
      let s = 0;
      for (let y = by * bh; y < (by + 1) * bh; y += 2) {
        for (let x = bx * bw; x < (bx + 1) * bw; x += 2) s += Y[y * AW + x];
      }
      sig[by * 16 + bx] = s / ((bw / 2) * (bh / 2));
    }
  }
  return sig;
}

function sigDiff(a, b) {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += Math.abs(a[i] - b[i]);
  return d / a.length; // 0(같음) ~ 255(완전히 다름)
}

/** 이번 회차에 분석할 새 시간들. 회차마다 위치를 엇갈리게 해서 매번 새로운 장면을 봅니다. */
function sampleTimes(r) {
  const margin = duration > 4 ? duration * 0.04 : 0; // 시작·끝의 페이드 구간 제외
  const span = duration - margin * 2;
  const phase = ((r * 0.618034) % 1 + 1) % 1;       // 황금비로 엇갈림
  const count = Math.min(SAMPLES_PER_ROUND, Math.max(4, Math.floor(span * 4))); // 짧은 영상은 적게
  const times = [];
  for (let i = 0; i < count; i++) times.push(margin + ((i + phase) / count) * span);
  return times;
}

/** 이미 보여준 장면·서로 비슷한 장면을 빼고 점수 높은 순으로 고릅니다. */
function pickBest(count) {
  const minGap = Math.max(0.4, duration / 60);
  const isDup = (c, list, thr) =>
    list.some((s) => Math.abs(s.time - c.time) < minGap || sigDiff(s.sig, c.sig) < thr);
  // 품질 기준: 영상 안에서 가장 좋은 장면 점수의 70% 미만(흐릿한 장면 등)은 뽑지 않음
  const good = pool.filter((c) => !c.bad);
  const best = Math.max(0, ...good.map((c) => c.score));
  const sorted = good
    .filter((c) => c.score >= best * 0.7 && !isDup(c, shown, 6))
    .sort((a, b) => b.score - a.score);

  const picks = [];
  for (const thr of [18, 10, 6]) { // 처음엔 '확실히 다른 장면'만, 모자라면 기준을 조금씩 완화
    for (const c of sorted) {
      if (picks.length >= count) break;
      if (!picks.includes(c) && !isDup(c, picks, thr) && !isDup(c, shown, thr)) picks.push(c);
    }
    if (picks.length >= count) break;
  }
  return picks;
}

/* =========================================================
   이미지 만들기
   ========================================================= */
/** 현재 화면을 이미지로. 크기가 지정되면 비율을 유지한 채 가운데 기준으로 잘라 채웁니다. */
function captureFrame() {
  const vw = video.videoWidth, vh = video.videoHeight;
  const size = $('out-size').value;
  const [W, H] = size === 'original' ? [vw, vh] : size.split('x').map(Number);
  const scale = Math.max(W / vw, H / vh);
  const sw = W / scale, sh = H / scale;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H);

  const type = 'image/' + $('format').value;
  return new Promise((resolve) => canvas.toBlob((b) => resolve({ blob: b, W, H }), type, 0.92));
}

async function addThumb(label) {
  const time = video.currentTime;
  const { blob, W, H } = await captureFrame();
  const url = URL.createObjectURL(blob);
  urls.push(url);
  const ext = $('format').value === 'png' ? 'png' : 'jpg';
  const name = `${baseName(page.file)}_${formatTime(time).replace(/[:.]/g, '-')}.${ext}`;

  const item = document.createElement('div');
  item.className = 'thumb';
  item.innerHTML =
    `<img />` +
    `<div class="thumb-meta"><div class="thumb-info"><span class="thumb-time"></span><span class="thumb-res"></span></div>` +
    `<a class="thumb-save" download></a></div>`;
  item.querySelector('img').src = url;
  item.querySelector('img').alt = t('frameAlt', { time: formatTime(time) });
  item.querySelector('.thumb-save').textContent = t('save');
  if (label) {
    const badge = document.createElement('span');
    badge.className = 'thumb-badge';
    badge.textContent = label;
    item.prepend(badge);
  }
  item.querySelector('.thumb-time').textContent = formatTime(time);
  item.querySelector('.thumb-res').textContent = `${W}×${H}`;
  const a = item.querySelector('a');
  a.href = url;
  a.download = name;
  thumbs.appendChild(item);
}

function addGroupTitle(text) {
  const h = document.createElement('div');
  h.className = 'thumb-group';
  h.textContent = text;
  thumbs.appendChild(h);
}

/* =========================================================
   버튼
   ========================================================= */
$('capture').addEventListener('click', async () => {
  video.pause();
  await addThumb(t('manualCapture'));
  track('thumbnail_capture');
});

autoBtn.addEventListener('click', async () => {
  if (!duration) return;
  const btns = [$('capture'), autoBtn];
  btns.forEach((b) => (b.disabled = true));
  video.pause();
  const keep = video.currentTime;

  try {
    // 1) 새 후보 장면 분석 (회차마다 다른 위치)
    const times = sampleTimes(round);
    for (let i = 0; i < times.length; i++) {
      autoBtn.textContent = t('analyzing', { pct: Math.round(((i + 1) / times.length) * 100) });
      await seek(times[i]);
      pool.push({ time: times[i], ...analyzeFrame() });
    }
    round++;

    // 2) 아직 안 보여준 장면 중 가장 좋은 것들 선택
    const picks = pickBest(PICK_COUNT);
    if (picks.length === 0) {
      page.showError(t('noMoreScenes'));
      await seek(keep);
      return;
    }
    $('error').hidden = true;

    // 3) 고른 장면을 원하는 크기로 저장 (보기 편하게 시간 순으로)
    addGroupTitle(
      t(shown.length === 0 ? 'groupTitle' : 'groupTitleMore', { n: picks.length }) +
        (picks.length < PICK_COUNT ? t('groupFiltered') : '')
    );
    const ordered = [...picks].sort((a, b) => a.time - b.time);
    for (let i = 0; i < ordered.length; i++) {
      autoBtn.textContent = t('makingImages', { i: i + 1, n: ordered.length });
      await seek(ordered[i].time);
      await addThumb();
      shown.push(ordered[i]);
    }
    track('thumbnail_auto', { count: ordered.length, round });
    await seek(keep);
  } finally {
    autoBtn.textContent = t(round > 0 ? 'autoMore' : 'autoFirst', { n: PICK_COUNT });
    btns.forEach((b) => (b.disabled = false));
  }
});

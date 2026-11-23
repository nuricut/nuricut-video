import {
  $, show, hide, formatSize, baseName,
  createToolPage, loadPreview, createTrim, trimArgs, outputDuration, track, t,
} from '../lib/common.js';
import * as engine from '../lib/ffmpeg.js';

const MB = 1000 * 1000; // 디스코드·메일 기준에 맞춰 보수적으로 1MB = 1,000,000 바이트
let previewDuration = null;
let resultURL = null;

const trim = createTrim();
const page = createToolPage({
  async onFile(file) {
    hide($('no-preview'));
    previewDuration = await loadPreview($('preview-video'), file);
    trim.setDuration(previewDuration);
    if (!previewDuration) show($('no-preview'));
  },
  onReset() {
    $('preview-video').pause();
  },
  onCancel: engine.cancel,
});

/* ---------- 방식 탭 ---------- */
const mode = () => document.querySelector('input[name="mode"]:checked').value;
document.querySelectorAll('input[name="mode"]').forEach((r) =>
  r.addEventListener('change', () => {
    $('quality-box').hidden = mode() !== 'quality';
    $('target-box').hidden = mode() !== 'target';
  })
);
$('custom-mb').addEventListener('focus', () => {
  document.querySelector('input[name="target"][value="custom"]').checked = true;
});

function targetMB() {
  const v = document.querySelector('input[name="target"]:checked').value;
  return v === 'custom' ? Number($('custom-mb').value) : Number(v);
}

/* ---------- 압축 ---------- */
$('start').addEventListener('click', async () => {
  const file = page.file;
  if (!file) return;
  const range = trim.getRange();
  if (!range) return page.showError(t('trimInvalid'));

  const isTarget = mode() === 'target';
  const target = targetMB();
  if (isTarget && !(target > 0)) return page.showError(t('targetInvalid'));
  const trimmed = range.start > 0.01 || (range.end != null && previewDuration && range.end < previewDuration - 0.05);
  if (isTarget && !trimmed && file.size <= target * MB) {
    return page.showError(t('alreadySmall', { mb: target }));
  }

  const mute = $('mute').checked;
  const resolution = $('resolution').value;
  page.begin();

  let input;
  try {
    input = await engine.writeInput(file);
    const full = previewDuration ?? (await engine.probeDuration(input));
    const duration = outputDuration(range, full);
    const pre = trimArgs(range, full);

    let blob;
    if (isTarget) {
      if (!duration) throw new Error('영상 길이를 알 수 없음');
      blob = await compressToTarget({ input, pre, duration, target, mute, resolution });
    } else {
      const height = resolution === 'auto' ? 720 : Number(resolution);
      const crf = document.querySelector('input[name="quality"]:checked').value;
      page.setProgress(0, t('compressing', { pct: 0 }));
      await engine.run(
        [...pre, '-i', input, ...videoArgs(height), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', crf, ...commonArgs(mute, 128), 'output.mp4'],
        { duration, onProgress: (p) => page.setProgress(p, t('compressing', { pct: Math.round(p * 100) })) }
      );
      blob = new Blob([await engine.readOutput('output.mp4')], { type: 'video/mp4' });
    }
    showResult(file, blob, isTarget ? target : null);
  } catch (err) {
    if (err.userMessage) return page.fail(err, err.userMessage);
    page.fail(err, undefined, engine.isCancelError(err));
  } finally {
    if (input) engine.removeFile(input);
  }
});

function videoArgs(height) {
  // 원본보다 클 때만 줄이고, 가로는 짝수로 자동 계산 (H.264 요구사항)
  return height > 0 ? ['-vf', `scale=-2:'min(${height},ih)'`] : [];
}

function commonArgs(mute, audioK) {
  const audio = mute || audioK === 0 ? ['-an'] : ['-c:a', 'aac', '-b:a', `${audioK}k`];
  return ['-pix_fmt', 'yuv420p', ...audio, '-movflags', '+faststart'];
}

/** 목표 용량에 맞춰 비트레이트를 계산해 압축하고, 넘치면 최대 2번 다시 맞춥니다. */
async function compressToTarget({ input, pre, duration, target, mute, resolution }) {
  const limit = target * MB;
  const totalK = (limit * 0.95 * 8) / duration / 1000; // 5%는 파일 구조용 여유분
  const audioK = mute ? 0 : totalK < 500 ? 48 : totalK < 1500 ? 96 : 128;
  let videoK = Math.floor(totalK - audioK);
  if (videoK < 80) {
    const e = new Error('target too small');
    e.userMessage = t('targetTooSmall', { mb: target });
    throw e;
  }

  // 자동 해상도: 쓸 수 있는 비트레이트가 낮을수록 해상도를 낮춰야 화질이 덜 뭉개집니다.
  const height =
    resolution === 'auto' ? (videoK < 500 ? 480 : videoK < 1500 ? 720 : 1080) : Number(resolution);

  for (let attempt = 1; attempt <= 3; attempt++) {
    const label = (pct) => (attempt === 1 ? t('compressing', { pct }) : t('retrying', { n: attempt, pct }));
    page.setProgress(0, label(0));
    await engine.run(
      [
        ...pre, '-i', input, ...videoArgs(height),
        '-c:v', 'libx264', '-preset', 'veryfast',
        '-b:v', `${videoK}k`, '-maxrate', `${Math.round(videoK * 1.3)}k`, '-bufsize', `${videoK * 2}k`,
        ...commonArgs(mute, audioK), 'output.mp4',
      ],
      { duration, onProgress: (p) => page.setProgress(p, label(Math.round(p * 100))) }
    );
    const data = await engine.readOutput('output.mp4');
    if (data.byteLength <= limit || attempt === 3) {
      return new Blob([data], { type: 'video/mp4' });
    }
    videoK = Math.floor(videoK * (limit / data.byteLength) * 0.93);
  }
}

function showResult(file, blob, target) {
  page.done();
  if (resultURL) URL.revokeObjectURL(resultURL);
  resultURL = URL.createObjectURL(blob);

  $('size-before').textContent = formatSize(file.size);
  $('size-after').textContent = formatSize(blob.size);
  const savedPct = Math.round((1 - blob.size / file.size) * 100);
  track('compress_done', { mode: target ? 'target' : 'quality', target_mb: target ?? 0, saved_pct: savedPct });
  const saved = $('saved');
  if (target) {
    const ok = blob.size <= target * MB;
    saved.textContent = ok ? t('targetOk', { mb: target, pct: savedPct }) : t('targetMissed', { mb: target });
    saved.style.color = ok ? '' : 'var(--err)';
  } else {
    saved.textContent = savedPct > 0 ? t('savedPct', { pct: savedPct }) : t('notSmaller');
    saved.style.color = savedPct > 0 ? '' : 'var(--muted)';
  }

  $('result-video').src = resultURL;
  $('download').href = resultURL;
  $('download').download = `${baseName(file)}_compressed.mp4`;
}

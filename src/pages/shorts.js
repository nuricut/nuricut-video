import {
  $, show, hide, formatSize, baseName,
  createToolPage, loadPreview, createTrim, trimArgs, outputDuration, track, t,
} from '../lib/common.js';
import * as engine from '../lib/ffmpeg.js';

const MAX_SHORTS = 180; // 쇼츠·릴스 최대 3분
let previewDuration = null;
let resultURL = null;

const video = $('preview-video');
const bg = $('bg-video');

const trim = createTrim({
  onChange(r) {
    const len = r ? r.end - r.start : 0;
    $('length-warn').hidden = !(len > MAX_SHORTS);
  },
});

const page = createToolPage({
  async onFile(file) {
    hide($('no-preview'), $('length-warn'));
    previewDuration = await loadPreview(video, file);
    bg.src = video._url;
    trim.setDuration(previewDuration);
    if (!previewDuration) show($('no-preview'));
    updatePreview();
  },
  onReset() {
    video.pause();
    bg.pause();
  },
  onCancel: engine.cancel,
});

/* ---------- 미리보기: 선택한 방식을 9:16 틀에서 흉내 ---------- */
const layout = () => document.querySelector('input[name="layout"]:checked').value;

function updatePreview() {
  const l = layout();
  const pos = $('position').value;
  video.style.objectFit = l === 'fill' ? 'cover' : 'contain';
  video.style.objectPosition = l === 'fill' ? { left: '0% 50%', center: '50% 50%', right: '100% 50%' }[pos] : '50% 50%';
  $('frame').classList.toggle('hide-bg', l !== 'blur');
  $('position-field').hidden = l !== 'fill';
}
document.querySelectorAll('input[name="layout"]').forEach((r) => r.addEventListener('change', updatePreview));
$('position').addEventListener('change', updatePreview);

// 흐린 배경용 영상을 앞 영상과 맞춰 재생
video.addEventListener('play', () => bg.play().catch(() => {}));
video.addEventListener('pause', () => bg.pause());
video.addEventListener('seeked', () => (bg.currentTime = video.currentTime));
video.addEventListener('timeupdate', () => {
  if (Math.abs(bg.currentTime - video.currentTime) > 0.3) bg.currentTime = video.currentTime;
});

/* ---------- 변환 ---------- */
function buildFilter(l, W, H, pos) {
  if (l === 'fill') {
    const x = { left: '0', center: '(in_w-out_w)/2', right: 'in_w-out_w' }[pos];
    return `[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:${x}:(in_h-out_h)/2,setsar=1[v]`;
  }
  if (l === 'black') {
    return `[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:black,setsar=1[v]`;
  }
  // 흐린 배경: 작게 줄여서 흐림 처리 후 다시 키우면 훨씬 빠릅니다.
  const w = W / 4, h = H / 4;
  return (
    `[0:v]split[a][b];` +
    `[a]scale=${w}:${h}:force_original_aspect_ratio=increase,crop=${w}:${h},boxblur=8:2,scale=${W}:${H},eq=brightness=-0.06[bg];` +
    `[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg];` +
    `[bg][fg]overlay=(W-w)/2:(H-h)/2,setsar=1[v]`
  );
}

$('start').addEventListener('click', async () => {
  const file = page.file;
  if (!file) return;
  const range = trim.getRange();
  if (!range) return page.showError(t('trimInvalid'));

  const W = Number($('size').value);
  const H = Math.round((W * 16) / 9);
  const mute = $('mute').checked;
  const filter = buildFilter(layout(), W, H, $('position').value);
  page.begin();

  let input;
  try {
    input = await engine.writeInput(file);
    const full = previewDuration ?? (await engine.probeDuration(input));
    const duration = outputDuration(range, full);
    page.setProgress(0, t('converting', { pct: 0 }));
    await engine.run(
      [
        ...trimArgs(range, full), '-i', input,
        '-filter_complex', filter, '-map', '[v]',
        ...(mute ? ['-an'] : ['-map', '0:a?', '-c:a', 'aac', '-b:a', '128k']),
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p',
        '-movflags', '+faststart', 'output.mp4',
      ],
      { duration, onProgress: (p) => page.setProgress(p, t('converting', { pct: Math.round(p * 100) })) }
    );
    const blob = new Blob([await engine.readOutput('output.mp4')], { type: 'video/mp4' });

    page.done();
    track('shorts_done', { layout: layout(), size: W });
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = URL.createObjectURL(blob);
    $('result-info').textContent = t('shortsDone', { w: W, h: H, size: formatSize(blob.size) });
    $('result-video').src = resultURL;
    $('download').href = resultURL;
    $('download').download = `${baseName(file)}_shorts.mp4`;
  } catch (err) {
    page.fail(err, undefined, engine.isCancelError(err));
  } finally {
    if (input) engine.removeFile(input);
  }
});

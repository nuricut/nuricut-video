import {
  $, show, hide, formatSize, baseName,
  createToolPage, loadPreview, createTrim, trimArgs, outputDuration, track, t,
} from '../lib/common.js';
import * as engine from '../lib/ffmpeg.js';

const DEFAULT_LENGTH = 5;
let previewDuration = null;
let resultURL = null;

const trim = createTrim({
  defaultLength: DEFAULT_LENGTH,
  onChange(r) {
    $('length-warn').hidden = !(r && r.end - r.start > 15);
  },
});

const page = createToolPage({
  async onFile(file) {
    hide($('no-preview'), $('length-warn'));
    previewDuration = await loadPreview($('preview-video'), file);
    trim.setDuration(previewDuration);
    if (!previewDuration) show($('no-preview'));
  },
  onReset() {
    $('preview-video').pause();
  },
  onCancel: engine.cancel,
});

$('start').addEventListener('click', async () => {
  const file = page.file;
  if (!file) return;
  let range = trim.getRange();
  if (!range) return page.showError(t('trimInvalid'));
  if (range.end == null) range = { start: 0, end: DEFAULT_LENGTH }; // 미리보기 불가 형식: 앞 5초

  const width = $('width').value;
  const fps = $('fps').value;
  page.begin();

  let input;
  try {
    input = await engine.writeInput(file);
    const full = previewDuration ?? (await engine.probeDuration(input));
    if (full && range.end > full) range.end = full;
    const duration = outputDuration(range, full);
    page.setProgress(0, t('makingGif', { pct: 0 }));
    // 영상에서 쓰인 색으로 팔레트를 만들어 GIF 색 깨짐을 줄입니다.
    const filter =
      `fps=${fps},scale='min(${width},iw)':-1:flags=lanczos,split[a][b];` +
      `[a]palettegen=stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5`;
    await engine.run(
      [...trimArgs(range, full), '-i', input, '-filter_complex', filter, '-loop', '0', 'output.gif'],
      { duration, onProgress: (p) => page.setProgress(p, t('makingGif', { pct: Math.round(p * 100) })) }
    );
    const blob = new Blob([await engine.readOutput('output.gif')], { type: 'image/gif' });

    page.done();
    track('gif_done', { width: Number(width), fps: Number(fps) });
    if (resultURL) URL.revokeObjectURL(resultURL);
    resultURL = URL.createObjectURL(blob);
    $('result-info').textContent = t('gifDone', { size: formatSize(blob.size), sec: duration.toFixed(1) });
    $('result-img').src = resultURL;
    $('download').href = resultURL;
    $('download').download = `${baseName(file)}.gif`;
  } catch (err) {
    page.fail(err, undefined, engine.isCancelError(err));
  } finally {
    if (input) engine.removeFile(input);
  }
});

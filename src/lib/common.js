// 모든 페이지 공통: 화면 도우미, 파일 선택, 미리보기, 구간 자르기
// (디자인·글꼴은 각 HTML의 <link>로 불러와서, 스크립트가 막혀도 화면은 정상으로 보입니다)
import { initAnalytics, track, sizeBucket } from './usage.js';
import { t, initLanguage, initSupport } from './i18n.js';

initLanguage();
initAnalytics();
initSupport();

// 우클릭 메뉴 막기 (입력칸에서는 붙여넣기 등을 위해 허용)
document.addEventListener('contextmenu', (e) => {
  if (e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
  e.preventDefault();
});
// 로고·이미지를 끌어서 저장하는 것도 막기
document.addEventListener('dragstart', (e) => {
  if (e.target.closest('img, svg, a')) e.preventDefault();
});

// 하단 '문의' 말풍선(이메일)이 화면 가장자리에서 잘리지 않도록 위치 조정
document.querySelectorAll('.contact-link').forEach((a) => {
  const place = () => {
    const r = a.getBoundingClientRect();
    const center = r.left + r.width / 2;
    const half = 110; // 말풍선 폭의 절반 정도
    a.classList.toggle('tip-right', center + half > window.innerWidth - 8);
    a.classList.toggle('tip-left', center - half < 8);
  };
  ['mouseenter', 'focus', 'touchstart'].forEach((ev) => a.addEventListener(ev, place, { passive: true }));
});
export { track, t };

export const $ = (id) => document.getElementById(id);
export const show = (...nodes) => nodes.forEach((n) => n && (n.hidden = false));
export const hide = (...nodes) => nodes.forEach((n) => n && (n.hidden = true));

export function formatSize(bytes) {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
}

export function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = (sec - m * 60).toFixed(1).padStart(4, '0');
  return `${m}:${s}`;
}

export function baseName(file) {
  return file.name.replace(/\.[^.]+$/, '');
}

function isVideoFile(file) {
  return file.type.startsWith('video/') || /\.(mp4|mov|webm|avi|mkv|m4v|3gp|wmv)$/i.test(file.name);
}

/**
 * 모든 도구 페이지가 같은 흐름(파일 선택 → 옵션 → 진행 → 결과)을 쓰도록 묶어 둔 도우미.
 * HTML에 정해진 id(dropzone, file-input, options, progress-box, result ...)가 있어야 합니다.
 */
export function createToolPage({ onFile, onReset, onCancel } = {}) {
  const el = {
    dropzone: $('dropzone'),
    input: $('file-input'),
    fileInfo: $('file-info'),
    fileName: $('file-name'),
    fileMeta: $('file-meta'),
    changeFile: $('change-file'),
    options: $('options'),
    progressBox: $('progress-box'),
    status: $('status'),
    barFill: $('bar-fill'),
    cancel: $('cancel'),
    result: $('result'),
    again: $('again'),
    error: $('error'),
  };
  let current = null;

  function showError(msg) {
    el.error.textContent = msg;
    show(el.error);
  }

  function select(file) {
    if (!file) return;
    if (!isVideoFile(file)) {
      showError(t('onlyVideo'));
      return;
    }
    hide(el.error, el.result, el.progressBox);
    current = file;
    el.fileName.textContent = file.name;
    el.fileMeta.textContent = formatSize(file.size);
    const GB = 1024 * 1024 * 1024;
    if (file.size > 2.5 * GB) {
      el.fileMeta.textContent += ' · ' + t('over25gb');
    } else if (file.size > 1 * GB) {
      el.fileMeta.textContent += ' · ' + t('over1gb');
    }
    hide(el.dropzone);
    show(el.fileInfo, el.options);
    track('file_selected', {
      file_type: (file.name.match(/\.([a-z0-9]+)$/i)?.[1] ?? 'unknown').toLowerCase(),
      file_size: sizeBucket(file.size),
    });
    onFile?.(file);
  }

  el.input.addEventListener('change', (e) => select(e.target.files[0]));
  ['dragenter', 'dragover'].forEach((type) =>
    el.dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      el.dropzone.classList.add('drag');
    })
  );
  ['dragleave', 'drop'].forEach((type) =>
    el.dropzone.addEventListener(type, (e) => {
      e.preventDefault();
      el.dropzone.classList.remove('drag');
    })
  );
  el.dropzone.addEventListener('drop', (e) => select(e.dataTransfer.files[0]));

  function reset() {
    current = null;
    el.input.value = '';
    hide(el.fileInfo, el.options, el.progressBox, el.result, el.error);
    show(el.dropzone);
    onReset?.();
  }
  el.changeFile.addEventListener('click', reset);
  el.again?.addEventListener('click', reset);
  el.cancel?.addEventListener('click', () => onCancel?.());

  function setProgress(ratio, text) {
    const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    el.barFill.style.width = pct + '%';
    el.status.textContent = text ?? t('processing', { pct });
  }

  return {
    el,
    get file() {
      return current;
    },
    showError,
    setProgress,
    /** 작업 시작: 옵션을 숨기고 진행 막대 표시 */
    begin(text = t('loadingEngine')) {
      hide(el.options, el.error, el.result, el.changeFile);
      show(el.progressBox);
      setProgress(0, text);
    },
    /** 작업 성공: 결과 표시 */
    done() {
      hide(el.progressBox);
      show(el.result, el.changeFile);
    },
    /** 작업 실패 또는 취소: 옵션 화면으로 복귀 */
    fail(err, msg = t('failed'), cancelled = false) {
      console.error(err);
      hide(el.progressBox);
      show(el.options, el.changeFile);
      track(cancelled ? 'process_cancel' : 'process_error');
      if (!cancelled) showError(msg);
    },
  };
}

/**
 * 동영상을 <video>에 띄우고 길이(초)를 돌려줍니다.
 * 브라우저가 재생할 수 없는 형식이면 null.
 */
export function loadPreview(video, file) {
  if (video._url) URL.revokeObjectURL(video._url);
  video._url = URL.createObjectURL(file);
  return new Promise((resolve) => {
    let settled = false;
    const done = (d) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener('loadedmetadata', onMeta);
      video.removeEventListener('error', onError);
      resolve(d);
    };
    const timer = setTimeout(() => done(null), 8000);
    const onError = () => done(null);
    const onMeta = () => {
      if (Number.isFinite(video.duration) && video.duration > 0) return done(video.duration);
      // 일부 WebM은 길이가 '무한대'로 나와서 끝으로 한 번 이동시켜 실제 길이를 얻습니다.
      if (video.duration === Infinity) {
        const onChange = () => {
          if (Number.isFinite(video.duration)) {
            video.removeEventListener('durationchange', onChange);
            const d = video.duration;
            video.currentTime = 0;
            done(d);
          }
        };
        video.addEventListener('durationchange', onChange);
        video.currentTime = 1e101;
        return;
      }
      done(null);
    };
    video.addEventListener('loadedmetadata', onMeta);
    video.addEventListener('error', onError);
    video.src = video._url;
  });
}

/** 구간 자르기 입력(시작/끝)을 다룹니다. */
export function createTrim({ defaultLength, onChange } = {}) {
  const video = $('preview-video');
  const box = $('trim');
  const startIn = $('trim-start');
  const endIn = $('trim-end');
  const info = $('trim-info');
  let duration = null;

  const clamp = (v) => Math.max(0, Math.min(duration, Number(v) || 0));

  function range() {
    if (!duration) return { start: 0, end: null };
    const start = clamp(startIn.value);
    const end = clamp(endIn.value);
    if (end <= start + 0.1) return null;
    return { start, end };
  }

  function update() {
    const r = range();
    if (!duration) return;
    if (!r) {
      info.textContent = t('trimInvalid');
      info.classList.add('warn');
    } else {
      info.textContent = t('trimRange', {
        start: formatTime(r.start),
        end: formatTime(r.end),
        len: (r.end - r.start).toFixed(1),
      });
      info.classList.remove('warn');
    }
    onChange?.(r);
  }

  startIn.addEventListener('input', update);
  endIn.addEventListener('input', update);
  $('set-start').addEventListener('click', () => {
    startIn.value = video.currentTime.toFixed(1);
    update();
  });
  $('set-end').addEventListener('click', () => {
    endIn.value = video.currentTime.toFixed(1);
    update();
  });

  return {
    setDuration(d) {
      duration = d;
      if (!d) {
        hide(box);
        return;
      }
      show(box);
      startIn.value = '0';
      endIn.value = (defaultLength ? Math.min(d, defaultLength) : d).toFixed(1);
      startIn.max = endIn.max = d.toFixed(1);
      update();
    },
    /** {start, end} — end가 null이면 끝까지. 잘못된 입력이면 null. */
    getRange: range,
  };
}

/** 구간 자르기용 ffmpeg 입력 옵션 (-i 앞에 붙임) */
export function trimArgs(range, fullDuration) {
  const args = [];
  if (range.start > 0.01) args.push('-ss', range.start.toFixed(2));
  if (range.end != null && (fullDuration == null || range.end < fullDuration - 0.05)) {
    args.push('-t', (range.end - range.start).toFixed(2));
  }
  return args;
}

/** 결과물 길이(초) */
export function outputDuration(range, fullDuration) {
  const end = range.end ?? fullDuration;
  return end != null ? end - range.start : null;
}

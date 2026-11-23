// ffmpeg.wasm 공통 도우미: 엔진 로드, 파일 입출력, 진행률, 취소
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
// 엔진 파일을 내 사이트에서 직접 제공 (외부 CDN 의존 X)
import coreURL from '@ffmpeg/core?url';
import wasmURL from '@ffmpeg/core/wasm?url';

let ff = null;
let logListener = null;

/** 엔진을 처음 한 번만 불러옵니다 (약 32MB, 이후 브라우저 캐시). */
export async function getFFmpeg() {
  if (ff) return ff;
  const inst = new FFmpeg();
  inst.on('log', ({ message }) => logListener?.(message));
  await inst.load({ coreURL, wasmURL });
  ff = inst;
  return ff;
}

const MOUNT = '/source';

/**
 * 사용자 파일을 엔진에 연결합니다. 반환값은 엔진 안에서 쓸 파일 경로.
 * 파일 전체를 메모리에 복사하지 않고 필요한 부분만 디스크에서 바로 읽는 방식(WORKERFS)이라
 * 2GB가 넘는 큰 영상도 처리할 수 있습니다. (결과물만 메모리에 만들어짐)
 */
export async function writeInput(file) {
  const f = await getFFmpeg();
  const ext = file.name.match(/\.[a-z0-9]+$/i)?.[0].toLowerCase() ?? '.mp4';
  // 파일 이름에 특수문자가 있어도 문제없게 안전한 이름으로 감싸기 (데이터 복사 없음)
  const safe = new File([file], 'input' + ext, { type: file.type });
  try {
    await f.unmount(MOUNT); // 이전 작업이 비정상 종료돼 남아 있을 수 있음
  } catch {}
  try {
    await f.createDir(MOUNT);
  } catch {}
  try {
    await f.mount('WORKERFS', { files: [safe] }, MOUNT);
    return `${MOUNT}/${safe.name}`;
  } catch (err) {
    // 혹시 연결 방식이 지원되지 않는 환경이면 예전 방식(메모리 복사)으로 대체
    console.warn('WORKERFS 실패, 메모리 방식으로 대체', err);
    await f.writeFile(safe.name, await fetchFile(file));
    return safe.name;
  }
}

const toSec = (h, m, s) => Number(h) * 3600 + Number(m) * 60 + Number(s);

/** 브라우저가 길이를 못 읽는 형식(AVI 등)일 때 ffmpeg로 길이를 알아냅니다. */
export async function probeDuration(name) {
  const f = await getFFmpeg();
  let duration = null;
  logListener = (m) => {
    const x = m.match(/Duration:\s*(\d+):(\d+):([\d.]+)/);
    if (x) duration = toSec(x[1], x[2], x[3]);
  };
  try {
    await f.exec(['-hide_banner', '-i', name]); // 출력이 없어서 오류 코드로 끝나는 게 정상
  } finally {
    logListener = null;
  }
  return duration;
}

/** ffmpeg 명령 실행. duration(결과물 길이, 초)을 주면 진행률(0~1)을 알려줍니다. */
export async function run(args, { duration, onProgress } = {}) {
  const f = await getFFmpeg();
  logListener = (m) => {
    const x = m.match(/time=\s*(\d+):(\d+):([\d.]+)/);
    if (x && duration && onProgress) onProgress(Math.min(1, toSec(x[1], x[2], x[3]) / duration));
  };
  try {
    const code = await f.exec(args);
    if (code !== 0) throw new Error('ffmpeg exit code ' + code);
  } finally {
    logListener = null;
  }
}

export async function readOutput(name) {
  const f = await getFFmpeg();
  const data = await f.readFile(name);
  await f.deleteFile(name).catch(() => {});
  return data;
}

export async function removeFile(name) {
  if (!ff) return;
  if (name.startsWith(MOUNT + '/')) await ff.unmount(MOUNT).catch(() => {});
  else await ff.deleteFile(name).catch(() => {});
}

/** 작업 강제 중단. 다음 작업 때 엔진을 다시 불러옵니다. */
export function cancel() {
  if (ff) {
    ff.terminate();
    ff = null;
  }
}

export function isCancelError(err) {
  return String(err?.message ?? err).includes('terminate');
}

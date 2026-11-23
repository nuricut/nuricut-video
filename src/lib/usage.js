// 방문자·사용횟수 집계 (Google Analytics 4)
// - 측정 ID는 프로젝트 폴더의 .env 파일에 VITE_GA_ID=G-XXXXXXXXXX 형태로 넣으면 자동으로 켜집니다.
// - ID가 없거나 내 PC(localhost)에서 실행 중이면 아무것도 보내지 않습니다.
// - 영상 파일·파일 이름·화면 내용은 절대 보내지 않고, '어떤 기능을 몇 번 썼는지' 같은 숫자만 보냅니다.

const GA_ID = import.meta.env.VITE_GA_ID;
const enabled = Boolean(GA_ID) && !['localhost', '127.0.0.1'].includes(location.hostname);

export function initAnalytics() {
  if (!enabled) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID);
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);

  // 결과물 다운로드 버튼 클릭 수 집계 (모든 페이지 공통)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[download]');
    if (a) track('file_download', { tool: currentTool() });
  });
}

/** 사용 이벤트 기록. params에는 숫자·선택값만 넣습니다 (개인정보·파일 정보 금지). */
export function track(name, params = {}) {
  if (!enabled || !window.gtag) return;
  window.gtag('event', name, { tool: currentTool(), ...params });
}

export function currentTool() {
  // 언어 폴더(/ko/, /zh/)는 빼고 도구 이름만 기록 (언어는 GA가 따로 집계)
  const p = location.pathname.replace(/^\/((ko|zh|ja)\/)?|\.html$/g, '').replace(/\/$/, '');
  return p === '' || p === 'index' ? 'compress' : p;
}

/** 파일 크기를 구간으로만 기록 (정확한 크기는 보내지 않음) */
export function sizeBucket(bytes) {
  const mb = bytes / 1e6;
  if (mb < 10) return '~10MB';
  if (mb < 50) return '10~50MB';
  if (mb < 200) return '50~200MB';
  if (mb < 1000) return '200MB~1GB';
  return '1GB~';
}

// nuricut kids 방문 통계: 쿠키·기기 식별값을 저장하지 않는 방식(Google 동의 모드 '거부')
// - 방문 수와 저장 횟수 같은 숫자만 집계합니다. 재방문자 구분은 하지 않습니다.
// - 그림·사진·파일 이름 등은 절대 보내지 않습니다.
// - 내 PC(localhost)에서는 보내지 않습니다. (확인용: 주소 끝에 ?ga-debug)
const GA_ID = import.meta.env.VITE_GA_ID || 'G-W5RVK6Z0DL';
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
const enabled = !local || location.search.includes('ga-debug');

if (enabled) {
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  // 쿠키·광고 식별값 저장을 모두 거부한 상태로 시작 → 쿠키 없이 익명 신호만 전송
  window.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  window.gtag('set', 'ads_data_redaction', true);
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { allow_google_signals: false, allow_ad_personalization_signals: false, content_group: 'kids' });
  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);
}

/** 사용 횟수 기록 (숫자·선택값만) */
export function kidTrack(name, params = {}) {
  if (!enabled || !window.gtag) return;
  window.gtag('event', name, { section: 'kids', ...params });
}

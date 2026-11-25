// 버튼을 톡 짧게 눌러도 '쑥 들어갔다 나오는' 모습이 보이도록 잠깐(0.12초) 눌린 상태를 유지
const SEL = 'button, .k-btn, .px-mycolor input';
let cur = null, t0 = 0;
addEventListener('pointerdown', (e) => {
  const b = e.target.closest?.(SEL);
  if (!b || b.disabled) return;
  cur = b; t0 = performance.now();
  b.classList.add('k-down');
}, { passive: true });
const up = () => {
  if (!cur) return;
  const b = cur; cur = null;
  setTimeout(() => b.classList.remove('k-down'), Math.max(0, 120 - (performance.now() - t0)));
};
addEventListener('pointerup', up);
addEventListener('pointercancel', up);

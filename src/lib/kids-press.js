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

// 체크 상자를 끌 때 '팡!' 하고 터지는 효과
const PANG = ['#ff6fae', '#ffb02e', '#ffe14d', '#3fc794', '#4fb3f6', '#7d4fd6'];
addEventListener('change', (e) => {
  const box = e.target;
  if (!box.matches?.('.k-check input[type="checkbox"]') || box.checked) return;
  box.classList.remove('k-pang'); void box.offsetWidth; box.classList.add('k-pang');
  const label = box.closest('.k-check');
  const burst = document.createElement('span');
  burst.className = 'k-pang-burst';
  burst.style.left = box.offsetLeft + box.offsetWidth / 2 + 'px';
  burst.style.top = box.offsetTop + box.offsetHeight / 2 + 'px';
  burst.innerHTML = Array.from({ length: 10 }, (_, i) => `<i style="--a:${i * 36}deg;--bc:${PANG[i % PANG.length]}"></i>`).join('');
  label.append(burst);
  setTimeout(() => burst.remove(), 600);
});

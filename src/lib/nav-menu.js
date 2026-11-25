// PDF 머리말의 펼침 메뉴(정리·변환·편집·최적화): 하나를 열면 다른 건 닫고, 바깥을 누르거나 Esc를 누르면 닫힘.
// 마우스가 있는 기기에서는 올리기만 해도 열림.
import { renderIcons } from './pdf-icons.js';

const groups = [...document.querySelectorAll('.nav-group')];
const closeAll = (except) => groups.forEach((g) => { if (g !== except) g.open = false; });
const hover = matchMedia('(hover: hover)').matches;
for (const g of groups) {
  g.addEventListener('toggle', () => { if (g.open) closeAll(g); });
  if (hover) {
    let t = null;
    g.addEventListener('mouseenter', () => { clearTimeout(t); closeAll(g); g.open = true; });
    g.addEventListener('mouseleave', () => { t = setTimeout(() => { g.open = false; }, 180); });
    // 올려서 이미 열렸는데 눌러서 도로 닫히지 않게 (마우스로 누르면 늘 열린 상태 유지)
    g.querySelector('summary').addEventListener('click', (e) => { if (e.detail > 0) { e.preventDefault(); closeAll(g); g.open = true; } });
  }
}
document.addEventListener('click', (e) => { if (!e.target.closest('.nav-group')) closeAll(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(); });
// 메뉴 안 아이콘 채우기 (페이지마다 아이콘을 채우는 코드가 이미 돌았어도 한 번 더 해도 괜찮음)
try { renderIcons(document.querySelector('.pdf-nav') || document); } catch {}

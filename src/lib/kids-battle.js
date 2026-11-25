// 키즈 메뉴의 '대전(출시 예정)': 말풍선 열기/닫기 + 두 팀이 칸을 칠하는 짧은 미리보기 애니메이션
const N = 16, PINK = '#ff6fae', SKY = '#4fb3f6', DUR = 60; // 미리보기는 60초를 빠르게 (약 8초)
for (const el of document.querySelectorAll('.k-battle, .k-battle-card')) {
  const cv = el.querySelector('canvas'), x = cv.getContext('2d');
  const teams = JSON.parse(cv.dataset.teams), winTxt = cv.dataset.win;
  const bar = el.querySelectorAll('.kb-bar i');
  const nums = [el.querySelector('.kb-score > .p span'), el.querySelector('.kb-score > .s span')];
  const time = el.querySelector('.kb-time');
  let cells, players, tick = 0, timer = null, done = 0;
  const reset = () => {
    cells = new Uint8Array(N * N); tick = 0; done = 0;
    // 팀마다 2명: 분홍은 왼쪽, 하늘은 오른쪽에서 출발
    players = [[2, 4, 1], [3, 11, 1], [13, 4, 2], [12, 11, 2]].map(([px, py, team]) => ({ x: px, y: py, team }));
  };
  const draw = () => {
    const s = cv.width / N;
    x.fillStyle = '#fff'; x.fillRect(0, 0, cv.width, cv.height);
    for (let i = 0; i < N * N; i++) if (cells[i]) { x.fillStyle = cells[i] === 1 ? PINK : SKY; x.fillRect((i % N) * s, ((i / N) | 0) * s, s, s); }
    x.strokeStyle = 'rgba(36,32,58,.07)'; x.lineWidth = 1; x.beginPath();
    for (let i = 1; i < N; i++) { x.moveTo(i * s, 0); x.lineTo(i * s, cv.height); x.moveTo(0, i * s); x.lineTo(cv.width, i * s); }
    x.stroke();
    for (const p of players) { x.fillStyle = '#24203a'; x.beginPath(); x.arc((p.x + 0.5) * s, (p.y + 0.5) * s, s * 0.28, 0, 7); x.fill(); }
    let a = 0, b = 0;
    for (const c of cells) { if (c === 1) a++; else if (c === 2) b++; }
    nums[0].textContent = a; nums[1].textContent = b;
    const tot = Math.max(1, a + b);
    bar[0].style.width = (a / tot) * 100 + '%'; bar[1].style.width = (b / tot) * 100 + '%';
    if (done) {
      x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(0, cv.height / 2 - 20, cv.width, 40);
      x.fillStyle = a >= b ? '#d93c84' : '#2f86d0'; x.font = '900 17px system-ui, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(winTxt.replace('{t}', a >= b ? teams[0] : teams[1]), cv.width / 2, cv.height / 2);
    }
  };
  const step = () => {
    if (done) { if (++done > 16) reset(); draw(); return; }
    tick++;
    for (const p of players) {
      // 대부분은 빈칸이나 상대 칸 쪽으로 한 칸씩, 가끔은 아무 데나
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy]) => [p.x + dx, p.y + dy]).filter(([a, b]) => a >= 0 && b >= 0 && a < N && b < N);
      const good = opts.filter(([a, b]) => cells[b * N + a] !== p.team);
      const pool = good.length && Math.random() < 0.85 ? good : opts;
      const [nx, ny] = pool[(Math.random() * pool.length) | 0];
      p.x = nx; p.y = ny; cells[ny * N + nx] = p.team;
    }
    const left = Math.max(0, DUR - Math.floor((tick * DUR) / 110));
    time.textContent = left;
    if (!left) done = 1;
    draw();
  };
  const start = () => { if (timer) return; reset(); draw(); timer = setInterval(step, 70); };
  const stop = () => { clearInterval(timer); timer = null; };
  const open = (v) => { el.classList.toggle('open', v); el.setAttribute('aria-expanded', String(v)); if (v) start(); else stop(); };
  const hover = matchMedia('(hover: hover)').matches;
  if (hover) { el.addEventListener('mouseenter', () => open(true)); el.addEventListener('mouseleave', () => open(false)); }
  el.addEventListener('focusout', () => open(false));
  el.addEventListener('click', (e) => { if (e.target.closest('.k-btip')) return; open(!el.classList.contains('open')); }); // 손가락: 눌러서 열고 닫기
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(!el.classList.contains('open')); } if (e.key === 'Escape') open(false); });
}

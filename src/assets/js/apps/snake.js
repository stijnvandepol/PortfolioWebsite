// ============================================================
// apps/snake.js — Snake (verborgen in Launchpad)
//
// Canvas, pijltjes of WASD, spatie = pauze/start. Highscore blijft bewaard.
// Pauzeert vanzelf zodra het venster niet meer actief is, geminimaliseerd
// wordt of het tabblad verborgen raakt. Geen loop als het spel stilstaat.
// ============================================================
import { el, prefersReducedMotion } from '../core/dom.js';
import { store } from '../core/store.js';

const COLS = 20, ROWS = 16, CELL = 22;
const HS_KEY = 'pf-snake-best';
const DIRS = {
  ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
  w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0], W: [0, -1], S: [0, 1], A: [-1, 0], D: [1, 0],
};

const readBest = () => { try { return parseInt(localStorage.getItem(HS_KEY), 10) || 0; } catch { return 0; } };
const writeBest = (v) => { try { localStorage.setItem(HS_KEY, String(v)); } catch { /* private mode */ } };

export function createSnakeApp() {
  return {
    id: 'snake',
    title: 'Snake',
    menuName: 'Snake',
    width: COLS * CELL + 24, height: ROWS * CELL + 36 + 56 + 12, minWidth: COLS * CELL + 24, minHeight: ROWS * CELL + 104,
    resizable: false,
    chrome: 'plain',
    winClass: 'snake-win',
    singleton: true,
    mount({ win, titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: 'Snake' }));
      body.classList.add('snake-body');

      const scoreEl = el('span', { class: 'snake-num', text: '0' });
      const bestEl = el('span', { class: 'snake-num', text: String(readBest()) });
      const canvas = el('canvas', { class: 'snake-canvas', width: COLS * CELL, height: ROWS * CELL, 'aria-hidden': 'true' });
      const msgTitle = el('p', { class: 'snake-msg-title' });
      const msgSub = el('p', { class: 'snake-msg-sub' });
      const msg = el('div', { class: 'snake-msg' }, [msgTitle, msgSub]);
      const status = el('p', { class: 'sr-only', 'aria-live': 'polite' });
      body.append(
        el('div', { class: 'snake-hud' }, [
          el('div', { class: 'snake-stat' }, [el('span', { class: 'snake-lbl', text: 'Score' }), scoreEl]),
          el('div', { class: 'snake-stat' }, [el('span', { class: 'snake-lbl', text: 'Record' }), bestEl]),
        ]),
        el('div', { class: 'snake-board' }, [canvas, msg]),
        status,
      );

      // Canvas scherp op retina
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = COLS * CELL * dpr; canvas.height = ROWS * CELL * dpr;
      canvas.style.width = `${COLS * CELL}px`; canvas.style.height = `${ROWS * CELL}px`;
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);

      let snake, dir, queue, food, score, best = readBest(), state = 'ready', timer = null, stepMs;

      function reset() {
        snake = [[6, 8], [5, 8], [4, 8]];
        dir = [1, 0]; queue = [];
        score = 0; stepMs = prefersReducedMotion() ? 160 : 130;
        scoreEl.textContent = '0';
        placeFood();
      }
      function placeFood() {
        const free = [];
        for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if (!snake.some(([sx, sy]) => sx === x && sy === y)) free.push([x, y]);
        food = free[Math.floor(Math.random() * free.length)];
      }

      function showMsg(title, sub) { msgTitle.textContent = title; msgSub.textContent = sub; msg.hidden = false; status.textContent = `${title}. ${sub}`; }

      function setState(s) {
        state = s;
        clearInterval(timer); timer = null;
        if (s === 'playing') { msg.hidden = true; status.textContent = ''; timer = setInterval(step, stepMs); }
        else if (s === 'ready') showMsg('Snake', 'Druk op spatie of een pijltje om te starten');
        else if (s === 'paused') showMsg('Gepauzeerd', 'Spatie om verder te spelen');
        else if (s === 'over') showMsg(`Game over · ${score}`, score && score >= best ? 'Nieuw record! Spatie om opnieuw te spelen' : 'Spatie om opnieuw te spelen');
        draw();
      }

      function step() {
        if (queue.length) dir = queue.shift();
        const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
        const eating = food && head[0] === food[0] && head[1] === food[1];
        const body = eating ? snake : snake.slice(0, -1);
        if (head[0] < 0 || head[1] < 0 || head[0] >= COLS || head[1] >= ROWS || body.some(([x, y]) => x === head[0] && y === head[1])) {
          if (score > best) { best = score; writeBest(best); bestEl.textContent = String(best); }
          setState('over');
          return;
        }
        snake = [head, ...body];
        if (eating) {
          score += 1;
          scoreEl.textContent = String(score);
          if (snake.length === COLS * ROWS) { food = null; setState('over'); return; }
          placeFood();
          // Iets sneller per vijf punten, met een ondergrens.
          if (score % 5 === 0 && stepMs > 70) { stepMs -= 8; clearInterval(timer); timer = setInterval(step, stepMs); }
        }
        draw();
      }

      function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
      function draw() {
        const W = COLS * CELL, H = ROWS * CELL;
        ctx.clearRect(0, 0, W, H);
        // Subtiel schaakbord, zoals een speelveld
        ctx.fillStyle = 'rgba(255,255,255,0.025)';
        for (let x = 0; x < COLS; x++) for (let y = 0; y < ROWS; y++) if ((x + y) % 2) ctx.fillRect(x * CELL, y * CELL, CELL, CELL);
        if (food) {
          ctx.fillStyle = '#ff453a';
          ctx.beginPath(); ctx.arc(food[0] * CELL + CELL / 2, food[1] * CELL + CELL / 2 + 1, CELL * 0.34, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#30d158';
          roundRect(food[0] * CELL + CELL / 2, food[1] * CELL + 3, 5, 3, 1.5);
        }
        snake.forEach(([x, y], i) => {
          const t = i / Math.max(1, snake.length - 1);
          ctx.fillStyle = i === 0 ? '#5ee089' : `hsl(${142 - t * 10} ${62 - t * 14}% ${52 - t * 14}%)`;
          roundRect(x * CELL + 1.5, y * CELL + 1.5, CELL - 3, CELL - 3, i === 0 ? 7 : 5);
        });
        // Ogen kijken in de looprichting
        const [hx, hy] = snake[0];
        const cx = hx * CELL + CELL / 2, cy = hy * CELL + CELL / 2;
        const px = -dir[1], py = dir[0];
        ctx.fillStyle = '#0b1a10';
        [-1, 1].forEach((s) => { ctx.beginPath(); ctx.arc(cx + dir[0] * 4 + px * s * 4, cy + dir[1] * 4 + py * s * 4, 2, 0, Math.PI * 2); ctx.fill(); });
      }

      function turn(d) {
        const last = queue.length ? queue[queue.length - 1] : dir;
        if (d[0] === -last[0] && d[1] === -last[1]) return;   // niet omkeren
        if (d[0] === last[0] && d[1] === last[1]) return;
        if (queue.length < 3) queue.push(d);
      }

      const onKey = (e) => {
        if (store.get('activeWindowId') !== win.id || win.minimized) return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
        if (document.querySelector('.spotlight.open, .ql.open, .launchpad.open, .menu')) return;
        const d = DIRS[e.key];
        if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          if (state === 'playing') setState('paused');
          else { if (state === 'over' || state === 'ready') reset(); setState('playing'); }
        } else if (d) {
          e.preventDefault();
          if (state === 'ready' || state === 'over') { reset(); turn(d); setState('playing'); }
          else if (state === 'paused') { turn(d); setState('playing'); }
          else turn(d);
        }
      };
      window.addEventListener('keydown', onKey);
      msg.addEventListener('click', () => { if (state !== 'playing') { if (state !== 'paused') reset(); setState('playing'); } });

      // Automatisch pauzeren: ander venster actief, geminimaliseerd of tabblad weg.
      const autoPause = () => { if (state === 'playing') setState('paused'); };
      const offWin = store.on('activeWindowId', (id) => { if (id !== win.id) autoPause(); });
      const onVis = () => { if (document.hidden) autoPause(); };
      document.addEventListener('visibilitychange', onVis);
      window.addEventListener('blur', autoPause);

      reset();
      setState('ready');

      return {
        onClose: () => {
          clearInterval(timer);
          window.removeEventListener('keydown', onKey);
          window.removeEventListener('blur', autoPause);
          document.removeEventListener('visibilitychange', onVis);
          if (typeof offWin === 'function') offWin();
        },
      };
    },
  };
}

// ============================================================
// os/dock.js — dock met magnification, running-indicators en launch-bounce
// ============================================================
import { el, prefersReducedMotion } from '../core/dom.js';
import { store } from '../core/store.js';
import { os } from './bridge.js';

const BASE = 38, MAX_W = 58, DIST = 227;
const distIn = [-DIST, -DIST / 1.25, -DIST / 2, 0, DIST / 2, DIST / 1.25, DIST];
const widthOut = [BASE, BASE * 1.1, BASE * 1.414, BASE * 2, BASE * 1.414, BASE * 1.1, BASE];
const lerp = (a, b, t) => a + (b - a) * t;

function magnify(d) {
  if (d <= distIn[0]) return widthOut[0];
  if (d >= distIn[6]) return widthOut[6];
  for (let i = 0; i < distIn.length - 1; i++) {
    if (d >= distIn[i] && d <= distIn[i + 1]) return lerp(widthOut[i], widthOut[i + 1], (d - distIn[i]) / (distIn[i + 1] - distIn[i]));
  }
  return BASE;
}

export function initDock(root, entries) {
  const items = el('div', { class: 'dock-items' });
  const dock = el('nav', { class: 'dock', 'aria-label': 'Dock' }, [el('div', { class: 'dock-el' }, [items])]);

  const icons = [];

  entries.forEach((entry) => {
    if (entry.sep) { items.append(el('div', { class: 'dock-sep' })); return; }
    const icon = el('div', { class: `di-icon${entry.bg ? ' di-icon-custom' : ''}`, html: entry.icon, style: entry.bg ? { background: entry.bg } : null });
    const dot = el('div', { class: 'di-dot' });
    const di = el('button', { class: 'di', dataset: { dock: entry.id }, 'aria-label': entry.label }, [
      el('div', { class: 'di-tip', text: entry.label }), icon, dot,
    ]);
    di.addEventListener('click', () => {
      if (entry.href) { os.openExternal(entry.href); return; }
      bounce(icon);
      if (entry.action) entry.action(); else os.open(entry.id);
    });
    items.append(di);
    icons.push({ el: icon, current: BASE, target: BASE });
  });

  root.append(dock);

  // Magnification (rAF-gedreven).
  let raf = null, active = false;
  function update() {
    let need = false;
    icons.forEach((d) => {
      const diff = d.target - d.current;
      if (Math.abs(diff) > 0.2) { d.current += diff * 0.16; need = true; } else d.current = d.target;
      const w = d.current;
      const lift = ((w - BASE) / (MAX_W - BASE)) * 8;
      d.el.style.width = `${w / 16}rem`;
      d.el.style.height = `${w / 16}rem`;
      d.el.style.transform = `translateY(${-lift}px)`;
    });
    raf = (need || active) ? requestAnimationFrame(update) : null;
  }
  if (!prefersReducedMotion()) {
    dock.addEventListener('mousemove', (e) => {
      active = true;
      const mx = e.clientX;
      icons.forEach((d) => { const r = d.el.getBoundingClientRect(); d.target = magnify(mx - (r.left + r.width / 2)); });
      if (!raf) raf = requestAnimationFrame(update);
    });
    dock.addEventListener('mouseleave', () => { active = false; icons.forEach((d) => { d.target = BASE; }); if (!raf) raf = requestAnimationFrame(update); });
  }

  // Running-indicators reactief op store.
  store.on('runningApps', (running) => {
    items.querySelectorAll('.di').forEach((di) => {
      const id = di.dataset.dock;
      di.querySelector('.di-dot')?.classList.toggle('active', running.includes(id));
    });
  });

  return dock;
}

export function bounce(icon) {
  if (!icon || prefersReducedMotion()) return;
  const orig = icon.style.transform || '';
  icon.style.transition = 'transform 0.42s cubic-bezier(0.36,0.07,0.19,0.97)';
  icon.style.transform = `${orig} translateY(-38px)`;
  setTimeout(() => { icon.style.transform = orig; setTimeout(() => { icon.style.transition = ''; }, 420); }, 420);
}

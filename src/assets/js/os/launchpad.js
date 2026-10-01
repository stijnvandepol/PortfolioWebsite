// ============================================================
// os/launchpad.js — app-grid (F4 of Dock)
// Pijltjes navigeren, Enter opent, Esc / klik ernaast sluit.
// ============================================================
import { el, qsa, trapFocus, prefersReducedMotion } from '../core/dom.js';
import { os } from './bridge.js';

let overlay = null, release = null;

function appTile(a) {
  const tile = el('button', { class: 'lp-app', type: 'button', 'aria-label': a.title }, [
    el('div', { class: 'lp-icon', html: a.icon }),
    el('span', { class: 'lp-label', text: a.title }),
  ]);
  tile.querySelector('.lp-icon img')?.setAttribute('alt', ''); // knop heeft al een naam: icoon is decoratief
  tile.addEventListener('click', () => { close(); os.activate(a.id); });
  return tile;
}

function onKey(e) {
  if (!overlay?.classList.contains('open')) return;
  if (e.key === 'Escape') { e.preventDefault(); close(); return; }
  const dir = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 'down', ArrowUp: 'up' }[e.key];
  if (!dir) return;
  e.preventDefault();
  const tiles = qsa('.lp-app', overlay);
  const i = Math.max(0, tiles.indexOf(document.activeElement));
  let n = i;
  if (typeof dir === 'number') n = (i + dir + tiles.length) % tiles.length;
  else {
    // Zoek de tegel in de volgende/vorige rij op (ongeveer) dezelfde x.
    const cur = tiles[i].getBoundingClientRect();
    const rows = tiles.filter((t) => (dir === 'down' ? t.getBoundingClientRect().top > cur.top + 4 : t.getBoundingClientRect().top < cur.top - 4));
    if (rows.length) {
      const rowTop = dir === 'down' ? Math.min(...rows.map((t) => t.getBoundingClientRect().top)) : Math.max(...rows.map((t) => t.getBoundingClientRect().top));
      const inRow = rows.filter((t) => Math.abs(t.getBoundingClientRect().top - rowTop) < 4);
      n = tiles.indexOf(inRow.sort((a, b) => Math.abs(a.getBoundingClientRect().left - cur.left) - Math.abs(b.getBoundingClientRect().left - cur.left))[0]);
    }
  }
  tiles[n].focus();
}
window.addEventListener('keydown', onKey);

function ensure(apps) {
  overlay = el('div', { class: 'launchpad', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Launchpad' }, [
    el('div', { class: 'lp-grid' }, apps.map(appTile)),
  ]);
  document.getElementById('desktop').append(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target.classList.contains('lp-grid')) close(); });
}

export function openLaunchpad(apps) {
  if (overlay) overlay.remove();
  ensure(apps);
  requestAnimationFrame(() => overlay.classList.add('open'));
  release = trapFocus(overlay, { initial: overlay.querySelector('.lp-app') });
}

// F4/Dock-klik schakelt: open Launchpad, of sluit 'm als hij al open staat.
export function toggleLaunchpad(apps) {
  if (overlay?.classList.contains('open')) { close(); return; }
  openLaunchpad(apps);
}

export function close() {
  if (!overlay) return;
  overlay.classList.remove('open');
  release?.(); release = null;
  const o = overlay; overlay = null;
  if (prefersReducedMotion()) o.remove(); else setTimeout(() => o.remove(), 240);
}

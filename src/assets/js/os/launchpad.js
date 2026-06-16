// ============================================================
// os/launchpad.js — app-grid met blur (F4)
// ============================================================
import { el, trapFocus } from '../core/dom.js';
import { os } from './bridge.js';

let overlay = null, release = null;

function appTile(a) {
  const tile = el('button', { class: 'lp-app', 'aria-label': a.title }, [
    el('div', { class: 'lp-icon', html: a.icon }),
    el('span', { class: 'lp-label', text: a.title }),
  ]);
  tile.addEventListener('click', () => { os.open(a.id); close(); });
  return tile;
}

function ensure(apps) {
  overlay = el('div', { class: 'launchpad', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Launchpad' }, [
    el('div', { class: 'lp-grid' }, apps.map(appTile)),
  ]);
  document.getElementById('desktop').append(overlay);
  overlay.addEventListener('click', (e) => { if (e.target === overlay || e.target.classList.contains('lp-grid')) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay?.classList.contains('open')) close(); });
}

export function openLaunchpad(apps) {
  if (overlay) overlay.remove();
  ensure(apps);
  requestAnimationFrame(() => overlay.classList.add('open'));
  release = trapFocus(overlay, { initial: overlay.querySelector('.lp-app') });
}

export function close() {
  if (!overlay) return;
  overlay.classList.remove('open');
  release?.(); release = null;
  const o = overlay; overlay = null;
  setTimeout(() => o.remove(), 250);
}

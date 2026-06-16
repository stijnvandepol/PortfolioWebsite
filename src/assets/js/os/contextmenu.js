// ============================================================
// os/contextmenu.js — herbruikbaar rechtsklik-menu
// ============================================================
import { el, clamp } from '../core/dom.js';

let menu = null;

function ensure() {
  if (menu) return;
  menu = el('div', { class: 'ctx-menu', role: 'menu' });
  document.body.append(menu);
  document.addEventListener('click', hide);
  document.addEventListener('contextmenu', (e) => { if (!e.target.closest('.ctx-menu')) hide(); }, true);
  window.addEventListener('blur', hide);
}

export function hide() { if (menu) menu.classList.remove('visible'); }

/** items: [{ label, action, disabled, divider }] */
export function showContextMenu(x, y, items) {
  ensure();
  menu.replaceChildren();
  items.forEach((it) => {
    if (it.divider) { menu.append(el('div', { class: 'ctx-divider' })); return; }
    const row = el('button', { class: `ctx-item${it.disabled ? ' disabled' : ''}`, role: 'menuitem', text: it.label });
    if (!it.disabled && it.action) row.addEventListener('click', (e) => { e.stopPropagation(); hide(); it.action(); });
    menu.append(row);
  });
  menu.style.visibility = 'hidden';
  menu.classList.add('visible');
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  menu.style.left = `${clamp(x, 8, window.innerWidth - mw - 8)}px`;
  menu.style.top = `${clamp(y, 28, window.innerHeight - mh - 8)}px`;
  menu.style.visibility = 'visible';
}

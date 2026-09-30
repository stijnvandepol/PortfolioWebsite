// ============================================================
// os/contextmenu.js — herbruikbaar rechtsklik-menu
// Regels (Apple HIG): kort houden, onbeschikbare items weglaten (`hidden`),
// geen sneltoetsen tonen, destructieve acties onderaan.
// ============================================================
import { clamp } from '../core/dom.js';
import { buildMenu, moveFocus } from './menu.js';

let current = null;
let returnTo = null;

function onDocKey(e) {
  if (!current) return;
  if (e.key === 'Escape') { e.preventDefault(); hideContextMenu(); return; }
  // Toetsenbord neemt het menu over zodra het wordt gebruikt.
  if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) && !current.contains(document.activeElement)) {
    e.preventDefault();
    moveFocus(current, e.key === 'ArrowUp' || e.key === 'End' ? 'last' : 'first');
  }
}
function onOutside(e) { if (current && !current.contains(e.target)) hideContextMenu({ restoreFocus: false }); }

export function hideContextMenu({ restoreFocus = true } = {}) {
  if (!current) return;
  current.remove();
  current = null;
  document.removeEventListener('keydown', onDocKey, true);
  document.removeEventListener('pointerdown', onOutside, true);
  window.removeEventListener('blur', hideContextMenu);
  window.removeEventListener('resize', hideContextMenu);
  if (restoreFocus) returnTo?.focus?.({ preventScroll: true });
  returnTo = null;
}
export const hide = hideContextMenu;

/** items: [{ label, action, disabled, hidden, divider, checked }] */
export function showContextMenu(x, y, items, { placement } = {}) {
  hideContextMenu({ restoreFocus: false });
  returnTo = document.activeElement;
  const menu = buildMenu(items, { label: 'Contextmenu', className: 'ctx-menu', onClose: () => hideContextMenu() });
  menu.style.visibility = 'hidden';
  document.body.append(menu);
  const mw = menu.offsetWidth, mh = menu.offsetHeight;
  // 'above': het menu klapt omhoog vanaf (x, y), gecentreerd op x (Dock-menu's)
  const left = placement === 'above' ? x - mw / 2 : x;
  const top = placement === 'above' ? y - mh : y;
  menu.style.left = `${clamp(left, 8, window.innerWidth - mw - 8)}px`;
  menu.style.top = `${clamp(top, 30, window.innerHeight - mh - 8)}px`;
  menu.style.visibility = '';
  current = menu;
  document.addEventListener('keydown', onDocKey, true);
  document.addEventListener('pointerdown', onOutside, true);
  window.addEventListener('blur', hideContextMenu);
  window.addEventListener('resize', hideContextMenu);
}

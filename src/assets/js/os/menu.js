// ============================================================
// os/menu.js — één menu-component (menubalk + contextmenu)
//
// Items: { label, key, action, disabled, divider, checked, hidden }
//  - `key` is platte tekst, bv. '⌘W' (volgorde ⌃ ⌥ ⇧ ⌘, zoals Apple)
//  - hover én toetsenbord delen één markering (focus), zoals in macOS
//  - activeren knippert kort (macOS-gedrag) voordat het menu sluit
// ============================================================
import { el, prefersReducedMotion } from '../core/dom.js';
import { sym } from '../apps/icons.js';

const enabledItems = (menu) => [...menu.querySelectorAll('.menu-item:not([aria-disabled="true"])')];

/** Beweeg de markering; dir = +1 / -1 / 'first' / 'last'. */
export function moveFocus(menu, dir) {
  const items = enabledItems(menu);
  if (!items.length) return;
  const cur = items.indexOf(document.activeElement);
  let next;
  if (dir === 'first') next = 0;
  else if (dir === 'last') next = items.length - 1;
  else next = cur === -1 ? (dir > 0 ? 0 : items.length - 1) : (cur + dir + items.length) % items.length;
  items[next].focus({ preventScroll: true });
}

/**
 * Bouwt een menu-element.
 * @param {Array} items
 * @param {{ onClose: Function, label?: string, className?: string, onKey?: Function }} opts
 */
export function buildMenu(items, { onClose, label, className = '', onKey } = {}) {
  const menu = el('div', { class: `menu ${className}`.trim(), role: 'menu', 'aria-label': label || null });

  items.filter((i) => !i.hidden).forEach((it) => {
    if (it.divider) { menu.append(el('div', { class: 'menu-sep', role: 'separator' })); return; }
    const role = it.checked !== undefined ? 'menuitemcheckbox' : 'menuitem';
    const row = el('button', {
      class: 'menu-item', type: 'button', role, tabindex: '-1',
      'aria-disabled': it.disabled ? 'true' : null,
      'aria-checked': it.checked !== undefined ? String(!!it.checked) : null,
    }, [
      el('span', { class: 'menu-check', html: it.checked ? sym('check', 12) : '' }),
      el('span', { class: 'menu-label', text: it.label }),
      it.key ? el('span', { class: 'menu-key', text: it.key }) : null,
    ]);
    if (!it.disabled) {
      row.addEventListener('mouseenter', () => row.focus({ preventScroll: true }));
      row.addEventListener('click', (e) => {
        e.stopPropagation();
        const run = () => { onClose?.(); it.action?.(); };
        if (prefersReducedMotion()) { run(); return; }
        // macOS: gekozen item knippert één keer voor het menu verdwijnt.
        row.classList.add('flash-off');
        setTimeout(() => { row.classList.remove('flash-off'); setTimeout(run, 55); }, 55);
      });
    }
    menu.append(row);
  });

  // Toetsenbord binnen het menu
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveFocus(menu, 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveFocus(menu, -1); }
    else if (e.key === 'Home') { e.preventDefault(); moveFocus(menu, 'first'); }
    else if (e.key === 'End') { e.preventDefault(); moveFocus(menu, 'last'); }
    else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose?.({ escape: true }); }
    else if (e.key === 'Tab') { e.preventDefault(); onClose?.({ escape: true }); }
    else if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
      // type-ahead: spring naar het volgende item dat met deze letter begint
      const items = enabledItems(menu);
      const start = items.indexOf(document.activeElement) + 1;
      const ordered = [...items.slice(start), ...items.slice(0, start)];
      const hit = ordered.find((i) => i.querySelector('.menu-label').textContent.toLowerCase().startsWith(e.key.toLowerCase()));
      if (hit) hit.focus({ preventScroll: true });
    } else onKey?.(e);
  });
  return menu;
}

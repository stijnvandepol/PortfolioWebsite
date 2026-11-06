// ============================================================
// os/notifications.js — banner-notificaties (rechtsboven)
// ============================================================
import { el, prefersReducedMotion } from '../core/dom.js';
import { sym } from '../apps/icons.js';
import { t } from '../core/i18n.js';

let stack = null;

export function initNotifications(root) {
  stack = el('div', { class: 'notif-stack', 'aria-live': 'polite', 'aria-atomic': 'false' });
  root.append(stack);
}

export function notify({ title, body, icon, timeout = 5200, onClick } = {}) {
  if (!stack) return;
  const close = el('button', { class: 'notif-close', type: 'button', 'aria-label': t('Sluit melding'), html: sym('xmark', 10) });
  const card = el('div', { class: 'notif' }, [
    icon ? el('div', { class: 'notif-ic', html: icon }) : null,
    el('div', { class: 'notif-text' }, [
      el('div', { class: 'notif-title', text: title || '' }),
      body ? el('div', { class: 'notif-body', text: body }) : null,
    ]),
    close,
  ]);
  if (onClick) { card.classList.add('clickable'); card.addEventListener('click', (e) => { if (e.target.closest('.notif-close')) return; onClick(); dismiss(); }); }
  close.addEventListener('click', (e) => { e.stopPropagation(); dismiss(); });
  stack.append(card);
  requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add('in')));
  let timer = setTimeout(dismiss, timeout);
  // Pauzeer het verdwijnen zolang de muis erboven staat (macOS-gedrag).
  card.addEventListener('pointerenter', () => clearTimeout(timer));
  card.addEventListener('pointerleave', () => { timer = setTimeout(dismiss, 1800); });
  function dismiss() {
    clearTimeout(timer);
    card.classList.remove('in'); card.classList.add('out');
    if (prefersReducedMotion()) card.remove(); else setTimeout(() => card.remove(), 320);
  }
  return dismiss;
}

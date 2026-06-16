// ============================================================
// os/notifications.js — banner-notificaties (rechtsboven)
// ============================================================
import { el } from '../core/dom.js';

let stack = null;

export function initNotifications(root) {
  stack = el('div', { class: 'notif-stack', role: 'status', 'aria-live': 'polite' });
  root.append(stack);
}

export function notify({ title, body, icon, timeout = 5200, onClick } = {}) {
  if (!stack) return;
  const card = el('div', { class: 'notif', role: 'alert' }, [
    icon ? el('div', { class: 'notif-ic', html: icon }) : null,
    el('div', { class: 'notif-text' }, [
      el('div', { class: 'notif-title', text: title || '' }),
      body ? el('div', { class: 'notif-body', text: body }) : null,
    ]),
  ].filter(Boolean));
  if (onClick) { card.style.cursor = 'pointer'; card.addEventListener('click', () => { onClick(); dismiss(); }); }
  stack.append(card);
  requestAnimationFrame(() => card.classList.add('in'));
  const t = setTimeout(dismiss, timeout);
  function dismiss() { clearTimeout(t); card.classList.remove('in'); card.classList.add('out'); setTimeout(() => card.remove(), 320); }
  return dismiss;
}

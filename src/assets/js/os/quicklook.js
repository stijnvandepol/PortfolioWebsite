// ============================================================
// os/quicklook.js — Quick Look (afbeelding/tekst), met ←/→ door een reeks
//
// quickLook({ src|text, title, desc })               — één item
// quickLook({ items: [{ src, title, desc }…], index }) — reeks (pijltjes/knoppen)
// Spatie of Esc sluit, zoals in Finder.
// ============================================================
import { el, trapFocus } from '../core/dom.js';
import { sym } from '../apps/icons.js';

let overlay = null, release = null;
let items = [], index = 0;
let refs = {};

function ensure() {
  if (overlay) return;
  refs.close = el('button', { class: 'ql-btn ql-close', type: 'button', 'aria-label': 'Sluit voorvertoning', html: sym('xmark', 16), dataset: { close: '1' } });
  refs.prev = el('button', { class: 'ql-btn ql-prev', type: 'button', 'aria-label': 'Vorige', html: sym('chevron.left', 20) });
  refs.next = el('button', { class: 'ql-btn ql-next', type: 'button', 'aria-label': 'Volgende', html: sym('chevron.right', 20) });
  refs.content = el('div', { class: 'ql-content' });
  refs.title = el('p', { class: 'ql-title', 'aria-live': 'polite' });
  refs.desc = el('p', { class: 'ql-desc' });
  refs.count = el('p', { class: 'ql-count', 'aria-hidden': 'true' });
  overlay = el('div', { class: 'ql', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Voorvertoning' }, [
    el('div', { class: 'ql-backdrop', dataset: { close: '1' } }),
    el('div', { class: 'ql-panel' }, [refs.close, refs.prev, refs.content, refs.title, refs.desc, refs.count, refs.next]),
  ]);
  document.getElementById('desktop').append(overlay);
  overlay.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) close(); });
  refs.prev.addEventListener('click', () => go(-1));
  refs.next.addEventListener('click', () => go(1));
  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape' || e.key === ' ') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  });
}

function show() {
  const it = items[index];
  refs.content.replaceChildren();
  if (it.src) refs.content.append(el('img', { src: it.src, alt: it.title || '', class: 'ql-img', decoding: 'async' }));
  else if (it.text) refs.content.append(el('pre', { class: 'ql-text', text: it.text }));
  refs.title.textContent = it.title || '';
  refs.desc.textContent = it.desc || '';
  refs.desc.hidden = !it.desc;
  const many = items.length > 1;
  refs.prev.hidden = refs.next.hidden = refs.count.hidden = !many;
  refs.prev.disabled = index === 0;
  refs.next.disabled = index === items.length - 1;
  refs.count.textContent = many ? `${index + 1} van ${items.length}` : '';
}

function go(d) {
  const n = index + d;
  if (n < 0 || n >= items.length) return;
  index = n; show();
}

export function quickLook(opts) {
  ensure();
  items = opts.items || [opts];
  index = Math.max(0, Math.min(opts.index || 0, items.length - 1));
  show();
  const wasOpen = overlay.classList.contains('open');
  overlay.classList.add('open');
  if (!wasOpen) release = trapFocus(overlay.querySelector('.ql-panel'), { initial: refs.close });
}

export function close() {
  if (!overlay || !overlay.classList.contains('open')) return;
  overlay.classList.remove('open');
  release?.(); release = null;
}

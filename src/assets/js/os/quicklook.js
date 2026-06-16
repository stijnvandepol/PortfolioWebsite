// ============================================================
// os/quicklook.js — Quick Look preview-overlay (afbeelding/tekst)
// ============================================================
import { el, trapFocus, prefersReducedMotion } from '../core/dom.js';

let overlay = null;
let release = null;

function ensure() {
  if (overlay) return;
  overlay = el('div', { class: 'ql', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Quick Look' }, [
    el('div', { class: 'ql-backdrop', dataset: { close: '1' } }),
    el('div', { class: 'ql-panel' }, [
      el('button', { class: 'ql-close', 'aria-label': 'Sluit', dataset: { close: '1' }, text: '×' }),
      el('div', { class: 'ql-content' }),
      el('p', { class: 'ql-title' }),
    ]),
  ]);
  document.getElementById('desktop').append(overlay);
  overlay.addEventListener('click', (e) => { if (e.target.dataset.close) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('open')) close(); });
}

export function quickLook({ src, text, title }) {
  ensure();
  const content = overlay.querySelector('.ql-content');
  const titleEl = overlay.querySelector('.ql-title');
  content.replaceChildren();
  if (src) content.append(el('img', { src, alt: title || '', class: 'ql-img' }));
  else if (text) content.append(el('pre', { class: 'ql-text', text }));
  titleEl.textContent = title || '';
  overlay.classList.add('open');
  release = trapFocus(overlay.querySelector('.ql-panel'), { initial: overlay.querySelector('.ql-close') });
}

export function close() {
  if (!overlay) return;
  overlay.classList.remove('open');
  release?.(); release = null;
}

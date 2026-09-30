// ============================================================
// core/view.js — desktop- of eenvoudige weergave (bewust gekozen, onthouden)
// ============================================================
const KEY = 'svdp.view';

export function setView(mode) {
  let stored = true;
  try {
    if (mode === 'simple') localStorage.setItem(KEY, 'simple'); else localStorage.removeItem(KEY);
  } catch { stored = false; }
  const url = new URL(location.href);
  url.searchParams.delete('view');
  if (mode === 'simple' && !stored) url.searchParams.set('view', 'simple'); // opslag geblokkeerd: via de URL
  if (url.href === location.href) location.reload(); else location.assign(url.href);
}

export const isSimple = () => document.documentElement.classList.contains('is-simple');

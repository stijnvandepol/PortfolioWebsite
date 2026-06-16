// ============================================================
// os/spotlight.js — ⌘Space globaal zoeken (apps, pagina's, projecten, acties)
// ============================================================
import { el, qsa, trapFocus } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { os } from './bridge.js';
import { ICONS } from '../apps/icons.js';

let overlay = null, input = null, results = null, release = null, index = [], sel = 0;

function buildIndex() {
  const items = [];
  const p = CONFIG.profile;
  os.listApps().forEach((a) => items.push({ type: 'App', label: a.title, icon: ICONS.search, run: () => os.open(a.id) }));
  [['Over Mij', 'over-mij'], ['Ontwikkeling', 'ontwikkeling'], ['Portfolio', 'portfolio'], ['Blog', 'blog']]
    .forEach(([label, page]) => items.push({ type: 'Pagina', label, icon: ICONS.folder, run: () => os.open('portfolio', { initialPage: page }) }));
  CONFIG.projects.forEach((pr) => items.push({ type: 'Project', label: pr.title, sub: pr.tags, icon: ICONS.eye, run: () => os.preview({ src: pr.image, title: pr.title }) }));
  (CONFIG.blog || []).forEach((b) => items.push({ type: 'Blog', label: b.title, sub: b.category, icon: ICONS.share, run: () => os.openExternal(b.url) }));
  // Sociale kanalen (Instagram bewust níét: dat is de verstopte terminal-easter-egg)
  items.push({ type: 'Sociaal', label: 'GitHub', sub: 'github.com', icon: ICONS.share, run: () => os.openExternal(p.github) });
  items.push({ type: 'Sociaal', label: 'LinkedIn', sub: 'linkedin.com', icon: ICONS.share, run: () => os.openExternal(p.linkedin) });
  // Contact & acties
  items.push({ type: 'Actie', label: 'Stuur e-mail', sub: p.email, icon: ICONS.mail, run: () => os.openExternal(`mailto:${p.email}`) });
  items.push({ type: 'Actie', label: 'CV bekijken', sub: 'PDF', icon: ICONS.file, run: () => window.open(p.cv, '_blank', 'noopener,noreferrer') });
  items.push({ type: 'Actie', label: 'Thema: licht', icon: ICONS.sun, run: () => os.setTheme('light') });
  items.push({ type: 'Actie', label: 'Thema: donker', icon: ICONS.moon, run: () => os.setTheme('dark') });
  items.push({ type: 'Actie', label: 'Thema: auto', icon: ICONS.moon, run: () => os.setTheme('auto') });
  return items;
}

function ensure() {
  if (overlay) return;
  input = el('input', { class: 'sl-input', type: 'text', placeholder: 'Spotlight-zoeken', 'aria-label': 'Spotlight zoeken', autocomplete: 'off', spellcheck: false });
  results = el('div', { class: 'sl-results', role: 'listbox' });
  overlay = el('div', { class: 'spotlight', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Spotlight' }, [
    el('div', { class: 'sl-backdrop', dataset: { close: '1' } }),
    el('div', { class: 'sl-panel' }, [
      el('div', { class: 'sl-bar' }, [el('span', { class: 'sl-ic', html: ICONS.search }), input]),
      results,
    ]),
  ]);
  document.getElementById('desktop').append(overlay);
  overlay.addEventListener('click', (e) => { if (e.target.dataset.close) close(); });
  input.addEventListener('input', render);
  input.addEventListener('keydown', onKey);
}

function render() {
  const q = input.value.trim().toLowerCase();
  const matches = (q ? index.filter((i) => i.label.toLowerCase().includes(q) || (i.sub || '').toLowerCase().includes(q) || (i.type || '').toLowerCase().includes(q)) : index).slice(0, 8);
  sel = 0;
  results.replaceChildren();
  matches.forEach((m, i) => {
    const row = el('button', { class: `sl-row${i === 0 ? ' sel' : ''}`, role: 'option', 'aria-selected': i === 0 ? 'true' : 'false' }, [
      el('span', { class: 'sl-row-ic', html: m.icon || '' }),
      el('span', { class: 'sl-row-main' }, [el('span', { class: 'sl-row-label', text: m.label }), m.sub ? el('span', { class: 'sl-row-sub', text: m.sub }) : null].filter(Boolean)),
      el('span', { class: 'sl-row-type', text: m.type }),
    ]);
    row.addEventListener('click', () => { m.run(); close(); });
    results.append(row);
  });
  results._matches = matches;
}

function onKey(e) {
  const rows = qsa('.sl-row', results);
  if (e.key === 'ArrowDown') { sel = Math.min(rows.length - 1, sel + 1); updateSel(rows); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); updateSel(rows); e.preventDefault(); }
  else if (e.key === 'Enter') { const m = results._matches?.[sel]; if (m) { m.run(); close(); } }
  else if (e.key === 'Escape') { close(); }
}
function updateSel(rows) { rows.forEach((r, i) => { r.classList.toggle('sel', i === sel); r.setAttribute('aria-selected', i === sel); }); rows[sel]?.scrollIntoView({ block: 'nearest' }); }

export function openSpotlight() {
  ensure();
  index = buildIndex();
  input.value = '';
  render();
  overlay.classList.add('open');
  release = trapFocus(overlay.querySelector('.sl-panel'), { initial: input });
}
export function close() { if (!overlay) return; overlay.classList.remove('open'); release?.(); release = null; }
export function toggleSpotlight() { overlay?.classList.contains('open') ? close() : openSpotlight(); }

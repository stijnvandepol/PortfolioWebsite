// ============================================================
// os/spotlight.js — ⌘K / Ctrl+K globaal zoeken
// Apps, pagina's, projecten, ervaring, vaardigheden en acties.
// Alle zoektermen moeten passen (accent-/hoofdletteronafhankelijk).
// ============================================================
import { el, qsa, trapFocus } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { os } from './bridge.js';
import { sym } from '../apps/icons.js';

let overlay = null, input = null, results = null, release = null;
let index = [], shown = [], sel = 0;
const GROUP_ORDER = ['Pagina', 'Project', 'Ervaring', 'Vaardigheid', 'App', 'Actie'];
const GROUP_LABEL = { App: 'Apps', Pagina: 'Pagina\'s', Project: 'Projecten', Ervaring: 'Ervaring & opleiding', Vaardigheid: 'Vaardigheden', Actie: 'Acties' };

const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function buildIndex() {
  const p = CONFIG.profile;
  const items = [];
  os.listApps().forEach((a) => items.push({ type: 'App', label: a.title, sub: a.kind === 'system' ? 'Systeem-app' : 'Portfolio-app', iconHtml: a.icon, tile: true, run: () => os.activate(a.id) }));
  [['Home', 'home', 'person'], ['Projecten', 'projecten', 'grid'], ['Ervaring', 'ervaring', 'briefcase'], ['Skills', 'skills', 'chart'],
   ['Contact', 'contact', 'envelope'], ['CV', 'cv', 'doc']]
    .forEach(([label, page, ic]) => items.push({ type: 'Pagina', label, sub: 'Portfolio', iconHtml: sym(ic, 17), run: () => os.open('portfolio', { initialPage: page }) }));

  CONFIG.projects.forEach((pr) => items.push({ type: 'Project', label: pr.title, sub: `${pr.subtitle} · ${pr.tags.join(', ')}`, iconHtml: sym(pr.kind === 'web' ? 'globe' : 'grid', 17), run: () => os.open('portfolio', { initialPage: `projecten/${pr.id}` }) }));
  CONFIG.experience.forEach((e) => items.push({ type: 'Ervaring', label: `${e.role} — ${e.org}`, sub: `${e.period} · ${e.tags.join(', ')}`, iconHtml: sym('briefcase', 17), run: () => os.open('portfolio', { initialPage: 'ervaring' }) }));
  CONFIG.education.forEach((e) => items.push({ type: 'Ervaring', label: `${e.title} — ${e.org}`, sub: e.period, iconHtml: sym('cap', 17), run: () => os.open('portfolio', { initialPage: 'opleiding' }) }));
  CONFIG.skills.forEach((g) => items.push({ type: 'Vaardigheid', label: g.category, sub: g.items.join(', '), iconHtml: sym(g.icon, 17), run: () => os.open('portfolio', { initialPage: 'skills' }) }));

  // Instagram bewust níét: dat is de verstopte terminal-easter-egg.
  items.push({ type: 'Actie', label: 'Stuur e-mail', sub: p.email, iconHtml: sym('envelope', 17), run: () => os.open('contact') });
  items.push({ type: 'Actie', label: 'Download CV', sub: 'PDF', iconHtml: sym('download', 17), run: () => os.openFile(p.cv) });
  items.push({ type: 'Actie', label: 'GitHub', sub: 'github.com', iconHtml: sym('external', 17), run: () => os.openExternal(p.github) });
  items.push({ type: 'Actie', label: 'LinkedIn', sub: 'linkedin.com', iconHtml: sym('external', 17), run: () => os.openExternal(p.linkedin) });
  items.push({ type: 'Actie', label: 'Weergave: licht', iconHtml: sym('sun', 17), run: () => os.setTheme('light') });
  items.push({ type: 'Actie', label: 'Weergave: donker', iconHtml: sym('moon', 17), run: () => os.setTheme('dark') });
  items.push({ type: 'Actie', label: 'Weergave: automatisch', iconHtml: sym('auto', 17), run: () => os.setTheme('auto') });
  items.push({ type: 'Actie', label: 'Eenvoudige weergave (gewone pagina)', iconHtml: sym('list', 17), run: () => os.setView('simple') });
  items.push({ type: 'Actie', label: 'Sneltoetsen tonen', iconHtml: sym('keyboard', 17), run: () => os.open('settings', { initialPage: 'keyboard' }) });
  items.forEach((i) => { i.hay = norm(`${i.label} ${i.sub || ''} ${GROUP_LABEL[i.type]}`); i.nl = norm(i.label); });
  return items;
}

function search(q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) {
    // Suggesties: alle apps + een paar handige acties
    return index.filter((i) => i.type === 'Pagina' || ['Stuur e-mail', 'Download CV'].includes(i.label)).slice(0, 9);
  }
  const scored = index
    .filter((i) => terms.every((t) => i.hay.includes(t)))
    .map((i) => ({ i, score: i.nl.startsWith(terms[0]) ? 0 : i.nl.includes(terms[0]) ? 1 : 2 }))
    .sort((a, b) => a.score - b.score || GROUP_ORDER.indexOf(a.i.type) - GROUP_ORDER.indexOf(b.i.type))
    .slice(0, 9);
  // Groepen blijven aaneengesloten; de groep met de beste treffer staat bovenaan.
  const best = new Map();
  scored.forEach(({ i, score }) => { if (!best.has(i.type) || score < best.get(i.type)) best.set(i.type, score); });
  return [...best.keys()]
    .sort((a, b) => best.get(a) - best.get(b) || GROUP_ORDER.indexOf(a) - GROUP_ORDER.indexOf(b))
    .flatMap((type) => scored.filter((x) => x.i.type === type).map((x) => x.i));
}

function ensure() {
  if (overlay) return;
  input = el('input', {
    class: 'sl-input', type: 'text', placeholder: 'Zoek in mijn portfolio', autocomplete: 'off', spellcheck: false,
    role: 'combobox', 'aria-label': 'Zoeken', 'aria-expanded': 'true', 'aria-controls': 'sl-results', 'aria-autocomplete': 'list',
  });
  results = el('div', { class: 'sl-results', id: 'sl-results', role: 'listbox', 'aria-label': 'Resultaten' });
  overlay = el('div', { class: 'spotlight', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Zoeken' }, [
    el('div', { class: 'sl-backdrop', dataset: { close: '1' } }),
    el('div', { class: 'sl-panel' }, [
      el('div', { class: 'sl-bar' }, [el('span', { class: 'sl-ic', html: sym('search', 20) }), input]),
      results,
      el('div', { class: 'sl-foot', 'aria-hidden': 'true' }, [
        el('span', { html: '<kbd>↑</kbd><kbd>↓</kbd> navigeer' }), el('span', { html: '<kbd>↵</kbd> open' }), el('span', { html: '<kbd>esc</kbd> sluit' }),
      ]),
    ]),
  ]);
  document.getElementById('desktop').append(overlay);
  overlay.addEventListener('click', (e) => { if (e.target.dataset.close) close(); });
  input.addEventListener('input', render);
  input.addEventListener('keydown', onKey);
}

function render() {
  shown = search(input.value);
  sel = 0;
  results.replaceChildren();
  if (!shown.length) {
    results.append(el('div', { class: 'sl-empty', text: `Geen resultaten voor “${input.value.trim()}”` }));
    input.removeAttribute('aria-activedescendant');
    return;
  }
  let lastType = null, group = null;
  shown.forEach((m, i) => {
    if (m.type !== lastType) {
      lastType = m.type;
      const hid = `sl-g-${m.type}`;
      group = el('div', { class: 'sl-group', role: 'group', 'aria-labelledby': hid }, [el('div', { class: 'sl-group-label', id: hid, text: GROUP_LABEL[m.type] })]);
      results.append(group);
    }
    const row = el('div', { class: `sl-row${i === 0 ? ' sel' : ''}`, id: `sl-r-${i}`, role: 'option', 'aria-selected': i === 0 ? 'true' : 'false' }, [
      el('span', { class: `sl-row-ic${m.tile ? ' tile' : ''}`, html: m.iconHtml || '' }),
      el('span', { class: 'sl-row-main' }, [el('span', { class: 'sl-row-label', text: m.label }), m.sub ? el('span', { class: 'sl-row-sub', text: m.sub }) : null]),
    ]);
    row.addEventListener('click', () => { close(); m.run(); });
    row.addEventListener('pointermove', () => { if (sel !== i) { sel = i; updateSel(); } });
    group.append(row);
  });
  input.setAttribute('aria-activedescendant', 'sl-r-0');
}

function updateSel() {
  qsa('.sl-row', results).forEach((r, i) => { r.classList.toggle('sel', i === sel); r.setAttribute('aria-selected', String(i === sel)); });
  input.setAttribute('aria-activedescendant', `sl-r-${sel}`);
  qsa('.sl-row', results)[sel]?.scrollIntoView({ block: 'nearest' });
}

function onKey(e) {
  if (e.key === 'ArrowDown') { sel = Math.min(shown.length - 1, sel + 1); updateSel(); e.preventDefault(); }
  else if (e.key === 'ArrowUp') { sel = Math.max(0, sel - 1); updateSel(); e.preventDefault(); }
  else if (e.key === 'Enter') { const m = shown[sel]; if (m) { e.preventDefault(); close(); m.run(); } }
  else if (e.key === 'Escape') { e.preventDefault(); close(); }
}

export function openSpotlight() {
  ensure();
  index = buildIndex();
  input.value = '';
  render();
  overlay.classList.add('open');
  release = trapFocus(overlay.querySelector('.sl-panel'), { initial: input });
}
export function close() { if (!overlay?.classList.contains('open')) return; overlay.classList.remove('open'); release?.(); release = null; }
export function toggleSpotlight() { overlay?.classList.contains('open') ? close() : openSpotlight(); }

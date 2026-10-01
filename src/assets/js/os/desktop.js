// ============================================================
// os/desktop.js — bureaublad-iconen, selectie en rechtsklik-menu
// ============================================================
import { el, qsa } from '../core/dom.js';
import { os } from './bridge.js';
import { APP_ICONS } from '../apps/icons.js';
import { showContextMenu } from './contextmenu.js';
import { CONFIG } from '../data/config.js';
import { store } from '../core/store.js';
import { setView } from '../core/view.js';

const DESKTOP_ICONS = [
  { id: 'projecten', label: 'Projecten', icon: APP_ICONS.folder, open: () => os.open('portfolio', { initialPage: 'projecten' }) },
  { id: 'cv', label: 'CV.pdf', icon: APP_ICONS.cv, open: () => os.openFile(CONFIG.profile.cv) },
];

export function initDesktop(root) {
  const layer = el('div', { class: 'desktop-icons', role: 'group', 'aria-label': 'Bureaublad' });
  DESKTOP_ICONS.forEach((item) => {
    const cell = el('button', { class: 'desk-icon', type: 'button', dataset: { id: item.id }, 'aria-label': item.label }, [
      el('div', { class: 'desk-icon-img', html: item.icon }),
      el('span', { class: 'desk-icon-label', text: item.label }),
    ]);
    // Portfolio-eerst: één klik opent (macOS vraagt dubbelklik, maar dat verbergt informatie voor wie het niet kent).
    cell.addEventListener('click', (e) => { e.stopPropagation(); select(cell); item.open(); });
    cell.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') item.open();
      else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const cells = qsa('.desk-icon', layer); const i = cells.indexOf(cell);
        const n = cells[(i + (e.key === 'ArrowDown' ? 1 : -1) + cells.length) % cells.length];
        n.focus(); select(n);
      }
    });
    cell.addEventListener('focus', () => select(cell));
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation(); select(cell);
      showContextMenu(e.clientX, e.clientY, [{ label: 'Open', action: () => item.open() }]);
    });
    layer.append(cell);
  });
  root.append(layer);

  function select(cell) { qsa('.desk-icon', layer).forEach((c) => c.classList.toggle('selected', c === cell)); }
  function clearSel() { qsa('.desk-icon.selected', layer).forEach((c) => c.classList.remove('selected')); }

  const wallpaper = root.querySelector('.wallpaper') || root;
  wallpaper.addEventListener('pointerdown', clearSel);
  wallpaper.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, [
      { label: 'Nieuw Finder-venster', action: () => os.open('finder', { fresh: true }) },
      { label: 'Open Terminal', action: () => os.open('terminal', { fresh: true }) },
      { divider: true },
      { label: 'Weergave aanpassen…', action: () => os.open('settings') },
      { label: 'Over dit portfolio', action: () => os.open('about') },
    ]);
  });
  // Escape-route: zonder vensters blijft het bureaublad nooit leeg en ratelloos.
  const hint = el('div', { class: 'desk-hint', hidden: true, role: 'status' }, [
    el('p', { class: 'desk-hint-title', text: 'Alle vensters zijn gesloten' }),
    el('div', { class: 'desk-hint-actions' }, [
      el('button', { class: 'btn btn-primary', type: 'button', text: 'Open Portfolio', onclick: () => os.open('portfolio', { initialPage: 'home' }) }),
      el('button', { class: 'btn', type: 'button', text: 'Eenvoudige weergave', onclick: () => setView('simple') }),
    ]),
  ]);
  root.append(hint);
  store.on('windows', (list) => { hint.hidden = list.length > 0 || !store.get('booted'); });

  return layer;
}

// ============================================================
// os/desktop.js — bureaublad-iconen, selectie en rechtsklik-menu
// ============================================================
import { el, qsa } from '../core/dom.js';
import { os } from './bridge.js';
import { APP_ICONS } from '../apps/icons.js';
import { showContextMenu } from './contextmenu.js';
import { CONFIG } from '../data/config.js';

const DESKTOP_ICONS = [
  { id: 'projecten', label: 'Projecten', icon: APP_ICONS.folder, open: () => os.open('portfolio', { initialPage: 'portfolio' }) },
  { id: 'cv', label: 'CV.pdf', icon: APP_ICONS.cv, open: () => os.openFile(CONFIG.profile.cv) },
];

export function initDesktop(root) {
  const layer = el('div', { class: 'desktop-icons', role: 'group', 'aria-label': 'Bureaublad' });
  DESKTOP_ICONS.forEach((item) => {
    const cell = el('button', { class: 'desk-icon', type: 'button', dataset: { id: item.id }, 'aria-label': `${item.label} — dubbelklik of Enter om te openen` }, [
      el('div', { class: 'desk-icon-img', html: item.icon }),
      el('span', { class: 'desk-icon-label', text: item.label }),
    ]);
    cell.addEventListener('click', (e) => { e.stopPropagation(); select(cell); });
    cell.addEventListener('dblclick', () => item.open());
    // Op touch bestaat geen dubbelklik: één tik opent.
    cell.addEventListener('pointerup', (e) => { if (e.pointerType === 'touch') item.open(); });
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
  return layer;
}

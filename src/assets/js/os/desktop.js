// ============================================================
// os/desktop.js — bureaublad-iconen, selectie en rechtsklik-menu
// ============================================================
import { el, qsa } from '../core/dom.js';
import { os } from './bridge.js';
import { APP_ICONS, iconImg } from '../apps/icons.js';
import { showContextMenu } from './contextmenu.js';
import { CONFIG } from '../data/config.js';

const DESKTOP_ICONS = [
  { id: 'projecten', label: 'Projecten', icon: iconImg('photos', 'Projecten'), open: () => os.open('portfolio', { initialPage: 'portfolio' }) },
  { id: 'cv', label: 'CV.pdf', icon: fileIcon(), open: () => window.open(CONFIG.profile.cv, '_blank', 'noopener,noreferrer') },
  { id: 'trash', label: 'Prullenmand', icon: APP_ICONS.trash, open: () => os.open('finder', { initial: 'Downloads' }) },
];

function fileIcon() {
  return '<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="12" y="6" width="40" height="52" rx="6" fill="#fff"/><path d="M40 6l12 12H40z" fill="#cfd6dd"/><rect x="20" y="40" width="24" height="7" rx="2" fill="#ff4b4b"/><text x="32" y="46" font-size="5" font-family="Helvetica" font-weight="700" fill="#fff" text-anchor="middle">PDF</text><g stroke="#c7ced6" stroke-width="2"><path d="M20 26h24M20 32h24"/></g></svg>';
}

export function initDesktop(root) {
  const layer = el('div', { class: 'desktop-icons', role: 'list', 'aria-label': 'Bureaublad' });
  DESKTOP_ICONS.forEach((item) => {
    const cell = el('button', { class: 'desk-icon', role: 'listitem', dataset: { id: item.id }, 'aria-label': item.label }, [
      el('div', { class: 'desk-icon-img', html: item.icon }),
      el('span', { class: 'desk-icon-label', text: item.label }),
    ]);
    cell.addEventListener('click', (e) => { e.stopPropagation(); select(cell); });
    cell.addEventListener('dblclick', () => item.open());
    cell.addEventListener('keydown', (e) => { if (e.key === 'Enter') item.open(); });
    cell.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation(); select(cell);
      showContextMenu(e.clientX, e.clientY, [
        { label: 'Open', action: () => item.open() },
        { divider: true },
        { label: 'Toon info', disabled: true },
      ]);
    });
    layer.append(cell);
  });
  root.append(layer);

  function select(cell) { qsa('.desk-icon', layer).forEach((c) => c.classList.toggle('selected', c === cell)); }
  function clearSel() { qsa('.desk-icon.selected', layer).forEach((c) => c.classList.remove('selected')); }

  const wallpaper = root.querySelector('.wallpaper') || root;
  wallpaper.addEventListener('click', clearSel);
  wallpaper.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, [
      { label: 'Over dit Portfolio', action: () => os.openExternal(`${CONFIG.profile.github}/PortfolioWebsite`) },
      { divider: true },
      { label: 'Open Portfolio', action: () => os.open('portfolio') },
      { label: 'Open Terminal', action: () => os.open('terminal') },
      { divider: true },
      { label: 'Wijzig achtergrond…', action: () => os.open('settings') },
    ]);
  });

  return layer;
}

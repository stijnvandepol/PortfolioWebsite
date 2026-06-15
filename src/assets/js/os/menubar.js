// ============================================================
// os/menubar.js — dynamische menubar + control center + klok
// ============================================================
import { el, qsa, prefersReducedMotion } from '../core/dom.js';
import { store } from '../core/store.js';
import { setTheme } from '../core/theme.js';
import { getActiveApp, getActiveAppMenus, closeActive } from './windowManager.js';
import { os } from './bridge.js';
import { ICONS } from '../apps/icons.js';
import { CONFIG } from '../data/config.js';

const DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];

export function initMenubar(root) {
  const appName = el('span', { class: 'mb-item mb-bold mb-appname', text: 'Finder' });
  const left = el('div', { class: 'mb-left' }, [
    el('span', { class: 'mb-logo', text: 'SvdP', 'aria-hidden': 'true' }),
    appName,
  ]);

  const clockLabel = el('span', { class: 'mb-clock-label' });
  const clock = el('button', { class: 'mb-right-item mb-clock', 'aria-label': 'Datum en tijd' }, [clockLabel]);
  const ccBtn = el('button', { class: 'mb-right-item', 'aria-label': 'Bedieningspaneel', html: ccIcon() });
  const spot = el('button', { class: 'mb-right-item', 'aria-label': 'Spotlight', html: ICONS.search });
  const wifi = el('span', { class: 'mb-right-item', 'aria-hidden': 'true', html: ICONS.wifi });
  const right = el('div', { class: 'mb-right' }, [wifi, ccBtn, spot, clock]);

  const bar = el('header', { class: 'menubar', role: 'menubar' }, [left, right]);
  root.append(bar);

  spot.addEventListener('click', (e) => { e.stopPropagation(); os.toggleSpotlight(); });

  // ---- Dropdown infrastructuur ----
  let open = null;
  function closeMenus() { qsa('.mb-menu.open', bar).forEach((m) => m.classList.remove('open')); ccPop.classList.remove('open'); clockPop.classList.remove('open'); open = null; }
  document.addEventListener('click', closeMenus);

  function menu(label, items, { bold } = {}) {
    const trigger = el('span', { class: `mb-item${bold ? ' mb-bold' : ''}`, text: label, tabindex: '0', role: 'menuitem' });
    const dd = el('div', { class: 'mb-dropdown' }, items.map(renderItem));
    const wrap = el('div', { class: 'mb-menu' }, [trigger, dd]);
    trigger.addEventListener('click', (e) => { e.stopPropagation(); const wasOpen = wrap.classList.contains('open'); closeMenus(); if (!wasOpen) { wrap.classList.add('open'); open = wrap; } });
    trigger.addEventListener('mouseenter', () => { if (open && open !== wrap) { closeMenus(); wrap.classList.add('open'); open = wrap; } });
    return wrap;
  }
  function renderItem(it) {
    if (it.divider) return el('div', { class: 'dd-divider' });
    const row = el('div', { class: `dd-item${it.disabled ? ' disabled' : ''}` }, [
      el('span', { text: it.label }),
      it.key ? el('span', { class: 'dd-key', html: it.key }) : null,
    ].filter(Boolean));
    if (!it.disabled && it.action) row.addEventListener('click', (e) => { e.stopPropagation(); closeMenus(); it.action(); });
    return row;
  }

  // ---- Menubar opnieuw opbouwen per actieve app ----
  function rebuild() {
    const app = getActiveApp();
    const name = app ? appShortName(app) : 'Finder';
    appName.textContent = name;
    // verwijder bestaande dynamische menus
    qsa('.mb-menu', bar).forEach((m) => m.remove());

    const ordered = [
      menu(name, [
        { label: `Over ${name}`, action: () => os.openExternal(CONFIG.profile.github) },
        { divider: true },
        { label: 'Voorkeuren…', key: '&#8984;,', action: () => os.open('settings') },
        { divider: true },
        { label: 'Sluit venster', key: '&#8984;W', action: () => closeActive(), disabled: !app },
      ], { bold: true }),
      ...(getActiveAppMenus() || []).map((m) =>
        menu(m.label, m.items.map((i) => ({ label: i.label, key: i.key, action: i.action, disabled: i.disabled })))),
      menu('Ga', [
        { label: 'GitHub', key: '&#8679;&#8984;G', action: () => os.openExternal(CONFIG.profile.github) },
        { label: 'LinkedIn', key: '&#8679;&#8984;L', action: () => os.openExternal(CONFIG.profile.linkedin) },
        { label: 'Instagram', action: () => os.openExternal(CONFIG.profile.instagram) },
        { divider: true },
        { label: 'Stuur e-mail', action: () => os.openExternal(`mailto:${CONFIG.profile.email}`) },
      ]),
      menu('Help', [
        { label: 'Spotlight', key: '&#8984;␣', action: () => os.toggleSpotlight() },
        { label: 'Launchpad', key: 'F4', action: () => os.toggleLaunchpad() },
        { divider: true },
        { label: 'Broncode op GitHub', action: () => os.openExternal(`${CONFIG.profile.github}/PortfolioWebsite`) },
      ]),
    ];

    let anchor = appName;
    ordered.forEach((m) => { anchor.after(m); anchor = m; });
  }

  store.on('activeWindowId', rebuild);
  store.on('windows', rebuild);

  // ---- Control Center popover ----
  const ccPop = el('div', { class: 'mb-dropdown cc-pop' });
  buildControlCenter(ccPop);
  ccBtn.append(ccPop);
  ccBtn.addEventListener('click', (e) => { e.stopPropagation(); const w = ccPop.classList.contains('open'); closeMenus(); if (!w) ccPop.classList.add('open'); });

  // ---- Klok + kalender popover ----
  const clockPop = el('div', { class: 'mb-dropdown clock-pop' });
  clock.append(clockPop);
  clock.addEventListener('click', (e) => { e.stopPropagation(); const w = clockPop.classList.contains('open'); closeMenus(); if (!w) { renderCalendar(clockPop); clockPop.classList.add('open'); } });

  function tick() {
    const now = new Date();
    clockLabel.textContent = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}  ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
  tick(); setInterval(tick, 10000);

  rebuild();
  return bar;
}

function appShortName(app) {
  return ({ portfolio: 'Safari', finder: 'Finder', terminal: 'Terminal', settings: 'Instellingen' })[app.id] || app.title;
}

function ccIcon() {
  return '<svg width="16" height="15" viewBox="0 0 24 22" fill="currentColor"><rect x="1" y="1" width="22" height="9" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="6.5" cy="5.5" r="2.4"/><rect x="1" y="12" width="22" height="9" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.4"/><circle cx="17.5" cy="16.5" r="2.4"/></svg>';
}

function buildControlCenter(pop) {
  const seg = el('div', { class: 'cc-theme' }, [
    el('button', { class: 'cc-seg', dataset: { t: 'light' }, html: `${ICONS.sun} <span>Licht</span>` }),
    el('button', { class: 'cc-seg', dataset: { t: 'dark' }, html: `${ICONS.moon} <span>Donker</span>` }),
    el('button', { class: 'cc-seg', dataset: { t: 'auto' }, text: 'Auto' }),
  ]);
  function sync() { seg.querySelectorAll('.cc-seg').forEach((b) => b.classList.toggle('active', b.dataset.t === store.get('theme'))); }
  seg.addEventListener('click', (e) => { const b = e.target.closest('.cc-seg'); if (!b) return; setTheme(b.dataset.t); sync(); });
  store.on('theme', sync); sync();
  pop.append(el('div', { class: 'cc-title', text: 'Weergave' }), seg);
}

function renderCalendar(pop) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const first = (new Date(y, m, 1).getDay() + 6) % 7; // ma=0
  const days = new Date(y, m + 1, 0).getDate();
  const head = el('div', { class: 'cal-head', text: `${['januari','februari','maart','april','mei','juni','juli','augustus','september','oktober','november','december'][m]} ${y}` });
  const grid = el('div', { class: 'cal-grid' });
  ['M','D','W','D','V','Z','Z'].forEach((d) => grid.append(el('span', { class: 'cal-dow', text: d })));
  for (let i = 0; i < first; i++) grid.append(el('span', {}));
  for (let d = 1; d <= days; d++) grid.append(el('span', { class: `cal-day${d === now.getDate() ? ' today' : ''}`, text: String(d) }));
  pop.replaceChildren(head, grid);
}

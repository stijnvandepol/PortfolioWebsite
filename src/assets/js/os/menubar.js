// ============================================================
// os/menubar.js — menubalk (Apple-menu, app-menu, standaardmenu's, status)
//
// Standaardmenu's volgen de macOS-volgorde: Apple · App · Bestand · Bewerken
// · Weergave · Ga · Venster · Help. Dropdowns worden pas bij het openen
// gevuld, zodat vensterlijst en disabled-states altijd actueel zijn.
// Toetsenbord: ←/→ wisselt van menu, ↓/Enter opent, Esc sluit.
// ============================================================
import { el, qsa } from '../core/dom.js';
import { store } from '../core/store.js';
import {
  getActiveApp, getActiveAppMenus, getActiveWindow, getActiveBody,
  closeActive, closeAll, minimizeActive, toggleMaximizeActive, snapActive, bringAllToFront, focusWindowById,
} from './windowManager.js';
import { buildMenu, moveFocus } from './menu.js';
import { os } from './bridge.js';
import { sym, batterySym, S_MARK } from '../apps/icons.js';
import { CONFIG } from '../data/config.js';
import { setView } from '../core/view.js';
import { appearanceControl, accentPicker, motionSwitch, transparencySwitch } from '../ui/controls.js';

const DAYS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'];
const MONTHS = ['jan', 'feb', 'mrt', 'apr', 'mei', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
const MONTHS_LONG = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];

const menuName = (app) => app?.menuName || app?.title || 'Finder';

export function initMenubar(root) {
  const bar = el('header', { class: 'menubar' });
  const left = el('div', { class: 'mb-left', role: 'menubar', 'aria-label': 'Menubalk' });
  const right = el('div', { class: 'mb-right', role: 'group', 'aria-label': 'Status' });
  bar.append(left, right);
  root.append(bar);

  const menus = [];            // { key, wrap, trigger, panel, items() | render() }
  let openM = null;

  // ---- Infrastructuur ------------------------------------------------------
  function closeMenus({ returnFocus = false } = {}) {
    if (!openM) return;
    const m = openM; openM = null;
    m.wrap.classList.remove('open');
    m.trigger.setAttribute('aria-expanded', 'false');
    m.panel.replaceChildren();
    if (returnFocus) m.trigger.focus({ preventScroll: true });
  }

  function openMenu(m, { focusFirst = false } = {}) {
    if (openM === m) return;
    closeMenus();
    m.panel.replaceChildren();
    if (m.items) {
      const menu = buildMenu(m.items(), { label: m.label, onClose: (o) => closeMenus({ returnFocus: !!o?.escape }), onKey: (e) => onMenuKey(e, m) });
      m.panel.append(menu);
      if (focusFirst) moveFocus(menu, 'first');
    } else {
      const content = m.render();
      m.panel.append(content);
    }
    m.wrap.classList.add('open');
    m.trigger.setAttribute('aria-expanded', 'true');
    openM = m;
  }

  function neighbour(m, dir) {
    const list = menus.filter((x) => x.items); // alleen echte menu's, geen status-popovers
    const i = list.indexOf(m);
    return list[(i + dir + list.length) % list.length];
  }
  function onMenuKey(e, m) {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      openMenu(neighbour(m, e.key === 'ArrowRight' ? 1 : -1), { focusFirst: true });
    }
  }

  function register(m, host) {
    m.wrap = el('div', { class: `mb-menu${m.status ? ' mb-status' : ''}`, role: 'none' });
    m.panel = el('div', { class: `mb-dropdown${m.align === 'right' ? ' align-right' : ''}${m.popover ? ' mb-popover' : ''}` });
    m.wrap.append(m.trigger, m.panel);
    m.trigger.setAttribute('aria-haspopup', m.items ? 'menu' : 'dialog');
    m.trigger.setAttribute('aria-expanded', 'false');
    m.trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (openM === m) closeMenus(); else openMenu(m);
    });
    // Zodra één menu open is, opent hover over een andere titel dat menu direct.
    m.trigger.addEventListener('pointerenter', () => { if (openM && openM !== m && m.items && openM.items) openMenu(m); });
    m.trigger.addEventListener('keydown', (e) => {
      if (!m.items) { if (e.key === 'Escape') closeMenus({ returnFocus: true }); return; }
      if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); openMenu(m, { focusFirst: true }); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        const n = neighbour(m, e.key === 'ArrowRight' ? 1 : -1);
        n.trigger.focus();
        if (openM) openMenu(n);
      } else if (e.key === 'Escape') closeMenus({ returnFocus: true });
    });
    menus.push(m);
    host.append(m.wrap);
  }

  document.addEventListener('pointerdown', (e) => { if (openM && !bar.contains(e.target)) closeMenus(); }, true);
  window.addEventListener('blur', () => closeMenus());
  // Esc vanuit een popover (waar geen menu-toetsenbord actief is)
  bar.addEventListener('keydown', (e) => { if (e.key === 'Escape' && openM) { e.stopPropagation(); closeMenus({ returnFocus: true }); } });

  const trigger = (label, cls = '') => el('button', { class: `mb-item ${cls}`.trim(), type: 'button', role: 'menuitem', text: label });

  // ---- Items ------------------------------------------------------------
  const activeApp = () => getActiveApp();
  const hasWin = () => !!getActiveWindow();

  const appleItems = () => [
    { label: 'Over dit portfolio', action: () => os.open('about') },
    { divider: true },
    { label: 'Systeeminstellingen…', key: '⌘,', action: () => os.open('settings') },
    { divider: true },
    { label: 'Eenvoudige weergave (gewone pagina)', action: () => setView('simple') },
    { label: 'Broncode op GitHub', action: () => os.openExternal(`${CONFIG.profile.github}/PortfolioWebsite`) },
    { divider: true },
    { label: 'Sluit alle vensters', key: '⌥⌘W', action: () => closeAll(), disabled: !store.get('windows').length },
  ];

  const appItems = () => {
    const app = activeApp();
    const name = menuName(app);
    return [
      { label: `Over ${name}`, action: () => os.open('about') },
      { divider: true },
      { label: 'Instellingen…', key: '⌘,', action: () => os.open('settings') },
      { divider: true },
      { label: `Stop ${name}`, action: () => (app ? os.closeApp(app.id) : null), disabled: !app },
    ];
  };

  const fileItems = () => {
    const ctx = getActiveAppMenus();
    const items = [...(ctx.file || [])];
    if (!items.length) items.push({ label: 'Nieuw Finder-venster', action: () => os.open('finder', { fresh: true }) });
    items.push({ divider: true }, { label: 'Sluit venster', key: '⌘W', action: () => closeActive(), disabled: !hasWin() });
    return items;
  };

  const copySelection = async () => {
    const text = String(getSelection());
    if (!text) return;
    try { await navigator.clipboard.writeText(text); } catch { document.execCommand?.('copy'); }
  };
  const selectAll = () => {
    const body = getActiveBody();
    if (!body) return;
    const r = document.createRange(); r.selectNodeContents(body);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
  };
  const editItems = () => {
    const ctx = getActiveAppMenus();
    return [
      { label: 'Kopieer', key: '⌘C', action: copySelection, disabled: !String(getSelection()) },
      { label: 'Selecteer alles', key: '⌘A', action: selectAll, disabled: !hasWin() },
      { divider: true },
      { label: 'Zoek…', key: '⌘F', action: () => (ctx.find ? ctx.find() : os.toggleSpotlight()) },
    ];
  };

  const viewItems = () => {
    const ctx = getActiveAppMenus();
    const w = getActiveWindow();
    const items = [...(ctx.view || [])];
    if (items.length) items.push({ divider: true });
    items.push({ label: w?.maximized ? 'Herstel venstergrootte' : 'Vul scherm', action: () => toggleMaximizeActive(), disabled: !w || !w.zoomable });
    return items;
  };

  const goItems = () => [
    { label: 'Home', action: () => os.open('portfolio', { initialPage: 'home' }) },
    { label: 'Projecten', action: () => os.open('portfolio', { initialPage: 'projecten' }) },
    { label: 'Ervaring', action: () => os.open('portfolio', { initialPage: 'ervaring' }) },
    { label: 'Skills', action: () => os.open('portfolio', { initialPage: 'skills' }) },
    { label: 'Contact', action: () => os.open('portfolio', { initialPage: 'contact' }) },
    { label: 'CV', action: () => os.open('portfolio', { initialPage: 'cv' }) },
    { divider: true },
    { label: 'GitHub', action: () => os.openExternal(CONFIG.profile.github) },
    { label: 'LinkedIn', action: () => os.openExternal(CONFIG.profile.linkedin) },
  ];

  const windowItems = () => {
    const w = getActiveWindow();
    const list = store.get('windows');
    const items = [
      { label: 'Minimaliseer', key: '⌘M', action: () => minimizeActive(), disabled: !w },
      { label: 'Zoom', action: () => toggleMaximizeActive(), disabled: !w || !w.zoomable },
      { divider: true },
      { label: 'Vul scherm', action: () => snapActive('max'), disabled: !w || !w.zoomable },
      { label: 'Links', action: () => snapActive('left'), disabled: !w || !w.zoomable },
      { label: 'Rechts', action: () => snapActive('right'), disabled: !w || !w.zoomable },
      { label: 'Herstel', action: () => snapActive(null), disabled: !w || !(w.maximized || w.snapState) },
      { divider: true },
      { label: 'Breng alles naar voren', action: () => bringAllToFront(), disabled: !list.length },
    ];
    if (list.length) {
      items.push({ divider: true });
      [...list].sort((a, b) => a.title.localeCompare(b.title, 'nl')).forEach((x) =>
        items.push({ label: x.minimized ? `${x.title} (geminimaliseerd)` : x.title, checked: x.focused, action: () => focusWindowById(x.id) }));
    }
    return items;
  };

  const helpItems = () => [
    { label: 'Zoek…', key: '⌘K', action: () => os.toggleSpotlight() },
    { label: 'Sneltoetsen', action: () => os.open('settings', { initialPage: 'keyboard' }) },
    { label: 'Eenvoudige weergave', action: () => setView('simple') },
    { divider: true },
    { label: 'Launchpad', key: 'F4', action: () => os.toggleLaunchpad() },
  ];

  // ---- Linkerkant --------------------------------------------------------
  const logo = el('button', { class: 'mb-item mb-logo', type: 'button', role: 'menuitem', 'aria-label': 'Portfolio-menu', html: S_MARK });
  register({ key: 'apple', label: 'Portfolio-menu', trigger: logo, items: appleItems }, left);

  const nameTrigger = trigger(menuName(null), 'mb-bold');
  register({ key: 'app', label: 'App-menu', trigger: nameTrigger, items: appItems }, left);

  [['file', 'Bestand', fileItems], ['edit', 'Bewerken', editItems], ['view', 'Weergave', viewItems],
   ['go', 'Ga', goItems], ['window', 'Venster', windowItems], ['help', 'Help', helpItems]]
    .forEach(([key, label, items]) => register({ key, label, trigger: trigger(label), items }, left));

  store.on('activeWindowId', () => { nameTrigger.textContent = menuName(activeApp()); });

  // ---- Rechterkant: status -----------------------------------------------
  // Netwerk (echte online-status)
  const netIcon = el('span', { class: 'mb-status-icon', role: 'img' });
  const setNet = () => {
    const on = navigator.onLine;
    netIcon.innerHTML = sym(on ? 'wifi' : 'wifi.slash', 16);
    netIcon.setAttribute('aria-label', on ? 'Netwerk: verbonden' : 'Netwerk: offline');
    netIcon.title = on ? 'Verbonden' : 'Geen verbinding';
  };
  setNet();
  window.addEventListener('online', setNet); window.addEventListener('offline', setNet);
  right.append(netIcon);

  // Batterij: alleen tonen wanneer de browser het echt kan melden
  const battery = el('span', { class: 'mb-status-icon mb-battery', role: 'img', hidden: true });
  right.append(battery);
  navigator.getBattery?.().then((b) => {
    const paint = () => {
      battery.hidden = false;
      battery.innerHTML = batterySym(b.level, b.charging);
      const pct = Math.round(b.level * 100);
      battery.setAttribute('aria-label', `Batterij ${pct}%${b.charging ? ', laadt op' : ''}`);
      battery.title = `${pct}%${b.charging ? ' — laadt op' : ''}`;
    };
    paint();
    ['levelchange', 'chargingchange'].forEach((t) => b.addEventListener(t, paint));
  }).catch(() => {});

  // Bedieningspaneel
  const ccTrigger = el('button', { class: 'mb-item mb-icon-btn', type: 'button', 'aria-label': 'Bedieningspaneel', html: sym('control', 16) });
  register({
    key: 'cc', trigger: ccTrigger, status: true, popover: true, align: 'right',
    render: () => {
      const motionId = 'cc-motion', transId = 'cc-trans';
      const row = (label, id, control) => el('div', { class: 'cc-row' }, [el('span', { id, class: 'cc-row-label', text: label }), control]);
      const settings = el('button', { class: 'cc-link', type: 'button', text: 'Systeeminstellingen…' });
      settings.addEventListener('click', () => { closeMenus(); os.open('settings'); });
      return el('div', { class: 'cc', role: 'dialog', 'aria-label': 'Bedieningspaneel' }, [
        el('div', { class: 'cc-title', text: 'Weergave' }), appearanceControl(),
        el('div', { class: 'cc-title', text: 'Accentkleur' }), accentPicker(),
        el('div', { class: 'cc-divider' }),
        row('Verminder beweging', motionId, motionSwitch(motionId)),
        row('Verminder transparantie', transId, transparencySwitch(transId)),
        el('div', { class: 'cc-divider' }),
        settings,
      ]);
    },
  }, right);

  // Spotlight
  const spot = el('button', { class: 'mb-item mb-icon-btn', type: 'button', 'aria-label': 'Zoeken (⌘K)', title: 'Zoeken (⌘K)', html: sym('search', 16) });
  spot.addEventListener('click', (e) => { e.stopPropagation(); closeMenus(); os.toggleSpotlight(); });
  right.append(spot);

  // Klok + kalender
  const clockLabel = el('span', { class: 'mb-clock-label' });
  const clock = el('button', { class: 'mb-item mb-clock', type: 'button' }, [clockLabel]);
  let calMonth = null;
  register({
    key: 'clock', trigger: clock, status: true, popover: true, align: 'right',
    render: () => { calMonth = new Date(); calMonth.setDate(1); return calendar(); },
  }, right);

  function calendar() {
    const wrap = el('div', { class: 'cal', role: 'dialog', 'aria-label': 'Kalender' });
    const paint = () => {
      const now = new Date();
      const y = calMonth.getFullYear(), m = calMonth.getMonth();
      const first = (new Date(y, m, 1).getDay() + 6) % 7; // maandag = 0
      const days = new Date(y, m + 1, 0).getDate();
      const prev = el('button', { class: 'cal-nav', type: 'button', 'aria-label': 'Vorige maand', html: sym('chevron.left', 14) });
      const next = el('button', { class: 'cal-nav', type: 'button', 'aria-label': 'Volgende maand', html: sym('chevron.right', 14) });
      prev.addEventListener('click', () => { calMonth.setMonth(m - 1); paint(); });
      next.addEventListener('click', () => { calMonth.setMonth(m + 1); paint(); });
      const grid = el('div', { class: 'cal-grid' });
      ['M', 'D', 'W', 'D', 'V', 'Z', 'Z'].forEach((d) => grid.append(el('span', { class: 'cal-dow', 'aria-hidden': 'true', text: d })));
      for (let i = 0; i < first; i++) grid.append(el('span'));
      for (let d = 1; d <= days; d++) {
        const today = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
        grid.append(el('span', { class: `cal-day${today ? ' today' : ''}`, 'aria-current': today ? 'date' : null, text: String(d) }));
      }
      wrap.replaceChildren(
        el('div', { class: 'cal-head' }, [el('span', { class: 'cal-title', text: `${MONTHS_LONG[m]} ${y}` }), el('span', { class: 'cal-navs' }, [prev, next])]),
        grid,
      );
    };
    paint();
    return wrap;
  }

  function tick() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0'), mm = String(now.getMinutes()).padStart(2, '0');
    clockLabel.textContent = `${DAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}  ${hh}:${mm}`;
    // Zichtbare tekst blijft de toegankelijke naam (WCAG 2.5.3); de volledige datum staat in de tooltip.
    clock.title = `${now.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${hh}:${mm}`;
  }
  tick();
  // Klok tikt op de minuutgrens i.p.v. een vast interval te laten driften.
  (function schedule() { setTimeout(() => { tick(); schedule(); }, 60000 - (Date.now() % 60000) + 50); })();

  return bar;
}

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
import { t, tc, lang, LOCALE } from '../core/i18n.js';

const DAY = new Intl.DateTimeFormat(LOCALE, { weekday: 'short' });
const MONTH = new Intl.DateTimeFormat(LOCALE, { month: 'short' });
const MONTH_LONG = new Intl.DateTimeFormat(LOCALE, { month: 'long' });
const TIME = new Intl.DateTimeFormat(LOCALE, { hour: 'numeric', minute: '2-digit' });
// Week begint op maandag (nl) of zondag (en-US). 1 jan 2024 is een maandag.
const WEEK_START = lang === 'en' ? 0 : 1;
const DOW = Array.from({ length: 7 }, (_, i) => new Intl.DateTimeFormat(LOCALE, { weekday: 'narrow' }).format(new Date(2024, 0, i + WEEK_START)));

const menuName = (app) => app?.menuName || app?.title || 'Finder';

export function initMenubar(root) {
  const bar = el('header', { class: 'menubar' });
  const left = el('div', { class: 'mb-left', role: 'menubar', 'aria-label': t('Menubalk') });
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
    bar.classList.remove('menu-open');
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
    bar.classList.add('menu-open');   // tilt de hele menubalk boven meldingen (eigen stacking context)
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
    { label: t('Over dit portfolio'), action: () => os.open('about') },
    { divider: true },
    { label: t('Systeeminstellingen…'), key: '⌘,', action: () => os.open('settings') },
    { divider: true },
    { label: t('Eenvoudige weergave (gewone pagina)'), action: () => setView('simple') },
    { label: t('Broncode op GitHub'), action: () => os.openExternal(`${CONFIG.profile.github}/PortfolioWebsite`) },
    { divider: true },
    { label: t('Sluit alle vensters'), key: '⌥⌘W', action: () => closeAll(), disabled: !store.get('windows').length },
  ];

  const appItems = () => {
    const app = activeApp();
    const name = menuName(app);
    return [
      { label: t('Over {name}', { name }), action: () => os.open('about') },
      { divider: true },
      { label: t('Instellingen…'), key: '⌘,', action: () => os.open('settings') },
      { divider: true },
      { label: t('Stop {name}', { name }), action: () => (app ? os.closeApp(app.id) : null), disabled: !app },
    ];
  };

  const fileItems = () => {
    const ctx = getActiveAppMenus();
    const items = [...(ctx.file || [])];
    if (!items.length) items.push({ label: t('Nieuw Finder-venster'), action: () => os.open('finder', { fresh: true }) });
    items.push({ divider: true }, { label: t('Sluit venster'), key: '⌘W', action: () => closeActive(), disabled: !hasWin() });
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
      { label: t('Kopieer'), key: '⌘C', action: copySelection, disabled: !String(getSelection()) },
      { label: t('Selecteer alles'), key: '⌘A', action: selectAll, disabled: !hasWin() },
      { divider: true },
      { label: t('Zoek…'), key: '⌘F', action: () => (ctx.find ? ctx.find() : os.toggleSpotlight()) },
    ];
  };

  const viewItems = () => {
    const ctx = getActiveAppMenus();
    const w = getActiveWindow();
    const items = [...(ctx.view || [])];
    if (items.length) items.push({ divider: true });
    items.push({ label: w?.maximized ? t('Herstel venstergrootte') : t('Vul scherm'), action: () => toggleMaximizeActive(), disabled: !w || !w.zoomable });
    return items;
  };

  const goItems = () => [
    { label: 'Home', action: () => os.open('portfolio', { initialPage: 'home' }) },
    { label: t('Projecten'), action: () => os.open('portfolio', { initialPage: 'projecten' }) },
    { label: t('Ervaring'), action: () => os.open('portfolio', { initialPage: 'ervaring' }) },
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
      { label: t('Minimaliseer'), key: '⌘M', action: () => minimizeActive(), disabled: !w },
      { label: 'Zoom', action: () => toggleMaximizeActive(), disabled: !w || !w.zoomable },
      { divider: true },
      { label: t('Vul scherm'), action: () => snapActive('max'), disabled: !w || !w.zoomable },
      { label: t('Links'), action: () => snapActive('left'), disabled: !w || !w.zoomable },
      { label: t('Rechts'), action: () => snapActive('right'), disabled: !w || !w.zoomable },
      { label: t('Herstel'), action: () => snapActive(null), disabled: !w || !(w.maximized || w.snapState) },
      { divider: true },
      { label: t('Breng alles naar voren'), action: () => bringAllToFront(), disabled: !list.length },
    ];
    if (list.length) {
      items.push({ divider: true });
      [...list].sort((a, b) => a.title.localeCompare(b.title, LOCALE)).forEach((x) =>
        items.push({ label: x.minimized ? t('{title} (geminimaliseerd)', { title: x.title }) : x.title, checked: x.focused, action: () => focusWindowById(x.id) }));
    }
    return items;
  };

  const helpItems = () => [
    { label: tc('help', 'Zoek…'), key: '⌘K', action: () => os.toggleSpotlight() },
    { label: t('Sneltoetsen'), action: () => os.open('settings', { initialPage: 'keyboard' }) },
    { label: t('Eenvoudige weergave'), action: () => setView('simple') },
    { divider: true },
    { label: 'Launchpad', key: 'F4', action: () => os.toggleLaunchpad() },
  ];

  // ---- Linkerkant --------------------------------------------------------
  const logo = el('button', { class: 'mb-item mb-logo', type: 'button', role: 'menuitem', 'aria-label': t('Portfolio-menu'), html: S_MARK });
  register({ key: 'apple', label: t('Portfolio-menu'), trigger: logo, items: appleItems }, left);

  const nameTrigger = trigger(menuName(null), 'mb-bold');
  register({ key: 'app', label: t('App-menu'), trigger: nameTrigger, items: appItems }, left);

  [['file', t('Bestand'), fileItems], ['edit', t('Bewerken'), editItems], ['view', t('Weergave'), viewItems],
   ['go', t('Ga'), goItems], ['window', t('Venster'), windowItems], ['help', 'Help', helpItems]]
    .forEach(([key, label, items]) => register({ key, label, trigger: trigger(label), items }, left));

  store.on('activeWindowId', () => { nameTrigger.textContent = menuName(activeApp()); });

  // ---- Rechterkant: status -----------------------------------------------
  // Netwerk: echte online-status; klik toont een Wi-Fi-paneel met de verbindingsgegevens die de browser kent.
  const netTrigger = el('button', { class: 'mb-item mb-icon-btn', type: 'button' });
  const setNet = () => {
    const on = navigator.onLine;
    netTrigger.innerHTML = sym(on ? 'wifi' : 'wifi.slash', 16);
    netTrigger.setAttribute('aria-label', on ? t('Wi-Fi: verbonden') : t('Wi-Fi: geen verbinding'));
    if (openM?.key === 'net') openM.panel.replaceChildren(openM.render());
  };
  register({
    key: 'net', trigger: netTrigger, status: true, popover: true, align: 'right',
    render: () => {
      const on = navigator.onLine;
      const c = navigator.connection;
      const facts = [];
      if (on && c?.downlink) facts.push([t('Snelheid'), `± ${c.downlink >= 10 ? Math.round(c.downlink) : c.downlink.toLocaleString(LOCALE)} Mbit/s`]);
      if (on && c?.rtt) facts.push([t('Vertraging'), `${c.rtt} ms`]);
      if (on && c?.effectiveType) facts.push([t('Kwaliteit'), c.effectiveType.toUpperCase()]);
      const host = location.hostname && !/^(127\.|localhost$)/.test(location.hostname) ? location.hostname : t('Lokaal netwerk');
      return el('div', { class: 'cc wifi', role: 'dialog', 'aria-label': 'Wi-Fi' }, [
        el('div', { class: 'wifi-head' }, [
          el('span', { class: 'wifi-title', text: 'Wi-Fi' }),
          el('span', { class: `wifi-state${on ? ' on' : ''}`, text: on ? t('Verbonden') : t('Geen verbinding') }),
        ]),
        el('div', { class: 'cc-divider' }),
        el('div', { class: 'cc-title', text: on ? t('Bekend netwerk') : t('Netwerk') }),
        el('div', { class: `wifi-net${on ? ' on' : ''}` }, [
          el('span', { class: 'wifi-net-ic', html: sym(on ? 'wifi' : 'wifi.slash', 14) }),
          el('span', { class: 'wifi-net-name', text: on ? host : t('Niet verbonden') }),
          on ? el('span', { class: 'wifi-net-lock', html: sym('lock', 12) }) : null,
        ]),
        facts.length ? el('dl', { class: 'wifi-facts' }, facts.flatMap(([k, v]) => [el('dt', { text: k }), el('dd', { text: v })])) : null,
      ]);
    },
  }, right);
  setNet();
  window.addEventListener('online', setNet); window.addEventListener('offline', setNet);

  // Batterij: alleen tonen wanneer de browser het echt kan melden
  const battery = el('span', { class: 'mb-status-icon mb-battery', role: 'img', hidden: true });
  right.append(battery);
  navigator.getBattery?.().then((b) => {
    const paint = () => {
      battery.hidden = false;
      battery.innerHTML = batterySym(b.level, b.charging);
      const pct = Math.round(b.level * 100);
      battery.setAttribute('aria-label', b.charging ? t('Batterij {pct}%, laadt op', { pct }) : t('Batterij {pct}%', { pct }));
      battery.title = b.charging ? t('{pct}%, laadt op', { pct }) : `${pct}%`;
    };
    paint();
    ['levelchange', 'chargingchange'].forEach((t) => b.addEventListener(t, paint));
  }).catch(() => {});

  // Bedieningspaneel
  const ccTrigger = el('button', { class: 'mb-item mb-icon-btn', type: 'button', 'aria-label': t('Bedieningspaneel'), html: sym('control', 16) });
  register({
    key: 'cc', trigger: ccTrigger, status: true, popover: true, align: 'right',
    render: () => {
      const motionId = 'cc-motion', transId = 'cc-trans';
      const row = (label, id, control) => el('div', { class: 'cc-row' }, [el('span', { id, class: 'cc-row-label', text: label }), control]);
      const settings = el('button', { class: 'cc-link', type: 'button', text: t('Systeeminstellingen…') });
      settings.addEventListener('click', () => { closeMenus(); os.open('settings'); });
      return el('div', { class: 'cc', role: 'dialog', 'aria-label': t('Bedieningspaneel') }, [
        el('div', { class: 'cc-title', text: tc('thema', 'Weergave') }), appearanceControl(),
        el('div', { class: 'cc-title', text: t('Accentkleur') }), accentPicker(),
        el('div', { class: 'cc-divider' }),
        row(t('Verminder beweging'), motionId, motionSwitch(motionId)),
        row(t('Verminder transparantie'), transId, transparencySwitch(transId)),
        el('div', { class: 'cc-divider' }),
        settings,
      ]);
    },
  }, right);

  // Spotlight
  const spot = el('button', { class: 'mb-item mb-icon-btn', type: 'button', 'aria-label': t('Zoeken (⌘K)'), title: t('Zoeken (⌘K)'), html: sym('search', 16) });
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
    const wrap = el('div', { class: 'cal', role: 'dialog', 'aria-label': t('Kalender') });
    const paint = () => {
      const now = new Date();
      const y = calMonth.getFullYear(), m = calMonth.getMonth();
      const first = (new Date(y, m, 1).getDay() - WEEK_START + 7) % 7; // lege vakjes vóór de 1e
      const days = new Date(y, m + 1, 0).getDate();
      const prev = el('button', { class: 'cal-nav', type: 'button', 'aria-label': t('Vorige maand'), html: sym('chevron.left', 14) });
      const next = el('button', { class: 'cal-nav', type: 'button', 'aria-label': t('Volgende maand'), html: sym('chevron.right', 14) });
      prev.addEventListener('click', () => { calMonth.setMonth(m - 1); paint(); });
      next.addEventListener('click', () => { calMonth.setMonth(m + 1); paint(); });
      const grid = el('div', { class: 'cal-grid' });
      DOW.forEach((d) => grid.append(el('span', { class: 'cal-dow', 'aria-hidden': 'true', text: d })));
      for (let i = 0; i < first; i++) grid.append(el('span'));
      for (let d = 1; d <= days; d++) {
        const today = d === now.getDate() && m === now.getMonth() && y === now.getFullYear();
        grid.append(el('span', { class: `cal-day${today ? ' today' : ''}`, 'aria-current': today ? 'date' : null, text: String(d) }));
      }
      wrap.replaceChildren(
        el('div', { class: 'cal-head' }, [el('span', { class: 'cal-title', text: `${MONTH_LONG.format(calMonth)} ${y}` }), el('span', { class: 'cal-navs' }, [prev, next])]),
        grid,
      );
    };
    paint();
    return wrap;
  }

  function tick() {
    const now = new Date();
    const time = TIME.format(now);
    // Zoals macOS: "vr 6 nov 15:45" in het Nederlands, "Fri Nov 6 3:45 PM" in het Engels.
    const date = lang === 'en' ? `${DAY.format(now)} ${MONTH.format(now)} ${now.getDate()}` : `${DAY.format(now)} ${now.getDate()} ${MONTH.format(now)}`;
    clockLabel.textContent = `${date}  ${time}`;
    // Zichtbare tekst blijft de toegankelijke naam (WCAG 2.5.3); de volledige datum staat in de tooltip.
    clock.title = `${now.toLocaleDateString(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}, ${time}`;
  }
  tick();
  // Klok tikt op de minuutgrens i.p.v. een vast interval te laten driften.
  (function schedule() { setTimeout(() => { tick(); schedule(); }, 60000 - (Date.now() % 60000) + 50); })();

  return bar;
}

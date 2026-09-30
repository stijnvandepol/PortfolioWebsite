// ============================================================
// os/dock.js — Dock
//
//  - magnificatie (cosinus-falloff; posities worden analytisch berekend,
//    dus geen layout-reads tijdens het bewegen)
//  - running-indicator, launch-bounce (alleen bij starten, niet bij focussen)
//  - geminimaliseerde vensters als tegels rechts van de scheiding;
//    getDockTarget() vertelt de window manager waar hij naartoe moet animeren
//  - contextmenu per app (Open / Sluit)
// ============================================================
import { el, prefersReducedMotion } from '../core/dom.js';
import { store } from '../core/store.js';
import { os } from './bridge.js';
import { showContextMenu } from './contextmenu.js';

const BASE = 46;          // rustgrootte icoon (px)
const PEAK = 76;          // grootte onder de cursor (groter laat iconen over venster-glas uitsteken: dat halveert de framerate)
const RADIUS = 130;       // afstand (px) waarover de vergroting uitdooft
const GAP = 4;            // ruimte tussen iconen
const SEP_W = 9;          // breedte scheidingslijn incl. marges
const LIFT = 10;          // maximale optilling bij magnificatie

let dockEl = null, itemsEl = null, tilesSep = null;
const icons = [];         // { el (icoon), host (button), current, target }
const tiles = new Map();  // winId -> { host, icon, meta }
let iconFor = () => '';
let kick = () => {};

const falloff = (d) => {
  const t = Math.min(1, Math.abs(d) / RADIUS);
  return (1 + Math.cos(Math.PI * t)) / 2;
};

export function initDock(root, entries, { appIcon } = {}) {
  if (appIcon) iconFor = appIcon;
  itemsEl = el('div', { class: 'dock-items' });
  dockEl = el('nav', { class: 'dock', 'aria-label': 'Dock' }, [el('div', { class: 'dock-el' }, [itemsEl])]);
  tilesSep = el('div', { class: 'dock-sep dock-sep-tiles', 'aria-hidden': 'true', hidden: true });

  entries.forEach((entry) => {
    if (entry.sep) { itemsEl.append(el('div', { class: 'dock-sep', 'aria-hidden': 'true' })); return; }
    itemsEl.append(buildItem(entry));
  });
  itemsEl.append(tilesSep);
  root.append(dockEl);

  // Magnificatie
  let raf = null, hovering = false, pointerX = 0;
  function refreshTargets() {
    const map = restCenters();
    icons.forEach((d) => {
      if (d.leaving) return;
      d.target = BASE + (PEAK - BASE) * falloff(pointerX - (map.get(d.host) ?? -9999));
    });
  }
  let last = 0;
  function frame(now = performance.now()) {
    // Tijdgebaseerd (niet framegebaseerd): even snel op 30, 60 of 120 Hz.
    const dt = Math.min(64, last ? now - last : 16.7);
    last = now;
    const k = prefersReducedMotion() ? 1 : 1 - Math.exp(-dt / 52);
    let need = false;
    icons.forEach((d) => {
      const diff = d.target - d.current;
      if (Math.abs(diff) > 0.15) { d.current += diff * k; need = true; } else d.current = d.target;
      const w = Math.max(0, d.current);
      d.el.style.width = `${w}px`;
      d.el.style.height = `${w}px`;
      const lift = w > BASE ? ((w - BASE) / (PEAK - BASE)) * LIFT : 0;
      d.el.style.translate = `0 ${-lift}px`;
      if (d.leaving && d.current <= 0.5) d.done?.();
    });
    raf = (need || hovering) ? requestAnimationFrame(frame) : null;
    if (!raf) last = 0;
  }
  kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  dockEl.addEventListener('pointermove', (e) => {
    // Alleen touch overslaan. Vergroting volgt direct de cursor en blijft (zoals op macOS)
    // ook aan bij 'Verminder beweging'; dan springt hij zonder na-ijlen (zie frame()).
    if (e.pointerType === 'touch') return;
    hovering = true; pointerX = e.clientX;
    refreshTargets(); kick();
  });
  dockEl.addEventListener('pointerleave', () => {
    hovering = false;
    icons.forEach((d) => { if (!d.leaving) d.target = BASE; });
    kick();
  });

  // Running-indicatoren + geminimaliseerde tegels reageren op de store.
  store.on('runningApps', (running) => {
    itemsEl.querySelectorAll('.di[data-dock]').forEach((di) => {
      di.querySelector('.di-dot')?.classList.toggle('active', running.includes(di.dataset.dock));
    });
  });
  store.on('windows', syncTiles);

  // ⌃F3: toetsenbordfocus naar de Dock (Apple-standaard)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'F3' && e.ctrlKey) { e.preventDefault(); itemsEl.querySelector('.di')?.focus(); }
  });

  return dockEl;
}

/** Middelpunten (x) van alle Dock-onderdelen in rust; het Dock is horizontaal gecentreerd. */
function restCenters() {
  const kids = [...itemsEl.children].filter((k) => !k.hidden && !k.classList.contains('leaving'));
  const widths = kids.map((k) => (k.classList.contains('dock-sep') ? SEP_W : BASE));
  const total = widths.reduce((a, b) => a + b, 0) + GAP * (kids.length - 1);
  let x = window.innerWidth / 2 - total / 2;
  const map = new Map();
  kids.forEach((k, i) => { map.set(k, x + widths[i] / 2); x += widths[i] + GAP; });
  return map;
}

function buildItem(entry) {
  const icon = el('div', { class: 'di-icon', html: entry.icon, style: { width: `${BASE}px`, height: `${BASE}px` } });
  const dot = el('div', { class: 'di-dot' });
  const host = el('button', { class: 'di', type: 'button', dataset: { dock: entry.id }, 'aria-label': entry.label }, [
    el('div', { class: 'di-tip', 'aria-hidden': 'true', text: entry.label }), icon, dot,
  ]);
  host.addEventListener('click', () => {
    if (entry.href) { os.openExternal(entry.href); return; }
    const running = store.get('runningApps').includes(entry.app || entry.id);
    if (!running) bounce(host);                 // alleen bij starten
    if (entry.action) entry.action(); else os.activate(entry.id);
  });
  if (!entry.href && !entry.noMenu) {
    host.addEventListener('contextmenu', (e) => {
      e.preventDefault(); e.stopPropagation();
      const running = store.get('runningApps').includes(entry.id);
      const r = host.getBoundingClientRect();
      // Apple HIG (Dock-menu's): open vensters van de app + weinig hoogwaardige acties.
      const wins = store.get('windows').filter((w) => w.appId === entry.id);
      showContextMenu(r.left + r.width / 2, r.top - 6, [
        { label: entry.label, disabled: true },
        ...(wins.length ? [{ divider: true }, ...wins.map((w) => ({ label: w.minimized ? `${w.title} (geminimaliseerd)` : w.title, action: () => os.focusWindow(w.id) }))] : []),
        { divider: true },
        { label: running ? 'Toon' : 'Open', action: () => (entry.action ? entry.action() : os.activate(entry.id)) },
        { label: 'Sluit', hidden: !running || !entry.closable, action: () => os.closeApp(entry.id) },
      ], { placement: 'above' });
    });
  }
  icons.push({ el: icon, host, current: BASE, target: BASE });
  return host;
}

// ---- Geminimaliseerde vensters ------------------------------------------------
function syncTiles(list) {
  const minimized = list.filter((w) => w.minimized);
  const ids = new Set(minimized.map((w) => w.id));

  minimized.forEach((w) => {
    if (tiles.has(w.id)) return;
    const reduced = prefersReducedMotion();
    const icon = el('div', { class: 'di-icon', html: iconFor(w.appId), style: { width: reduced ? `${BASE}px` : '0px', height: reduced ? `${BASE}px` : '0px' } });
    const host = el('button', { class: 'di di-tile', type: 'button', dataset: { dockWin: w.id }, 'aria-label': `${w.title} — herstel venster` }, [
      el('div', { class: 'di-tip', 'aria-hidden': 'true', text: w.title }), icon,
    ]);
    host.addEventListener('click', () => os.focusWindow(w.id));
    itemsEl.append(host);
    // Groeit vanuit 0 via dezelfde animatielus als de magnificatie: het Dock schuift mee.
    icons.push({ el: icon, host, current: reduced ? BASE : 0, target: BASE });
    tiles.set(w.id, { host, icon });
    tilesSep.hidden = false;
    kick();
  });

  [...tiles.keys()].forEach((id) => {
    if (ids.has(id)) return;
    const t = tiles.get(id);
    tiles.delete(id);
    const d = icons.find((x) => x.host === t.host);
    const remove = () => {
      const i = icons.indexOf(d); if (i >= 0) icons.splice(i, 1);
      t.host.remove();
      if (!tiles.size) tilesSep.hidden = true;
    };
    t.host.classList.add('leaving');
    if (!d || prefersReducedMotion()) { remove(); return; }
    d.leaving = true; d.target = 0; d.done = remove;
    kick();
    setTimeout(() => { if (t.host.isConnected) remove(); }, 500); // vangnet
  });
}

/**
 * Middelpunt (viewport-px) waar een venster naartoe/vandaan animeert:
 * zijn eigen Dock-tegel (in eindmaat), anders het icoon van de app, anders het Dock zelf.
 */
export function getDockTarget(winId, appId) {
  if (!dockEl) return null;
  const ref = itemsEl.querySelector('.di:not(.di-tile) .di-icon');
  const tile = winId && tiles.get(winId);
  if (tile && ref) {
    const x = restCenters().get(tile.host);
    const r = ref.getBoundingClientRect();
    if (x != null) return { x, y: r.bottom - BASE / 2 };
  }
  const host = itemsEl.querySelector(`.di[data-dock="${appId}"]`);
  const target = host?.querySelector('.di-icon');
  if (target) {
    const r = target.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }
  const r = dockEl.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** Eén korte, natuurlijke sprong (twee hops) — alleen bij het starten van een app. */
export function bounce(host) {
  if (!host || prefersReducedMotion() || !host.animate) return;
  host.animate([
    { transform: 'translateY(0)', easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' },
    { transform: 'translateY(-22px)', easing: 'cubic-bezier(0.7, 0, 0.9, 0.4)', offset: 0.3 },
    { transform: 'translateY(0)', offset: 0.55 },
    { transform: 'translateY(-9px)', easing: 'cubic-bezier(0.7, 0, 0.9, 0.4)', offset: 0.72 },
    { transform: 'translateY(0)' },
  ], { duration: 680 });
}

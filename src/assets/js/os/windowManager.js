// ============================================================
// os/windowManager.js — echt vensterbeheer
//
// Meerdere vensters, focus/z-order, slepen, resizen (8 handles),
// minimaliseren naar het Dock, zoomen, tegelen (helften/kwarten) en
// aanpassing aan de viewport (kleine schermen, venster-resize).
//
// Positie loopt via de CSS-property `translate` (GPU), schaal/opacity voor
// open/minimaliseer via `transform` — die twee botsen dus nooit.
// ============================================================
import { el, clamp, prefersReducedMotion, rafThrottle } from '../core/dom.js';
import { store } from '../core/store.js';
import { getDockTarget } from './dock.js';

const SNAP_EDGE = 14;       // px tot rand om snap te triggeren
const MIN_VISIBLE = 80;     // px van een venster die altijd zichtbaar blijven bij slepen
const DBLCLICK_MS = 350;

let zCounter = 100;
const windows = new Map();  // id -> WindowInstance
let idSeq = 0;
let desktopEl = null;
let snapPreview = null;
let MENUBAR_H = 24;
let DOCK_RESERVE = 84;

const safeClamp = (v, min, max) => (max < min ? min : clamp(v, min, max));

function viewport() {
  return {
    top: MENUBAR_H,
    left: 0,
    width: window.innerWidth,
    height: window.innerHeight - MENUBAR_H,
    bottom: window.innerHeight - DOCK_RESERVE,
  };
}

function syncStore() {
  const activeId = store.get('activeWindowId');
  store.set({
    windows: [...windows.values()].map((w) => ({
      id: w.id, appId: w.app.id, title: w.title, minimized: w.minimized, focused: w.id === activeId,
    })),
    runningApps: [...new Set([...windows.values()].map((w) => w.app.id))],
  });
}

const topmost = (exclude) => [...windows.values()]
  .filter((w) => w !== exclude && !w.minimized)
  .sort((a, b) => (+b.el.style.zIndex || 0) - (+a.el.style.zIndex || 0))[0];

export function initWindowManager(desktop) {
  desktopEl = desktop;
  const cs = getComputedStyle(document.documentElement);
  MENUBAR_H = parseFloat(cs.getPropertyValue('--menubar-h')) || MENUBAR_H;
  DOCK_RESERVE = parseFloat(cs.getPropertyValue('--dock-reserve')) || DOCK_RESERVE;

  snapPreview = el('div', { class: 'snap-preview', 'aria-hidden': 'true' });
  desktopEl.append(snapPreview);

  // Sneltoetsen voor het actieve venster. (⌘W/⌘Q worden door sommige browsers
  // afgevangen vóór de pagina ze ziet; het Venster-menu biedt dezelfde acties.)
  window.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    if (e.code === 'KeyW' && e.altKey) { e.preventDefault(); closeAll(); return; }
    if (e.code === 'KeyM' && !e.altKey) { e.preventDefault(); windows.get(store.get('activeWindowId'))?.minimize(); return; }
    if (e.code === 'KeyW' && !e.altKey) { e.preventDefault(); windows.get(store.get('activeWindowId'))?.close(); }
  });

  // Vensters blijven binnen beeld wanneer de viewport verandert.
  window.addEventListener('resize', rafThrottle(() => windows.forEach((w) => w.refit())));
}

class WindowInstance {
  constructor(app) {
    this.id = `win-${++idSeq}`;
    this.app = app;
    this.title = app.title;
    this.minimized = false;
    this.maximized = false;
    this.snapState = null;
    this.preGeo = null;        // geometrie vóór zoomen/tegelen
    this._pendingSnap = null;
    this._lastTap = 0;
    this.resizable = app.resizable !== false;
    this.zoomable = app.maximizable !== false && this.resizable;
    this._build();
  }

  _build() {
    const vp = viewport();
    // `grow`: op ruime schermen groeit het venster mee (tot een maximum), zodat het niet verloren op het bureaublad staat.
    let bw = this.app.width || 760, bh = this.app.height || 520;
    if (this.app.grow) { bw = Math.min(this.app.grow.maxWidth, Math.max(bw, vp.width * 0.62)); bh = Math.min(this.app.grow.maxHeight, Math.max(bh, (vp.bottom - vp.top) * 0.78)); }
    const w = Math.min(bw, vp.width - 16);
    const h = Math.min(bh, vp.bottom - vp.top - 8);
    const offset = (windows.size % 6) * 26;
    this.geo = {
      x: safeClamp(vp.width / 2 - w / 2 + offset, 8, vp.width - w - 8),
      y: safeClamp(vp.top + 24 + offset, vp.top + 4, vp.bottom - h),
      w, h,
    };

    this.titlebarContent = el('div', { class: 'titlebar-content' });
    const lights = el('div', { class: 'traffic-lights', role: 'group', 'aria-label': 'Vensterknoppen' }, [
      this._light('close', 'Sluit venster', '<path d="M3.3 3.3l5.4 5.4M8.7 3.3 3.3 8.7" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" fill="none"/>'),
      this._light('minimize', 'Minimaliseer venster', '<path d="M2.8 6h6.4" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" fill="none"/>'),
      this._light('maximize', 'Zoom venster', '<path d="M3.1 8.9V5.1l3.8 3.8zM8.9 3.1v3.8L5.1 3.1z" fill="currentColor"/>', !this.zoomable),
    ]);
    this.titlebar = el('div', { class: 'titlebar' }, [lights, this.titlebarContent]);
    this.body = el('div', { class: 'win-body' });
    this.elClip = el('div', { class: 'win-clip' }, [this.titlebar, this.body]);
    this.elFrame = el('div', { class: 'win-border' });
    this.elResizers = this.resizable
      ? ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'].map((dir) => el('div', { class: `resizer resizer-${dir}`, dataset: { dir } }))
      : [];

    this.el = el('div', {
      class: `window app-window${this.app.chrome === 'plain' ? ' win-plain' : ''}${this.app.sidebar ? ' has-sidebar' : ''}`,
      role: 'dialog',
      'aria-label': this.app.title,
      tabindex: '-1',
      dataset: { winId: this.id, appId: this.app.id },
    }, [this.elClip, this.elFrame, ...this.elResizers]);

    // `fillBelow`: op kleinere schermen vult het venster direct het beschikbare gebied (geen handmatig vergroten nodig).
    const fb = this.app.fillBelow;
    if (fb && this.zoomable && (vp.width <= fb.width || vp.height <= fb.height)) {
      this.preGeo = { ...this.geo };
      this.snapState = 'max'; this.maximized = true;
      this.geo = this._zoneRect('max');
    }

    this._applyGeo();
    desktopEl.append(this.el);
    this._playOpen();

    this._wireFocus();
    this._wireTrafficLights();
    this._wireDrag();
    this._wireResize();

    // App vult titlebar + body en levert hooks terug.
    this.hooks = this.app.mount({ win: this, titlebar: this.titlebarContent, body: this.body }) || {};

    if (!this.titlebarContent.childNodes.length) {
      this._titleEl = el('span', { class: 'win-title', text: this.app.title });
      this.titlebarContent.append(this._titleEl);
    }
  }

  _light(action, label, glyph, disabled = false) {
    return el('button', {
      class: `tl tl-${action}`, type: 'button', 'aria-label': label, dataset: { action },
      'aria-disabled': disabled ? 'true' : null,
      html: `<svg viewBox="0 0 12 12" aria-hidden="true">${glyph}</svg>`,
    });
  }

  /** Open-animatie: het venster schaalt vanuit het Dock-icoon van de app. */
  _playOpen() {
    const t = prefersReducedMotion() ? null : getDockTarget(null, this.app.id);
    if (t) this.el.style.transformOrigin = `${t.x - this.geo.x}px ${t.y - this.geo.y}px`;
    this.el.classList.add('win-opening');
    // Alleen het eigen animationend telt: animaties van de inhoud (bubbelend) mogen de
    // open-animatie niet halverwege afkappen.
    const done = (e) => {
      if (e.target !== this.el) return;
      this.el.removeEventListener('animationend', done);
      this.el.classList.remove('win-opening');
      this.el.style.transformOrigin = '';
    };
    this.el.addEventListener('animationend', done);
  }

  _applyGeo() {
    const { x, y, w, h } = this.geo;
    const s = this.el.style;
    s.translate = `${Math.round(x)}px ${Math.round(y)}px`;
    s.width = `${Math.round(w)}px`;
    s.height = `${Math.round(h)}px`;
  }

  /** Houd het venster binnen de (gewijzigde) viewport. */
  refit() {
    if (this.minimized) return;
    const vp = viewport();
    if (this.snapState) { this.geo = this._zoneRect(this.snapState); this._applyGeo(); return; }
    const minW = this.app.minWidth || 360, minH = this.app.minHeight || 240;
    const w = Math.max(Math.min(minW, vp.width - 16), Math.min(this.geo.w, vp.width - 16));
    const x = safeClamp(this.geo.x, 8, vp.width - w - 8);
    const y = clamp(this.geo.y, vp.top + 2, Math.max(vp.top + 2, vp.bottom - 40));
    const h = Math.max(Math.min(minH, vp.bottom - vp.top - 8), Math.min(this.geo.h, vp.bottom - y));
    this.geo = { x, y, w, h };
    this._applyGeo();
  }

  _wireFocus() {
    this.el.addEventListener('pointerdown', () => { if (store.get('activeWindowId') !== this.id) this.focus(); }, true);
  }

  focus({ moveDomFocus = false } = {}) {
    if (this.minimized) this.restore();
    zCounter += 1;
    if (zCounter > 6500) normalizeZ();
    this.el.style.zIndex = zCounter;
    windows.forEach((w) => w.el.classList.toggle('focused', w === this));
    store.set({ activeWindowId: this.id });
    syncStore();
    if (moveDomFocus && !this.el.contains(document.activeElement)) this.el.focus({ preventScroll: true });
    this.hooks?.onFocus?.();
  }

  /** Laat de window manager een eigen titelelement van de app bijwerken bij setTitle(). */
  bindTitle(node) { this._titleEl = node; }

  setTitle(title, subtitle) {
    this.title = title;
    this.el.setAttribute('aria-label', title);
    if (this._titleEl) this._titleEl.textContent = title;
    this.hooks?.onTitle?.(title, subtitle);
    syncStore();
  }

  _wireTrafficLights() {
    this.titlebar.querySelectorAll('.tl').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (btn.getAttribute('aria-disabled') === 'true') return;
        const a = btn.dataset.action;
        if (a === 'close') this.close();
        else if (a === 'minimize') this.minimize();
        else if (a === 'maximize') this.toggleMaximize();
      });
    });
  }

  // ---- Slepen ---------------------------------------------------------
  _wireDrag() {
    let st = null;
    const onDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.tl, button, a, input, textarea, select, [role="tab"], .no-drag')) return;
      st = { pid: e.pointerId, sx: e.clientX, sy: e.clientY, ox: e.clientX - this.geo.x, oy: e.clientY - this.geo.y, moved: false };
      this.titlebar.setPointerCapture(e.pointerId);
    };
    const onMove = (e) => {
      if (!st || e.pointerId !== st.pid) return;
      if (!st.moved) {
        if (Math.hypot(e.clientX - st.sx, e.clientY - st.sy) < 3) return; // drempel: geen per-ongeluk-verplaatsing
        st.moved = true;
        if (this.maximized || this.snapState) {
          // Pak het venster los uit zoom/tegel onder de cursor (macOS-gedrag).
          const ratio = clamp((e.clientX - this.geo.x) / this.geo.w, 0.1, 0.9);
          this._restoreGeo();
          st.ox = this.geo.w * ratio; st.oy = 14;
        }
        this.el.classList.add('dragging');
      }
      const vp = viewport();
      this.geo.x = clamp(e.clientX - st.ox, MIN_VISIBLE - this.geo.w, vp.width - MIN_VISIBLE);
      this.geo.y = clamp(e.clientY - st.oy, vp.top + 2, vp.bottom - 40);
      this._applyGeo();
      if (this.zoomable) this._updateSnapHint(e.clientX, e.clientY);
    };
    const onUp = (e) => {
      if (!st || e.pointerId !== st.pid) return;
      const s = st; st = null;
      this.el.classList.remove('dragging');
      try { this.titlebar.releasePointerCapture(e.pointerId); } catch { /* al losgelaten */ }
      if (s.moved) { this._commitSnap(); return; }
      // Geen sleepbeweging: dubbelklik op de titelbalk = zoomen.
      const now = performance.now();
      if (now - this._lastTap < DBLCLICK_MS) { this._lastTap = 0; if (this.zoomable) this.toggleMaximize(); }
      else this._lastTap = now;
    };
    this.titlebar.addEventListener('pointerdown', onDown);
    this.titlebar.addEventListener('pointermove', onMove);
    this.titlebar.addEventListener('pointerup', onUp);
    this.titlebar.addEventListener('pointercancel', () => { st = null; this.el.classList.remove('dragging'); snapPreview.classList.remove('visible'); });
  }

  // ---- Tegelen (snap) -------------------------------------------------
  _snapZone(x, y) {
    const vp = viewport();
    const nearLeft = x <= vp.left + SNAP_EDGE;
    const nearRight = x >= vp.left + vp.width - SNAP_EDGE;
    const nearTop = y <= vp.top + SNAP_EDGE;
    const nearBottom = y >= vp.bottom + 6;
    if (nearTop && nearLeft) return 'tl';
    if (nearTop && nearRight) return 'tr';
    if (nearBottom && nearLeft) return 'bl';
    if (nearBottom && nearRight) return 'br';
    if (nearTop) return 'max';
    if (nearLeft) return 'left';
    if (nearRight) return 'right';
    return null;
  }

  _zoneRect(zone) {
    const vp = viewport();
    const halfW = vp.width / 2, fullH = vp.bottom - vp.top, halfH = fullH / 2;
    return {
      max:   { x: vp.left, y: vp.top, w: vp.width, h: fullH },
      left:  { x: vp.left, y: vp.top, w: halfW, h: fullH },
      right: { x: vp.left + halfW, y: vp.top, w: halfW, h: fullH },
      tl:    { x: vp.left, y: vp.top, w: halfW, h: halfH },
      tr:    { x: vp.left + halfW, y: vp.top, w: halfW, h: halfH },
      bl:    { x: vp.left, y: vp.top + halfH, w: halfW, h: halfH },
      br:    { x: vp.left + halfW, y: vp.top + halfH, w: halfW, h: halfH },
    }[zone];
  }

  _updateSnapHint(x, y) {
    const zone = this._snapZone(x, y);
    if (!zone) { snapPreview.classList.remove('visible'); this._pendingSnap = null; return; }
    if (zone !== this._pendingSnap) {
      const r = this._zoneRect(zone);
      Object.assign(snapPreview.style, { translate: `${r.x}px ${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    }
    snapPreview.classList.add('visible');
    this._pendingSnap = zone;
  }

  _commitSnap() {
    snapPreview.classList.remove('visible');
    const zone = this._pendingSnap;
    this._pendingSnap = null;
    if (zone) this.snapTo(zone);
  }

  /** zone: 'max' | 'left' | 'right' | 'tl' | 'tr' | 'bl' | 'br' | null (herstel) */
  snapTo(zone) {
    if (!this.zoomable) return;
    if (!zone) { if (this.maximized || this.snapState) this._animateTo(this._restoreAndGet()); return; }
    if (!this.preGeo) this.preGeo = { ...this.geo };
    this.snapState = zone;
    this.maximized = zone === 'max';
    this._animateTo(this._zoneRect(zone));
  }

  _animateTo(r) {
    if (!prefersReducedMotion()) {
      this.el.classList.add('animating');
      clearTimeout(this._animT);
      this._animT = setTimeout(() => this.el.classList.remove('animating'), 320);
    }
    this.geo = { x: r.x, y: r.y, w: r.w, h: r.h };
    this._applyGeo();
  }

  _restoreGeo() {
    if (this.preGeo) { this.geo = { ...this.preGeo }; this.preGeo = null; }
    this.maximized = false; this.snapState = null;
  }
  _restoreAndGet() {
    const g = this.preGeo ? { ...this.preGeo } : { ...this.geo };
    this.preGeo = null; this.maximized = false; this.snapState = null;
    return g;
  }

  toggleMaximize() {
    if (!this.zoomable) return;
    if (this.maximized || this.snapState) this.snapTo(null); else this.snapTo('max');
  }

  // ---- Resizen --------------------------------------------------------
  _wireResize() {
    this.elResizers.forEach((handle) => {
      let resizing = false, sx = 0, sy = 0, startGeo = null, dir = '';
      handle.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        resizing = true; dir = handle.dataset.dir;
        sx = e.clientX; sy = e.clientY; startGeo = { ...this.geo };
        this._restoreGeo();
        handle.setPointerCapture(e.pointerId);
        this.el.classList.add('resizing');
        this.focus();
      });
      handle.addEventListener('pointermove', (e) => {
        if (!resizing) return;
        const vp = viewport();
        const minW = this.app.minWidth || 360;
        const minH = this.app.minHeight || 240;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        let { x, y, w, h } = startGeo;
        if (dir.includes('e')) w = safeClamp(startGeo.w + dx, minW, vp.width - x);
        if (dir.includes('s')) h = safeClamp(startGeo.h + dy, minH, vp.bottom - y);
        if (dir.includes('w')) { const nw = safeClamp(startGeo.w - dx, minW, startGeo.x + startGeo.w - vp.left); x = startGeo.x + (startGeo.w - nw); w = nw; }
        if (dir.includes('n')) { const nh = safeClamp(startGeo.h - dy, minH, startGeo.y + startGeo.h - vp.top); y = startGeo.y + (startGeo.h - nh); h = nh; }
        this.geo = { x, y, w, h };
        this._applyGeo();
      });
      const stop = (e) => { if (!resizing) return; resizing = false; this.el.classList.remove('resizing'); try { handle.releasePointerCapture(e.pointerId); } catch { /* al losgelaten */ } };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('pointercancel', stop);
    });
  }

  // ---- Minimaliseren / herstellen (Dock) ------------------------------
  /**
   * Minimaliseren naar het Dock (macOS "Schaal"-effect met een vleugje genie):
   * het venster krimpt zichtbaar en ondoorzichtig tot precies de grootte van zijn
   * Dock-tegel en beweegt daarbij BOVEN het Dock. De breedte krimpt eerst iets
   * sneller dan de hoogte, zodat het venster "naar beneden getrokken" oogt.
   */
  _genieFrames() {
    const r = this.el.getBoundingClientRect();
    const S = 46;
    const t = getDockTarget(this.id, this.app.id) || { x: r.left + r.width / 2, y: window.innerHeight - 40 };
    const dx = t.x - (r.left + r.width / 2), dy = t.y - (r.top + r.height / 2);
    const sx = S / r.width, sy = S / r.height;
    const f = (k) => k.toFixed(4);
    return [
      { offset: 0, transform: 'translate(0px, 0px) scale(1, 1)', opacity: 1 },
      { offset: 0.45, transform: `translate(${(dx * 0.3).toFixed(1)}px, ${(dy * 0.38).toFixed(1)}px) scale(${f(0.5 + sx * 0.5)}, ${f(0.72 + sy * 0.28)})`, opacity: 1 },
      { offset: 0.85, transform: `translate(${(dx * 0.93).toFixed(1)}px, ${(dy * 0.95).toFixed(1)}px) scale(${f(sx * 1.4)}, ${f(sy * 1.6)})`, opacity: 1 },
      { offset: 1, transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) scale(${f(sx)}, ${f(sy)})`, opacity: 0 },
    ];
  }

  _stopDockAnim() { this._dockAnim?.cancel(); this._dockAnim = null; this.el.classList.remove('to-dock'); }

  minimize() {
    if (this.minimized) return;
    this.minimized = true;
    this.el.inert = true;
    this._stopDockAnim();
    syncStore();                       // Dock maakt eerst zijn tegel aan (animatiedoel)
    const next = topmost(this);
    if (next) next.focus(); else { store.set({ activeWindowId: null }); syncStore(); }
    const hide = () => { this._stopDockAnim(); this.el.classList.add('minimized'); };
    this.el.classList.add('to-dock');
    this._dockAnim = prefersReducedMotion()
      ? this.el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, easing: 'ease-out' })
      : this.el.animate(this._genieFrames(), { duration: 520, easing: 'cubic-bezier(0.5, 0, 0.3, 1)' });
    this._dockAnim.onfinish = hide;
  }

  restore() {
    if (!this.minimized) return;
    this.minimized = false;
    this.el.inert = false;
    this._stopDockAnim();
    this.el.classList.remove('minimized');
    this.el.classList.add('to-dock');
    // Omgekeerde genie vanaf de huidige Dock-tegel (die kan zijn verschoven).
    this._dockAnim = prefersReducedMotion()
      ? this.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' })
      : this.el.animate(this._genieFrames().reverse().map((k) => ({ ...k, offset: 1 - k.offset })), { duration: 460, easing: 'cubic-bezier(0.2, 0.7, 0.3, 1)' });
    this._dockAnim.onfinish = () => this._stopDockAnim();
    syncStore();
  }

  // ---- Sluiten --------------------------------------------------------
  close() {
    if (this.closed) return;
    this.closed = true;
    this.hooks?.onClose?.();
    windows.delete(this.id);
    this.el.inert = true;
    this.el.classList.add('closing');
    const wasActive = store.get('activeWindowId') === this.id;
    const next = topmost(this);
    if (wasActive) { if (next) next.focus(); else store.set({ activeWindowId: null }); }
    syncStore();
    let done = false;
    const finish = () => { if (done) return; done = true; this.el.remove(); };
    this.el.addEventListener('animationend', (e) => { if (e.target === this.el) finish(); });
    setTimeout(finish, 450); // vangnet
  }
}

function normalizeZ() {
  const ordered = [...windows.values()].sort((a, b) => (+a.el.style.zIndex || 0) - (+b.el.style.zIndex || 0));
  zCounter = 100;
  ordered.forEach((w) => { zCounter += 1; w.el.style.zIndex = zCounter; });
}

// ---- Publieke API ----------------------------------------------------------

export function openApp(app) {
  if (app.singleton) {
    const existing = [...windows.values()].find((w) => w.app.id === app.id);
    if (existing) { existing.focus({ moveDomFocus: true }); return existing; }
  }
  const inst = new WindowInstance(app);
  windows.set(inst.id, inst);
  inst.focus();
  return inst;
}

/** Breng het bovenste venster van een app naar voren (herstelt indien geminimaliseerd). */
export function focusApp(appId) {
  const list = getWindowsForApp(appId);
  if (!list.length) return false;
  const target = list.filter((w) => !w.minimized).sort((a, b) => (+b.el.style.zIndex || 0) - (+a.el.style.zIndex || 0))[0] || list[list.length - 1];
  target.focus({ moveDomFocus: true });
  return true;
}

export const isRunning = (appId) => [...windows.values()].some((w) => w.app.id === appId);
export const getActiveWindow = () => windows.get(store.get('activeWindowId')) || null;
export const getActiveApp = () => getActiveWindow()?.app || null;
export const getWindowsForApp = (appId) => [...windows.values()].filter((w) => w.app.id === appId);
export const getActiveAppMenus = () => getActiveWindow()?.hooks?.getMenus?.() || {};
export const closeActive = () => getActiveWindow()?.close();
export const minimizeActive = () => getActiveWindow()?.minimize();
export const toggleMaximizeActive = () => getActiveWindow()?.toggleMaximize();
export const snapActive = (zone) => getActiveWindow()?.snapTo(zone);
export const closeAll = () => [...windows.values()].forEach((w) => w.close());
export const focusWindowById = (id) => windows.get(id)?.focus({ moveDomFocus: true });
export function bringAllToFront() { [...windows.values()].filter((w) => !w.minimized).sort((a, b) => (+a.el.style.zIndex || 0) - (+b.el.style.zIndex || 0)).forEach((w) => w.focus()); }
/** Kopieer/selecteer-acties werken binnen het actieve venster. */
export const getActiveBody = () => getActiveWindow()?.body || null;

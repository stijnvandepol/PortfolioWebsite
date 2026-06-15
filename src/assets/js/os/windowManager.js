// ============================================================
// os/windowManager.js — echt vensterbeheer
// Meerdere vensters, focus/z-order, drag, resize (8 handles),
// minimize→dock, maximize/restore, snap (helften/kwarten).
// ============================================================
import { el, qs, clamp, prefersReducedMotion } from '../core/dom.js';
import { store } from '../core/store.js';

const Z_BASE = 100;
const MENUBAR_H = 25;
const DOCK_RESERVE = 84;
const SNAP_EDGE = 14; // px tot rand om snap te triggeren

let zCounter = Z_BASE;
const windows = new Map(); // id -> WindowInstance
let idSeq = 0;
let desktopEl = null;
let snapPreview = null;

export function initWindowManager(desktop) {
  desktopEl = desktop;
  snapPreview = el('div', { class: 'snap-preview', 'aria-hidden': 'true' });
  desktopEl.append(snapPreview);

  // Globale sneltoetsen voor het actieve venster.
  window.addEventListener('keydown', (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const active = windows.get(store.get('activeWindowId'));
    if (!active) return;
    const k = e.key.toLowerCase();
    if (k === 'w') { e.preventDefault(); active.close(); }
    else if (k === 'm') { e.preventDefault(); active.minimize(); }
  });
}

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
  store.set({
    windows: [...windows.values()].map((w) => ({
      id: w.id, appId: w.app.id, title: w.title, minimized: w.minimized,
    })),
    runningApps: [...new Set([...windows.values()].map((w) => w.app.id))],
  });
}

class WindowInstance {
  constructor(app) {
    this.id = `win-${++idSeq}`;
    this.app = app;
    this.title = app.title;
    this.minimized = false;
    this.maximized = false;
    this.snapState = null;
    this.preGeo = null; // geometrie vóór maximize/snap
    this._cleanup = [];
    this._build();
  }

  _build() {
    const vp = viewport();
    const w = this.app.width || 760;
    const h = this.app.height || 520;
    const offset = (windows.size % 6) * 28;
    this.geo = {
      x: clamp(vp.width / 2 - w / 2 + offset, 8, vp.width - w - 8),
      y: clamp(vp.top + 24 + offset, vp.top + 4, vp.bottom - 120),
      w, h,
    };

    this.titlebarContent = el('div', { class: 'titlebar-content' });
    const lights = el('div', { class: 'traffic-lights', role: 'group', 'aria-label': 'Venster knoppen' }, [
      this._light('close', 'Sluit', 'M3.5 3.5l5 5M8.5 3.5l-5 5'),
      this._light('minimize', 'Minimaliseer', 'M2.5 6h7'),
      this._light('maximize', 'Volledig scherm', 'M3 9l3-3m0 0l3-3M6 6l3 3M6 6L3 3'),
    ]);
    this.titlebar = el('div', { class: 'titlebar' }, [lights, this.titlebarContent]);

    this.body = el('div', { class: 'win-body' });

    this.elFrame = el('div', { class: 'win-border' });
    this.elShine = el('div', { class: 'win-shine' });
    this.elResizers = ['n','s','e','w','ne','nw','se','sw'].map((dir) =>
      el('div', { class: `resizer resizer-${dir}`, dataset: { dir } }));

    this.el = el('div', {
      class: 'window app-window',
      role: 'dialog',
      'aria-label': this.app.title,
      tabindex: '-1',
      dataset: { winId: this.id, appId: this.app.id },
    }, [this.elFrame, this.elShine, this.titlebar, this.body, ...this.elResizers]);

    this._applyGeo();
    desktopEl.append(this.el);

    this._wireFocus();
    this._wireTrafficLights();
    this._wireDrag();
    this._wireResize();

    // App vult titlebar + body en levert hooks terug.
    this.hooks = this.app.mount({
      win: this,
      titlebar: this.titlebarContent,
      body: this.body,
    }) || {};

    if (!this.titlebarContent.childNodes.length) {
      this.titlebarContent.append(el('span', { class: 'win-title', text: this.app.title }));
    }

    requestAnimationFrame(() => this.el.classList.add('win-opening'));
  }

  _light(action, label, path) {
    return el('button', { class: `tl tl-${action}`, 'aria-label': label, dataset: { action },
      html: `<svg viewBox="0 0 12 12"><path d="${path}" stroke="rgba(0,0,0,0.45)" stroke-width="1.3" fill="none" stroke-linecap="round"/></svg>` });
  }

  _applyGeo() {
    const { x, y, w, h } = this.geo;
    Object.assign(this.el.style, {
      left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${h}px`, transform: 'none',
    });
  }

  _wireFocus() {
    this.el.addEventListener('pointerdown', () => this.focus(), true);
  }

  focus() {
    if (this.minimized) this.restore();
    zCounter += 1;
    this.el.style.zIndex = zCounter;
    windows.forEach((w) => w.el.classList.toggle('focused', w === this));
    store.set({ activeWindowId: this.id });
    this.hooks.onFocus?.();
  }

  _wireTrafficLights() {
    this.titlebar.querySelectorAll('.tl').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = btn.dataset.action;
        if (a === 'close') this.close();
        else if (a === 'minimize') this.minimize();
        else if (a === 'maximize') this.toggleMaximize();
      });
    });
  }

  _wireDrag() {
    let dragging = false, sx = 0, sy = 0, gx = 0, gy = 0, pid = null;
    const onDown = (e) => {
      if (e.button !== 0) return;
      if (e.target.closest('.tl, button, a, input, .no-drag')) return;
      dragging = true; pid = e.pointerId;
      sx = e.clientX; sy = e.clientY;
      if (this.maximized || this.snapState) {
        // Pak het venster los uit maximized/snap onder de cursor (macOS-gedrag).
        const ratio = this.preGeo ? (e.clientX - this.geo.x) / this.geo.w : 0.5;
        this._restoreGeo();
        this.geo.x = e.clientX - this.geo.w * ratio;
        this.geo.y = Math.max(viewport().top + 2, e.clientY - 14);
        this._applyGeo();
      }
      gx = this.geo.x; gy = this.geo.y;
      this.el.classList.add('dragging');
      this.titlebar.setPointerCapture(pid);
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging) return;
      const vp = viewport();
      this.geo.x = gx + (e.clientX - sx);
      this.geo.y = clamp(gy + (e.clientY - sy), vp.top + 2, vp.bottom - 40);
      this._applyGeo();
      this._updateSnapHint(e.clientX, e.clientY);
    };
    const onUp = (e) => {
      if (!dragging) return;
      dragging = false;
      this.el.classList.remove('dragging');
      try { this.titlebar.releasePointerCapture(pid); } catch {}
      this._commitSnap(e.clientX, e.clientY);
    };
    this.titlebar.addEventListener('pointerdown', onDown);
    this.titlebar.addEventListener('pointermove', onMove);
    this.titlebar.addEventListener('pointerup', onUp);
    this.titlebar.addEventListener('lostpointercapture', () => { dragging = false; this.el.classList.remove('dragging'); snapPreview.classList.remove('visible'); });
  }

  _snapZone(x, y) {
    const vp = viewport();
    const nearLeft = x <= vp.left + SNAP_EDGE;
    const nearRight = x >= vp.left + vp.width - SNAP_EDGE;
    const nearTop = y <= vp.top + SNAP_EDGE;
    const nearBottom = y >= vp.bottom - SNAP_EDGE + 30;
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
    const halfW = vp.width / 2, halfH = (vp.bottom - vp.top) / 2;
    const map = {
      max:  { x: vp.left, y: vp.top, w: vp.width, h: vp.bottom - vp.top },
      left: { x: vp.left, y: vp.top, w: halfW, h: vp.bottom - vp.top },
      right:{ x: vp.left + halfW, y: vp.top, w: halfW, h: vp.bottom - vp.top },
      tl:   { x: vp.left, y: vp.top, w: halfW, h: halfH },
      tr:   { x: vp.left + halfW, y: vp.top, w: halfW, h: halfH },
      bl:   { x: vp.left, y: vp.top + halfH, w: halfW, h: halfH },
      br:   { x: vp.left + halfW, y: vp.top + halfH, w: halfW, h: halfH },
    };
    return map[zone];
  }

  _updateSnapHint(x, y) {
    const zone = this._snapZone(x, y);
    if (!zone) { snapPreview.classList.remove('visible'); this._pendingSnap = null; return; }
    const r = this._zoneRect(zone);
    Object.assign(snapPreview.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px` });
    snapPreview.classList.add('visible');
    this._pendingSnap = zone;
  }

  _commitSnap(x, y) {
    snapPreview.classList.remove('visible');
    const zone = this._pendingSnap;
    this._pendingSnap = null;
    if (!zone) return;
    if (!this.preGeo) this.preGeo = { ...this.geo };
    const r = this._zoneRect(zone);
    this.snapState = zone;
    this.maximized = zone === 'max';
    this._animateTo(r);
  }

  _animateTo(r) {
    if (!prefersReducedMotion()) this.el.classList.add('animating');
    this.geo = { x: r.x, y: r.y, w: r.w, h: r.h };
    this._applyGeo();
    setTimeout(() => this.el.classList.remove('animating'), 260);
  }

  _restoreGeo() {
    if (this.preGeo) { this.geo = { ...this.preGeo }; this.preGeo = null; }
    this.maximized = false; this.snapState = null;
  }

  toggleMaximize() {
    if (this.maximized || this.snapState) { this._animateTo(this._restoreAndGet()); return; }
    this.preGeo = { ...this.geo };
    this.maximized = true;
    this._animateTo(this._zoneRect('max'));
  }
  _restoreAndGet() { const g = this.preGeo ? { ...this.preGeo } : { ...this.geo }; this.preGeo = null; this.maximized = false; this.snapState = null; return g; }

  _wireResize() {
    this.elResizers.forEach((handle) => {
      let resizing = false, sx = 0, sy = 0, g0 = null, dir = '';
      handle.addEventListener('pointerdown', (e) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        resizing = true; dir = handle.dataset.dir;
        sx = e.clientX; sy = e.clientY; g0 = { ...this.geo };
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
        let { x, y, w, h } = g0;
        if (dir.includes('e')) w = clamp(g0.w + dx, minW, vp.width - x);
        if (dir.includes('s')) h = clamp(g0.h + dy, minH, vp.bottom - y);
        if (dir.includes('w')) { const nw = clamp(g0.w - dx, minW, g0.x + g0.w - vp.left); x = g0.x + (g0.w - nw); w = nw; }
        if (dir.includes('n')) { const nh = clamp(g0.h - dy, minH, g0.y + g0.h - vp.top); y = g0.y + (g0.h - nh); h = nh; }
        this.geo = { x, y, w, h };
        this._applyGeo();
      });
      const stop = (e) => { if (!resizing) return; resizing = false; this.el.classList.remove('resizing'); try { handle.releasePointerCapture(e.pointerId); } catch {} };
      handle.addEventListener('pointerup', stop);
      handle.addEventListener('lostpointercapture', () => { resizing = false; this.el.classList.remove('resizing'); });
    });
  }

  minimize() {
    if (this.minimized) return;
    this.minimized = true;
    const dockIcon = qs(`[data-dock="${this.app.id}"] .di-icon`);
    if (dockIcon && !prefersReducedMotion()) {
      const wr = this.el.getBoundingClientRect();
      const dr = dockIcon.getBoundingClientRect();
      const tx = dr.left + dr.width / 2 - (wr.left + wr.width / 2);
      const ty = dr.top + dr.height / 2 - (wr.top + wr.height / 2);
      this.el.style.transformOrigin = 'center';
      this.el.style.transform = `translate(${tx}px, ${ty}px) scale(0.08)`;
      this.el.style.opacity = '0';
    }
    this.el.classList.add('minimized');
    // Focus naar volgend zichtbaar venster.
    const next = [...windows.values()].filter((w) => w !== this && !w.minimized)
      .sort((a, b) => (+b.el.style.zIndex || 0) - (+a.el.style.zIndex || 0))[0];
    if (next) next.focus(); else store.set({ activeWindowId: null });
    syncStore();
  }

  restore() {
    if (!this.minimized) return;
    this.minimized = false;
    this.el.classList.remove('minimized');
    this.el.style.transform = 'none';
    this.el.style.opacity = '';
    syncStore();
  }

  close() {
    this.hooks.onClose?.();
    this._cleanup.forEach((fn) => fn());
    this.el.classList.add('closing');
    const done = () => { this.el.remove(); windows.delete(this.id); syncStore();
      const next = [...windows.values()].filter((w) => !w.minimized).pop();
      if (next) next.focus(); else store.set({ activeWindowId: null }); };
    if (prefersReducedMotion()) done();
    else { this.el.addEventListener('animationend', done, { once: true }); setTimeout(done, 280); }
  }
}

// ---- Publieke API ----------------------------------------------------------

export function openApp(app) {
  if (app.singleton) {
    const existing = [...windows.values()].find((w) => w.app.id === app.id);
    if (existing) { existing.focus(); return existing; }
  }
  const inst = new WindowInstance(app);
  windows.set(inst.id, inst);
  inst.focus();
  syncStore();
  return inst;
}

export function focusApp(appId) {
  const inst = [...windows.values()].find((w) => w.app.id === appId);
  if (inst) { inst.focus(); return true; }
  return false;
}

export function isRunning(appId) {
  return [...windows.values()].some((w) => w.app.id === appId);
}

export function getActiveApp() {
  const active = windows.get(store.get('activeWindowId'));
  return active ? active.app : null;
}

export function getWindowsForApp(appId) {
  return [...windows.values()].filter((w) => w.app.id === appId);
}

export function getActiveAppMenus() {
  const active = windows.get(store.get('activeWindowId'));
  return active?.hooks?.getMenus?.() || [];
}

export function closeActive() {
  const active = windows.get(store.get('activeWindowId'));
  active?.close();
}

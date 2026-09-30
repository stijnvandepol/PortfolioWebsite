// ============================================================
// boot-desktop.js — bootstrap/compositie van de desktop-OS
// (dynamisch geladen door main.js; niet op mobiel)
// ============================================================
import { store } from './core/store.js';
import { setTheme } from './core/theme.js';
import {
  initWindowManager, openApp, focusApp, isRunning, getWindowsForApp, focusWindowById, getActiveWindow,
} from './os/windowManager.js';
import { initMenubar } from './os/menubar.js';
import { initDock } from './os/dock.js';
import { initDesktop } from './os/desktop.js';
import { initNotifications, notify } from './os/notifications.js';
import { toggleSpotlight } from './os/spotlight.js';
import { toggleLaunchpad as toggleLaunchpadOverlay } from './os/launchpad.js';
import { quickLook } from './os/quicklook.js';
import { os } from './os/bridge.js';
import { getApp, listApps, iconForApp } from './apps/registry.js';
import { CONFIG } from './data/config.js';
import { APP_ICONS, iconImg } from './apps/icons.js';
import { prefersReducedMotion } from './core/dom.js';

const BOOT_MS = 1100; // moet gelijk zijn aan --boot-t in style.css
const isApple = /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent);

function openById(id, opts = {}) {
  const meta = getApp(id);
  if (!meta) return null;
  const inst = openApp(meta.create(opts));
  // Navigeer een reeds-open singleton (Portfolio, Instellingen) naar de gevraagde pagina.
  if (opts.initialPage && inst?.hooks?.api?.navigate) inst.hooks.api.navigate(opts.initialPage);
  return inst;
}

/** Externe links: alleen http(s), mailto en tel. Relatieve/andere schema's worden genegeerd. */
function safeExternal(url) {
  if (!url) return;
  let u;
  try { u = new URL(url, location.href); } catch { return; }
  if (u.protocol === 'mailto:' || u.protocol === 'tel:') { location.href = u.href; return; }
  if (u.protocol === 'http:' || u.protocol === 'https:') window.open(u.href, '_blank', 'noopener,noreferrer');
}

/** Bestanden van deze site (bv. het CV): alleen zelfde origin. */
function openFile(url) {
  if (!url) return;
  let u;
  try { u = new URL(url, location.href); } catch { return; }
  if (u.origin === location.origin) window.open(u.href, '_blank', 'noopener,noreferrer');
}

export function boot() {
  const desktop = document.getElementById('desktop');
  const noBoot = document.documentElement.classList.contains('no-boot');

  // OS-bridge invullen zodat apps elkaar kunnen aanroepen.
  Object.assign(os, {
    open: openById,
    // Dock-klik: bestaand venster naar voren, anders openen (macOS-gedrag).
    activate: (id) => { if (isRunning(id)) focusApp(id); else openById(id); },
    focusWindow: focusWindowById,
    closeApp: (id) => getWindowsForApp(id).forEach((w) => w.close()),
    openExternal: safeExternal,
    openFile,
    notify,
    setTheme,
    toggleSpotlight,
    toggleLaunchpad: () => toggleLaunchpadOverlay(listApps()),
    listApps,
    preview: quickLook,
  });

  // OS-lagen initialiseren.
  initWindowManager(desktop);
  initDesktop(desktop);
  initMenubar(desktop);
  initNotifications(desktop);

  const app = (id) => ({ id, label: getApp(id).title, icon: iconForApp(id), closable: true });
  initDock(desktop, [
    app('portfolio'),
    app('finder'),
    app('terminal'),
    app('contact'),
    { id: 'settings', label: 'Instellingen', icon: iconForApp('settings'), closable: true },
    { id: 'launchpad', label: 'Launchpad', icon: iconImg('launchpad', 'Launchpad'), action: () => os.toggleLaunchpad(), noMenu: true },
    { sep: true },
    { id: 'github', label: 'GitHub', icon: APP_ICONS.github, href: CONFIG.profile.github },
    { id: 'linkedin', label: 'LinkedIn', icon: APP_ICONS.linkedin, href: CONFIG.profile.linkedin },
  ], { appIcon: iconForApp });

  // Globale sneltoetsen (⌘ op macOS, Ctrl elders).
  window.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && (e.code === 'KeyK' || e.code === 'Space')) { e.preventDefault(); toggleSpotlight(); }
    else if (e.key === 'F4') { e.preventDefault(); os.toggleLaunchpad(); }
    else if (meta && e.key === ',') { e.preventDefault(); os.open('settings'); }
    else if (meta && e.code === 'KeyF') {
      // Alleen overnemen als het actieve venster zelf kan zoeken (Finder); anders blijft browser-zoeken werken.
      const find = getActiveWindow()?.hooks?.getMenus?.()?.find;
      if (find) { e.preventDefault(); find(); }
    }
  });

  store.set({ booted: true });

  // Opstartscherm eenmaal per sessie; daarna direct naar het bureaublad.
  try { sessionStorage.setItem('svdp.booted', '1'); } catch { /* opslag geblokkeerd */ }
  const delay = noBoot || prefersReducedMotion() ? 0 : BOOT_MS;
  const bootEl = document.getElementById('boot');
  if (bootEl) { if (delay) setTimeout(() => bootEl.remove(), delay + 600); else bootEl.remove(); }

  setTimeout(() => {
    openById('portfolio', { initialPage: 'over-mij' });
    welcome();
  }, delay);
}

/** Minimale onboarding: één keer een banner, geen tutorial. */
function welcome() {
  try {
    if (localStorage.getItem('svdp.welcomed')) return;
    localStorage.setItem('svdp.welcomed', '1');
  } catch { return; }
  setTimeout(() => notify({
    title: 'Welkom op mijn desktop',
    body: `Open apps via het Dock of zoek alles met ${isApple ? '⌘K' : 'Ctrl+K'}.`,
    icon: APP_ICONS.portfolio,
    timeout: 7000,
  }), 900);
}

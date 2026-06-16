// ============================================================
// main.js — bootstrap/compositie van de desktop-OS
// ============================================================
import { store } from './core/store.js';
import { initTheme } from './core/theme.js';
import { setTheme as themeSet } from './core/theme.js';
import { initWindowManager, openApp } from './os/windowManager.js';
import { initMenubar } from './os/menubar.js';
import { initDock } from './os/dock.js';
import { initDesktop } from './os/desktop.js';
import { initNotifications, notify } from './os/notifications.js';
import { openSpotlight, toggleSpotlight } from './os/spotlight.js';
import { openLaunchpad } from './os/launchpad.js';
import { quickLook } from './os/quicklook.js';
import { os } from './os/bridge.js';
import { APPS, getApp, listApps } from './apps/registry.js';
import { CONFIG } from './data/config.js';
import { APP_ICONS, iconImg } from './apps/icons.js';

function openById(id, opts = {}) {
  const meta = getApp(id);
  if (!meta) return null;
  const inst = openApp(meta.create(opts));
  // Navigeer een reeds-open singleton (bv. Portfolio) naar de gevraagde pagina.
  if (opts.initialPage && inst?.hooks?.api?.navigate) inst.hooks.api.navigate(opts.initialPage);
  return inst;
}

function safeExternal(url) {
  if (!url) return;
  const ok = /^(https?:|mailto:|tel:)/i.test(url);
  if (!ok) return;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function boot() {
  const desktop = document.getElementById('desktop');
  initTheme();

  // OS-bridge invullen zodat apps elkaar kunnen aanroepen.
  Object.assign(os, {
    open: openById,
    openExternal: safeExternal,
    notify,
    setTheme: themeSet,
    toggleSpotlight,
    toggleLaunchpad: () => openLaunchpad(APPS.map((a) => ({ id: a.id, title: a.title, icon: a.icon }))),
    listApps,
    preview: quickLook,
  });

  // OS-lagen initialiseren.
  initWindowManager(desktop);
  initDesktop(desktop);
  initMenubar(desktop);
  initNotifications(desktop);

  const dockEntries = [
    { id: 'finder', label: 'Finder', icon: iconImg('finder', 'Finder') },
    { id: 'portfolio', label: 'Over Mij', icon: iconImg('safari', 'Over Mij') },
    { id: 'terminal', label: 'Terminal', icon: iconImg('terminal', 'Terminal') },
    { id: 'portfolio', label: 'Projecten', icon: iconImg('photos', 'Projecten'), action: () => os.open('portfolio', { initialPage: 'portfolio' }) },
    { id: 'settings', label: 'Instellingen', icon: iconImg('settings', 'Instellingen') },
    { id: 'launchpad', label: 'Launchpad', icon: iconImg('launchpad', 'Launchpad'), action: () => os.toggleLaunchpad() },
    { sep: true },
    { id: 'github', label: 'GitHub', icon: APP_ICONS.github, href: CONFIG.profile.github },
    { id: 'linkedin', label: 'LinkedIn', icon: APP_ICONS.linkedin, href: CONFIG.profile.linkedin },
  ];
  initDock(desktop, dockEntries);

  // Globale sneltoetsen.
  window.addEventListener('keydown', (e) => {
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.code === 'Space') { e.preventDefault(); toggleSpotlight(); }
    else if (e.key === 'F4') { e.preventDefault(); os.toggleLaunchpad(); }
    else if (meta && e.key === ',') { e.preventDefault(); os.open('settings'); }
  });

  store.set({ booted: true });

  // Open het portfolio ná het boot-scherm en verwelkom de bezoeker.
  const bootDelay = document.documentElement.classList.contains('reduce-motion') ? 100 : 2950;
  setTimeout(() => openById('portfolio', { initialPage: 'over-mij' }), bootDelay);
  setTimeout(() => {
    notify({
      title: 'Welkom 👋',
      body: 'Druk ⌘Space voor Spotlight, F4 voor Launchpad, of dubbelklik een icoon.',
      icon: APP_ICONS.safari,
      timeout: 7000,
    });
  }, bootDelay + 900);
}

// Boot-scherm afronden en desktop tonen.
function start() {
  boot();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}

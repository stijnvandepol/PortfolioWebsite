// ============================================================
// main.js — kleine ingang: kiest desktop of mobiele weergave.
// Alleen wat nodig is wordt geladen (mobiel haalt geen desktop-code op).
// ============================================================
import { initTheme } from './core/theme.js';

// ≤768px: statische, leesbare portfolio i.p.v. de macOS-desktop.
const MOBILE = window.matchMedia('(max-width: 768px)');

async function start() {
  initTheme();
  if (MOBILE.matches) {
    const { initMobile } = await import('./os/mobile.js');
    initMobile();
  } else {
    const { boot } = await import('./boot-desktop.js');
    boot();
  }
}

// Wisselt de viewport tussen desktop en mobiel (rotatie, venster-resize): opnieuw opstarten.
MOBILE.addEventListener('change', () => location.reload());

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

// ============================================================
// main.js — kleine ingang: kiest desktop of eenvoudige weergave.
// Alleen wat nodig is wordt geladen. preboot.js heeft de keuze al gemaakt.
// ============================================================
import { initTheme } from './core/theme.js';

const NARROW = window.matchMedia('(max-width: 768px)');

async function start() {
  initTheme();
  if (document.documentElement.classList.contains('is-simple')) {
    const { initSimple } = await import('./os/simple.js');
    initSimple();
  } else {
    const { boot } = await import('./boot-desktop.js');
    boot();
  }
}

// Verandert de venstergrootte tussen mobiel en desktop (rotatie, resize): opnieuw bepalen.
NARROW.addEventListener('change', () => location.reload());

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
else start();

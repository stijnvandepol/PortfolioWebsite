// ============================================================
// core/theme.js — light/dark/auto, accent en reduced-motion
// Persisteert via localStorage; reageert op systeemvoorkeur.
// ============================================================
import { store } from './store.js';

const STORAGE = 'svdp.prefs';
const ACCENTS = {
  green:  { base: '#7DB87A', rgb: '125, 184, 122' },
  blue:   { base: '#0A84FF', rgb: '10, 132, 255' },
  purple: { base: '#BF5AF2', rgb: '191, 90, 242' },
  pink:   { base: '#FF375F', rgb: '255, 55, 95' },
  orange: { base: '#FF9F0A', rgb: '255, 159, 10' },
};

function load() {
  try { return JSON.parse(localStorage.getItem(STORAGE)) || {}; }
  catch { return {}; }
}
function save(prefs) {
  try { localStorage.setItem(STORAGE, JSON.stringify(prefs)); } catch { /* private mode */ }
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function resolveTheme(theme) {
  if (theme === 'auto') return systemDark() ? 'dark' : 'light';
  return theme;
}

export function applyTheme() {
  const { theme, accent, reducedMotion } = store.get();
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.accent = accent;
  root.classList.toggle('reduce-motion', !!reducedMotion);

  const a = ACCENTS[accent] || ACCENTS.green;
  root.style.setProperty('--accent', a.base);
  root.style.setProperty('--accent-rgb', a.rgb);

  save({ theme, accent, reducedMotion });
}

export function setTheme(theme)   { store.set({ theme }); applyTheme(); }
export function setAccent(accent) { store.set({ accent }); applyTheme(); }
export function setReducedMotion(on) { store.set({ reducedMotion: !!on }); applyTheme(); }
export const accentList = () => Object.keys(ACCENTS);

export function initTheme() {
  const prefs = load();
  store.set({
    theme: prefs.theme || 'auto',
    accent: prefs.accent || 'green',
    reducedMotion:
      typeof prefs.reducedMotion === 'boolean'
        ? prefs.reducedMotion
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  });
  applyTheme();
  // Volg systeemwijzigingen wanneer in auto-modus.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.get('theme') === 'auto') applyTheme();
  });
}

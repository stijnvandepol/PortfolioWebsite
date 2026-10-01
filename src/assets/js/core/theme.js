// ============================================================
// core/theme.js — light/dark/auto, accent en reduced-motion
// Persisteert via localStorage; reageert op systeemvoorkeur.
// ============================================================
import { store } from './store.js';

const STORAGE = 'svdp.prefs';
const DEFAULT_ACCENT = 'blue';
const PREFS_VERSION = 2; // v2: blauw is de standaard (v1 sloeg de oude groene standaard ongevraagd op)
const ACCENTS = {
  blue:   { base: '#0A84FF', rgb: '10, 132, 255' },
  green:  { base: '#7DB87A', rgb: '125, 184, 122' },
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

// ---- Contrast (WCAG): berekent per accent leesbare vul- en tekstkleuren ----
const hexToRgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const contrast = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
const mix = (a, b, t) => a.map((v, i) => Math.round(v * (1 - t) + b[i] * t));
const toHex = (rgb) => `#${rgb.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
const WHITE = [255, 255, 255], BLACK = [0, 0, 0];

/** Achtergrond voor gevulde controls (selectie, primaire knop) + tekstkleur erop, ≥ 4.5:1. */
function fillFor(base) {
  const rgb = hexToRgb(base);
  for (let t = 0; t <= 0.22; t += 0.01) {           // eerst iets donkerder maken (Apple-look: witte tekst)
    const c = mix(rgb, BLACK, t);
    if (contrast(c, WHITE) >= 4.5) return { fill: toHex(c), on: '#ffffff' };
  }
  return { fill: base, on: '#111114' };             // lichte accenten (oranje, groen): donkere tekst
}
/** Accent als tekstkleur op een vlak: net genoeg donkerder (licht) of lichter (donker). */
function textFor(base, surface, dark) {
  const rgb = hexToRgb(base), sf = hexToRgb(surface);
  for (let t = 0; t <= 1; t += 0.02) {
    const c = mix(rgb, dark ? WHITE : BLACK, t);
    if (contrast(c, sf) >= 4.9) return toHex(c); // marge: tekst staat ook op getinte vlakken
  }
  return dark ? '#ffffff' : '#000000';
}

const systemDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches;

function resolveTheme(theme) {
  if (theme === 'auto') return systemDark() ? 'dark' : 'light';
  return theme;
}

export function applyTheme() {
  const { theme, accent, reducedMotion, reducedTransparency } = store.get();
  const resolved = resolveTheme(theme);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.dataset.accent = accent;
  root.classList.toggle('reduce-motion', !!reducedMotion);
  root.classList.toggle('reduce-transparency', !!reducedTransparency);

  const palette = ACCENTS[accent] || ACCENTS[DEFAULT_ACCENT];
  root.style.setProperty('--accent', palette.base);
  root.style.setProperty('--accent-rgb', palette.rgb);
  const { fill, on } = fillFor(palette.base);
  root.style.setProperty('--accent-fill', fill);
  root.style.setProperty('--on-accent', on);
  root.style.setProperty('--accent-text', textFor(palette.base, resolved === 'dark' ? '#1e1f22' : '#f6f6f8', resolved === 'dark'));

}

// Alleen bewuste keuzes worden bewaard; ongewijzigde instellingen volgen dus
// altijd de huidige standaard (of systeemvoorkeur) en blijven niet 'hangen'.
let saved = {};
function persist(patch) { saved = { ...saved, ...patch, v: PREFS_VERSION }; save(saved); }

export function setTheme(theme)   { store.set({ theme }); applyTheme(); persist({ theme }); }
export function setAccent(accent) { store.set({ accent }); applyTheme(); persist({ accent }); }
export function setReducedMotion(on) { store.set({ reducedMotion: !!on }); applyTheme(); persist({ reducedMotion: !!on }); }
export function setReducedTransparency(on) { store.set({ reducedTransparency: !!on }); applyTheme(); persist({ reducedTransparency: !!on }); }
export const ACCENT_LABELS = { blue: 'Blauw', green: 'Groen', purple: 'Paars', pink: 'Roze', orange: 'Oranje' };
export const accentHex = (name) => (ACCENTS[name] || ACCENTS[DEFAULT_ACCENT]).base;
export const accentList = () => Object.keys(ACCENTS);

export function initTheme() {
  const prefs = load();
  // Eerdere bezoekers hebben de toenmalige groene standaard automatisch opgeslagen
  // (geen bewuste keuze) — die zetten we eenmalig terug naar de blauwe standaard.
  if ((prefs.v || 1) < PREFS_VERSION) {
    if (prefs.accent === 'green') delete prefs.accent;
    // v1 sloeg ook de toenmalige systeemwaarden op; behoud alleen expliciet afwijkende keuzes.
    delete prefs.reducedTransparency;
  }
  saved = prefs;
  store.set({
    theme: prefs.theme || 'dark',
    accent: ACCENTS[prefs.accent] ? prefs.accent : DEFAULT_ACCENT,
    reducedMotion:
      typeof prefs.reducedMotion === 'boolean'
        ? prefs.reducedMotion
        : window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    reducedTransparency:
      typeof prefs.reducedTransparency === 'boolean'
        ? prefs.reducedTransparency
        : window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
  });
  applyTheme();
  // Volg systeemwijzigingen wanneer in auto-modus.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (store.get('theme') === 'auto') applyTheme();
  });
}

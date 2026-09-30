// ============================================================
// apps/icons.js — self-hosted iconen
//
//  1. SYM   — UI-symbolen in één taal (outline, 1.7 stroke, ronde uiteinden,
//             24-raster). Bedoeld als SF-Symbols-achtige set: dezelfde lijndikte,
//             optische grootte en uitlijning overal. Kleur = currentColor.
//  2. APP_ICONS — eigen app-tegels (portfolio-apps, sociale links).
//  3. iconImg   — Big Sur-systeemiconen (Finder, Terminal, …) als WebP.
// ============================================================

// ---- 1. Symbolen ------------------------------------------------------
// Sommige paden bevatten gevulde onderdelen (fill="currentColor" stroke="none").
const PATHS = {
  search: '<circle cx="10.5" cy="10.5" r="6.2"/><path d="m15.2 15.2 4.8 4.8"/>',
  wifi: '<path d="M2.8 9.2a13 13 0 0 1 18.4 0"/><path d="M6 12.6a8.4 8.4 0 0 1 12 0"/><path d="M9.2 15.9a3.8 3.8 0 0 1 5.6 0"/><circle cx="12" cy="19.2" r="1.1" fill="currentColor" stroke="none"/>',
  'wifi.slash': '<path d="M2.8 9.2a13 13 0 0 1 18.4 0" opacity=".45"/><path d="M6 12.6a8.4 8.4 0 0 1 12 0" opacity=".45"/><path d="M9.2 15.9a3.8 3.8 0 0 1 5.6 0" opacity=".45"/><path d="M4 4l16 16"/>',
  control: '<rect x="2.5" y="4" width="19" height="7" rx="3.5"/><circle cx="7" cy="7.5" r="1.9" fill="currentColor" stroke="none"/><rect x="2.5" y="13" width="19" height="7" rx="3.5"/><circle cx="17" cy="16.5" r="1.9" fill="currentColor" stroke="none"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  moon: '<path d="M20 14.3A8.2 8.2 0 0 1 9.7 4 8.2 8.2 0 1 0 20 14.3z"/>',
  auto: '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 0 0 0 17.2z" fill="currentColor"/>',
  folder: '<path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H9l2 2.3h7.5A2.5 2.5 0 0 1 21 9.8v7.7a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/>',
  doc: '<path d="M7 3.5h7l4 4v12a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 7 3.5z"/><path d="M14 3.5v4h4"/>',
  'doc.text': '<path d="M7 3.5h7l4 4v12a1.5 1.5 0 0 1-1.5 1.5h-9.5a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 7 3.5z"/><path d="M14 3.5v4h4M8.5 12h7M8.5 15.5h7"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.7"/><path d="m4 17.5 5-4.5 3.5 3 3-2.5 4.5 4"/>',
  envelope: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="m3.8 7.5 8.2 6 8.2-6"/>',
  mappin: '<path d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
  'chevron.left': '<path d="M14.5 5.5 8 12l6.5 6.5"/>',
  'chevron.right': '<path d="M9.5 5.5 16 12l-6.5 6.5"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  share: '<path d="M12 15V3.5M8 7l4-3.5L16 7"/><path d="M8 10.5H6.5A1.5 1.5 0 0 0 5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7a1.5 1.5 0 0 0-1.5-1.5H16"/>',
  external: '<path d="M8 16 17 7M9.5 6.5h8v8"/>',
  person: '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6"/>',
  briefcase: '<rect x="3" y="7.5" width="18" height="12.5" rx="2.5"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18"/>',
  grid: '<rect x="4" y="4" width="7" height="7" rx="1.8"/><rect x="13" y="4" width="7" height="7" rx="1.8"/><rect x="4" y="13" width="7" height="7" rx="1.8"/><rect x="13" y="13" width="7" height="7" rx="1.8"/>',
  list: '<path d="M9 7h11M9 12h11M9 17h11"/><circle cx="4.6" cy="7" r=".9" fill="currentColor" stroke="none"/><circle cx="4.6" cy="12" r=".9" fill="currentColor" stroke="none"/><circle cx="4.6" cy="17" r=".9" fill="currentColor" stroke="none"/>',
  globe: '<circle cx="12" cy="12" r="8.6"/><path d="M3.4 12h17.2M12 3.4c2.6 2.4 3.8 5.4 3.8 8.6s-1.2 6.2-3.8 8.6c-2.6-2.4-3.8-5.4-3.8-8.6S9.4 5.8 12 3.4z"/>',
  check: '<path d="m5.5 12.5 4.2 4.2 8.8-9.4"/>',
  xmark: '<path d="M6 6l12 12M18 6 6 18"/>',
  keyboard: '<rect x="2.5" y="6" width="19" height="12" rx="2.5"/><path d="M6.5 10h.01M10 10h.01M14 10h.01M17.5 10h.01M7.5 14h9"/>',
  accessibility: '<circle cx="12" cy="5" r="1.8"/><path d="M4.5 8.5c2.4.8 5 1.2 7.5 1.2s5.1-.4 7.5-1.2M12 9.7V14m0 0-3 6.3m3-6.3 3 6.3"/>',
  info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5.2M12 7.9v.01"/>',
  terminal: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="m7 10 3 2.5L7 15M12.5 15H17"/>',
  download: '<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2.2"/><path d="M15.5 8.5V6.7a2.2 2.2 0 0 0-2.2-2.2H6.7a2.2 2.2 0 0 0-2.2 2.2v6.6a2.2 2.2 0 0 0 2.2 2.2h1.8"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  network: '<rect x="9" y="3.5" width="6" height="5" rx="1.3"/><rect x="3" y="15.5" width="6" height="5" rx="1.3"/><rect x="15" y="15.5" width="6" height="5" rx="1.3"/><path d="M12 8.5V12m-6 3.5V12h12v3.5"/>',
  bolt: '<path d="M13 3 5.5 13.2H11L10 21l8-10.5h-5.6z"/>',
  shield: '<path d="M12 3.5 5 6v5.6c0 4.3 2.9 7.6 7 9 4.1-1.4 7-4.7 7-9V6z"/><path d="m9 12 2.2 2.2L15.2 10"/>',
  cloud: '<path d="M7 18.5a4.2 4.2 0 0 1-.6-8.4 5.8 5.8 0 0 1 11.2 1.4A3.5 3.5 0 0 1 17.5 18.5z"/>',
  cap: '<path d="M2.5 9.5 12 5l9.5 4.5L12 14z"/><path d="M6.5 11.8V16c0 1.2 2.5 2.5 5.5 2.5s5.5-1.3 5.5-2.5v-4.2M21.5 9.5v5"/>',
  chart: '<path d="M5 20v-9M12 20V4M19 20v-6"/>',
  power: '<path d="M12 3.5v8M7.2 6.6a7.6 7.6 0 1 0 9.6 0"/>',
};

/** SVG-string voor een symbool. `size` = px (optische grootte). */
export function sym(name, size = 16) {
  return `<svg class="sym" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${PATHS[name] || ''}</svg>`;
}

/** Batterij-symbool met vulniveau (0–1). */
export function batterySym(level, charging = false) {
  const w = Math.max(1.2, 12.8 * level);
  return `<svg class="sym" width="20" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="2" y="7" width="17.5" height="10" rx="2.8"/><path d="M21.5 10.5v3"/><rect x="4.3" y="9.3" width="${w.toFixed(1)}" height="5.4" rx="1.3" fill="currentColor" stroke="none"/>${charging ? '<path d="M11.5 8.5 8.8 12.6h2.7l-.6 3 2.9-4.2h-2.7z" fill="var(--material-chrome-solid, #000)" stroke="none"/>' : ''}</svg>`;
}

// Compat-laag: bestaande code verwijst naar ICONS.<naam>.
export const ICONS = {
  mail: sym('envelope', 14),
  pin: sym('mappin', 14),
  chevL: sym('chevron.left', 15),
  chevR: sym('chevron.right', 15),
  lock: sym('lock', 12),
  share: sym('share', 15),
  eye: sym('eye', 22),
  cap: sym('cap', 19),
  work: sym('briefcase', 19),
  medal: sym('chart', 19),
  search: sym('search', 16),
  wifi: sym('wifi', 16),
  sun: sym('sun', 15),
  moon: sym('moon', 15),
  auto: sym('auto', 15),
  folder: sym('folder', 15),
  file: sym('doc', 15),
  network: sym('network', 22),
  bolt: sym('bolt', 22),
  shield: sym('shield', 22),
  cloud: sym('cloud', 22),
};

// ---- 2. Eigen app-tegels --------------------------------------------------
// Gelijke geometrie als de systeemiconen: 64-raster, hoek ≈ 22,5%, zachte
// lichtval bovenin en een 0,5px binnenrand. Eigen apps = blauwe familie.
function tile(id, [top, bottom], glyph) {
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<linearGradient id="t-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient>
<linearGradient id="h-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
</defs>
<rect width="64" height="64" rx="14.4" fill="url(#t-${id})"/>
<rect width="64" height="64" rx="14.4" fill="url(#h-${id})"/>
${glyph}
<rect x=".4" y=".4" width="63.2" height="63.2" rx="14" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".8"/>
</svg>`;
}

// Merkteken: schuine serif-S (Playfair Display Italic, OFL) als vectorpad — scherp op elk formaat.
const S_PATH = 'M47.20 14.45L48.20 14.45Q47.70 15.75 46.85 18.23Q46 20.70 45.25 24.65L44.25 24.65Q44.40 23.95 44.48 23.20Q44.55 22.45 44.55 21.85Q44.55 19.90 43.73 18.43Q42.90 16.95 41.33 16.13Q39.75 15.30 37.40 15.30Q34.90 15.30 33.13 16.58Q31.35 17.85 31.35 20.75Q31.35 22.50 32.20 24.13Q33.05 25.75 34.38 27.30Q35.70 28.85 37.20 30.43Q38.70 32 40.05 33.63Q41.40 35.25 42.25 37.05Q43.10 38.85 43.10 40.90Q43.10 43.60 41.78 45.50Q40.45 47.40 38.35 48.60Q36.25 49.80 33.85 50.35Q31.45 50.90 29.30 50.90Q26.95 50.90 25.42 50.60Q23.90 50.30 22.80 49.78Q21.70 49.25 20.65 48.60Q20.10 48.25 19.65 48.05Q19.20 47.85 18.90 47.85Q18.25 47.85 17.85 48.45Q17.45 49.05 16.80 50.55L15.80 50.55Q16.25 49.45 16.75 48Q17.25 46.55 17.85 44.28Q18.45 42 19.20 38.55L20.20 38.55Q19.95 39.40 19.82 40.48Q19.70 41.55 19.75 42.50Q19.90 46.05 21.98 47.93Q24.05 49.80 27.90 49.80Q31.30 49.80 32.83 48.40Q34.35 47 34.35 44.55Q34.35 42.45 33.58 40.70Q32.80 38.95 31.57 37.40Q30.35 35.85 29 34.38Q27.65 32.90 26.42 31.35Q25.20 29.80 24.45 28Q23.70 26.20 23.70 24.10Q23.70 21.55 24.80 19.68Q25.90 17.80 27.75 16.55Q29.60 15.30 31.75 14.70Q33.90 14.10 36 14.10Q38.95 14.10 40.80 14.83Q42.65 15.55 43.90 16.30Q44.35 16.60 44.83 16.85Q45.30 17.10 45.55 17.10Q46.25 17.10 47.20 14.45';

/** Los S-merkteken (menubalk), kleur via currentColor. */
export const S_MARK = `<svg class="sym-s" width="13" height="15" viewBox="14.8 13.1 34.4 38.8" aria-hidden="true" focusable="false"><path d="${S_PATH}" fill="currentColor"/></svg>`;

/** App-/merktegel: donkere midnight-tegel met blauwe gloed en lichte S (zelfde als de favicon). */
function logoTile(id) {
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
<defs>
<linearGradient id="lb-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a44"/><stop offset="1" stop-color="#0a0f1c"/></linearGradient>
<radialGradient id="lg-${id}" cx=".5" cy="1.05" r=".75"><stop offset="0" stop-color="#0A84FF" stop-opacity=".55"/><stop offset="1" stop-color="#0A84FF" stop-opacity="0"/></radialGradient>
<linearGradient id="lf-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe3ff"/></linearGradient>
</defs>
<rect width="64" height="64" rx="14.4" fill="url(#lb-${id})"/>
<rect width="64" height="64" rx="14.4" fill="url(#lg-${id})"/>
<path d="${S_PATH}" fill="url(#lf-${id})"/>
<rect x=".4" y=".4" width="63.2" height="63.2" rx="14" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width=".8"/>
</svg>`;
}

function brand(bg, glyph) {
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="64" height="64" rx="14.4" fill="${bg}"/>${glyph}<rect x=".4" y=".4" width="63.2" height="63.2" rx="14" fill="none" stroke="#fff" stroke-opacity=".16" stroke-width=".8"/></svg>`;
}

export const APP_ICONS = {
  // Portfolio-apps (eigen identiteit)
  portfolio: logoTile('pf'),
  contact: tile('ct', ['#4DB1FF', '#0B72EC'],
    '<rect x="13" y="18" width="38" height="28" rx="5.5" fill="#fff"/><path d="m15.5 22.5 16.5 12.5 16.5-12.5" fill="none" stroke="#0B72EC" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>'),
  cv: tile('cv', ['#5AB8FF', '#1C7BEA'],
    '<path d="M22 13h14l8 8v28a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3V16a3 3 0 0 1 3-3z" fill="#fff"/><path d="M36 13v8h8" fill="none" stroke="#1C7BEA" stroke-opacity=".5" stroke-width="2.4" stroke-linejoin="round"/><path d="M25 30h14M25 36h14M25 42h9" stroke="#1C7BEA" stroke-width="2.6" stroke-linecap="round"/>'),
  about: logoTile('ab'),
  folder: tile('fo', ['#56B4FF', '#1479E6'],
    '<path d="M12 22a4 4 0 0 1 4-4h9.5l4 4.5H48a4 4 0 0 1 4 4V45a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4z" fill="#fff" fill-opacity=".95"/>'),
  // Externe diensten (merkkleuren)
  github: brand('#161b22',
    '<path transform="translate(12 12) scale(2.5)" fill="#fff" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>'),
  linkedin: brand('#0A66C2',
    '<path transform="translate(16 16) scale(1.33)" fill="#fff" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zm1.782 13.019H3.555V9h3.564v11.452z"/>'),
};

// ---- 3. Systeemiconen (Big Sur-set, WebP 160px) ----------------------------
const ICON_BASE = './assets/images/icons/';
export const APP_ICON_IMG = {
  finder:    `${ICON_BASE}finder.webp`,
  terminal:  `${ICON_BASE}terminal.webp`,
  settings:  `${ICON_BASE}settings.webp`,
  launchpad: `${ICON_BASE}launchpad.webp`,
};
// Levert een <img>-string die dock/launchpad via `html:` renderen.
export const iconImg = (key, label = '') =>
  `<img src="${APP_ICON_IMG[key]}" alt="${label}" width="160" height="160" draggable="false" decoding="async">`;

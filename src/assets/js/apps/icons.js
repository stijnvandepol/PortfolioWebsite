// ============================================================
// apps/icons.js — self-hosted inline SVG iconenset
// Geen externe afhankelijkheden meer (sluit C6).
// ============================================================

// ---- Kleine UI-glyphs (currentColor) ----
export const ICONS = {
  mail:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>',
  pin:   '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/></svg>',
  chevL: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>',
  chevR: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>',
  lock:  '<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3.1-9H8.9V6a3.1 3.1 0 016.2 0v2z"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81a3 3 0 100-6 3 3 0 00-3 3c0 .24.04.47.09.7L8.04 9.81A3 3 0 106 15c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65a2.92 2.92 0 102.92-2.92z"/></svg>',
  eye:   '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17a5 5 0 110-10 5 5 0 010 10zm0-8a3 3 0 100 6 3 3 0 000-6z"/></svg>',
  cap:   '<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)"><path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82zM12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/></svg>',
  work:  '<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)"><path d="M20 6h-4V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2H4a2 2 0 00-1.99 2L2 19a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2zm-6 0h-4V4h4v2z"/></svg>',
  medal: '<svg width="20" height="20" viewBox="0 0 24 24" fill="var(--accent)"><path d="M19.35 10.04A7.49 7.49 0 0012 4 7.49 7.49 0 005.35 8.04 5.994 5.994 0 006 20h13a5 5 0 00.35-9.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17l4.59-4.58L16 11l-6 6z"/></svg>',
  search:'<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-5-5zm-6 0A4.5 4.5 0 1114 9.5 4.5 4.5 0 019.5 14z"/></svg>',
  wifi:  '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
  sun:   '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 7a5 5 0 100 10 5 5 0 000-10zM2 13h2a1 1 0 100-2H2a1 1 0 100 2zm18 0h2a1 1 0 100-2h-2a1 1 0 100 2zM11 2v2a1 1 0 102 0V2a1 1 0 10-2 0zm0 18v2a1 1 0 102 0v-2a1 1 0 10-2 0zM5.6 4.2L4.2 5.6a1 1 0 101.4 1.4l1.4-1.4A1 1 0 105.6 4.2zm12.8 12.8l-1.4 1.4a1 1 0 101.4 1.4l1.4-1.4a1 1 0 10-1.4-1.4zM4.2 18.4l1.4 1.4a1 1 0 101.4-1.4l-1.4-1.4a1 1 0 10-1.4 1.4zM17 5.6l1.4-1.4a1 1 0 10-1.4-1.4l-1.4 1.4A1 1 0 1017 5.6z"/></svg>',
  moon:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M9.37 5.51A7 7 0 0018.49 14.6 7.01 7.01 0 0112 19a7 7 0 01-2.63-13.49z"/></svg>',
  folder:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M10 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2h-8l-2-2z"/></svg>',
  file:  '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>',
  trashGlyph: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19a2 2 0 002 2h8a2 2 0 002-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',

  faviconSafari: '<svg viewBox="0 0 24 24" width="14" height="14"><circle cx="12" cy="12" r="11" fill="#1f9cf0"/><path d="M12 5l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="#fff"/></svg>',
};

// ---- App-iconen (squircle, gebruikt #squircle clip-path) ----
function appIcon(bg, glyph) {
  return `<svg viewBox="0 0 64 64" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">${bg}${glyph}</svg>`;
}

export const APP_ICONS = {
  finder: appIcon(
    '<defs><linearGradient id="fg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3aa9ff"/><stop offset="1" stop-color="#1574e0"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#fg)"/>',
    '<path d="M33 16v32c9 0 15-6 15-16s-6-16-15-16z" fill="#fff"/><path d="M31 16v32c-9 0-15-6-15-16s6-16 15-16z" fill="#dfeeff"/><path d="M24 27l4 5-4 5M40 27l-4 5 4 5" stroke="#1574e0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
  safari: appIcon(
    '<defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6f9fc"/><stop offset="1" stop-color="#d8e6f5"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#sg)"/><circle cx="32" cy="32" r="22" fill="#1f9cf0"/><circle cx="32" cy="32" r="22" fill="none" stroke="#0a6fc2" stroke-width="2"/>',
    '<path d="M32 14l6 18 18 6-18 6-6 18-6-18-18-6 18-6 6-18z" fill="#fff"/><path d="M32 22l3.5 6.5L42 32l-6.5 3.5L32 42l-3.5-6.5L22 32l6.5-3.5L32 22z" fill="#ff4b4b"/>'),
  terminal: appIcon(
    '<defs><linearGradient id="tg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3a3c"/><stop offset="1" stop-color="#101012"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#tg)"/><rect x="8" y="12" width="48" height="40" rx="6" fill="#0c0c0e"/>',
    '<path d="M16 24l8 6-8 6" stroke="#37d67a" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 38h14" stroke="#37d67a" stroke-width="3" stroke-linecap="round"/>'),
  settings: appIcon(
    '<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9aa0a6"/><stop offset="1" stop-color="#5f656b"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#cg)"/>',
    '<circle cx="32" cy="32" r="9" fill="none" stroke="#fff" stroke-width="3.2"/><g stroke="#fff" stroke-width="3.2" stroke-linecap="round"><path d="M32 12v6M32 46v6M12 32h6M46 32h6M18 18l4 4M42 42l4 4M46 18l-4 4M22 42l-4 4"/></g>'),
  mail: appIcon(
    '<defs><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3aa9ff"/><stop offset="1" stop-color="#0a72e6"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#mg)"/>',
    '<rect x="12" y="18" width="40" height="28" rx="5" fill="#fff"/><path d="M14 21l18 14 18-14" fill="none" stroke="#0a72e6" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>'),
  notes: appIcon(
    '<rect width="64" height="64" rx="14" fill="#fff"/><rect width="64" height="16" rx="0" fill="#ffd34e"/><rect width="64" height="14" y="0" rx="0" fill="#ffd60a"/>',
    '<g stroke="#c9a227" stroke-width="2.4" stroke-linecap="round"><path d="M18 28h28M18 36h28M18 44h18"/></g>'),
  photos: appIcon(
    '<rect width="64" height="64" rx="14" fill="#fdfdfd"/>',
    '<g><circle cx="32" cy="20" r="5" fill="#ff5a5f"/><circle cx="44" cy="28" r="5" fill="#ffb400"/><circle cx="44" cy="40" r="5" fill="#37d67a"/><circle cx="32" cy="48" r="5" fill="#1f9cf0"/><circle cx="20" cy="40" r="5" fill="#7d5fff"/><circle cx="20" cy="28" r="5" fill="#ff7ac4"/></g>'),
  calendar: appIcon(
    '<rect width="64" height="64" rx="14" fill="#fff"/><rect width="64" height="16" fill="#ff4b4b"/>',
    '<text x="32" y="50" font-family="-apple-system,Helvetica,Arial" font-size="30" font-weight="600" fill="#1c1c1e" text-anchor="middle">15</text><text x="32" y="13" font-family="-apple-system,Helvetica,Arial" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">JUN</text>'),
  github: appIcon(
    '<rect width="64" height="64" rx="14" fill="#161b22"/>',
    '<path transform="translate(12 12) scale(2.5)" fill="#fff" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>'),
  linkedin: appIcon(
    '<rect width="64" height="64" rx="14" fill="#0A66C2"/>',
    '<path transform="translate(16 16) scale(1.33)" fill="#fff" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 11.001-4.124 2.062 2.062 0 01-.001 4.124zm1.782 13.019H3.555V9h3.564v11.452z"/>'),
  instagram: appIcon(
    '<defs><radialGradient id="ig" cx="0.3" cy="1.07" r="1.2"><stop offset="0" stop-color="#fdf497"/><stop offset="0.45" stop-color="#fd5949"/><stop offset="0.6" stop-color="#d6249f"/><stop offset="0.9" stop-color="#285AEB"/></radialGradient></defs><rect width="64" height="64" rx="14" fill="url(#ig)"/>',
    '<rect x="18" y="18" width="28" height="28" rx="9" fill="none" stroke="#fff" stroke-width="3.2"/><circle cx="32" cy="32" r="7" fill="none" stroke="#fff" stroke-width="3.2"/><circle cx="42" cy="22" r="2.2" fill="#fff"/>'),
  trash: appIcon(
    '<defs><linearGradient id="trg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e8edf2"/><stop offset="1" stop-color="#c2ccd6"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#trg)"/>',
    '<path d="M22 26h20l-2 22a3 3 0 01-3 3H27a3 3 0 01-3-3l-2-22z" fill="#7c8794"/><path d="M20 24h24M27 24l1-3h8l1 3" stroke="#5f6a75" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><g stroke="#fff" stroke-width="2" stroke-linecap="round"><path d="M28 31v15M32 31v15M36 31v15"/></g>'),
  launchpad: appIcon(
    '<defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6b7480"/><stop offset="1" stop-color="#3a4049"/></linearGradient></defs><rect width="64" height="64" rx="14" fill="url(#lg)"/>',
    '<g fill="#fff"><rect x="16" y="16" width="9" height="9" rx="2.5"/><rect x="28" y="16" width="9" height="9" rx="2.5"/><rect x="40" y="16" width="9" height="9" rx="2.5"/><rect x="16" y="28" width="9" height="9" rx="2.5"/><rect x="28" y="28" width="9" height="9" rx="2.5"/><rect x="40" y="28" width="9" height="9" rx="2.5"/><rect x="16" y="40" width="9" height="9" rx="2.5"/><rect x="28" y="40" width="9" height="9" rx="2.5"/><rect x="40" y="40" width="9" height="9" rx="2.5"/></g>'),
};

ICONS.dockSafari = APP_ICONS.safari;
ICONS.dev = '<img src="./assets/images/icon-dev.svg" alt="" width="24">';
ICONS.app = '<img src="./assets/images/icon-app.svg" alt="" width="24">';
ICONS.photo = '<img src="./assets/images/icon-photo.svg" alt="" width="24">';
ICONS.design = '<img src="./assets/images/icon-design.svg" alt="" width="24">';

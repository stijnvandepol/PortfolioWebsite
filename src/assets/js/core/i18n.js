// ============================================================
// core/i18n.js: taal van de site (Nederlands of Engels).
//
// De taal ligt per paginalading vast: wisselen bewaart de keuze en laadt de pagina
// opnieuw. Daardoor mag t() ook op moduleniveau (constanten, menu's) gebruikt worden.
//   - Keuze 'auto' (standaard): de eerste Nederlandse of Engelse taal in de browser
//     bepaalt het; geen van beide → Engels.
//   - UI-teksten: t('Nederlandse tekst', { var }) zoekt de Engelse vertaling op in
//     i18n/en-*.js. Ontbreekt die, dan blijft het Nederlands staan. Heeft dezelfde
//     Nederlandse tekst twee betekenissen, gebruik dan tc('context', 'tekst').
//   - Engels is Amerikaans Engels, zoals macOS (color, minimize).
//   - Content in data/config.js: velden als { nl: '…', en: '…' }, zie localize().
// Werkt ook in Node (generate-static), daar is de taal standaard 'nl'.
// ============================================================
import EN_CORE from '../i18n/en-core.js';
import EN_OS from '../i18n/en-os.js';
import EN_APPS from '../i18n/en-apps.js';

export const LANGS = ['nl', 'en'];
const EN = { ...EN_CORE, ...EN_OS, ...EN_APPS };
const STORAGE = 'svdp.prefs';
const inBrowser = typeof window !== 'undefined';

/** Bewaarde keuze: 'auto' | 'nl' | 'en'. */
export function languagePref() {
  if (!inBrowser) return 'nl';
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    return LANGS.includes(p.lang) ? p.lang : 'auto';
  } catch { return 'auto'; }
}

/** Taal van de browser: de eerste nl- of en-taal in de voorkeurslijst. */
export function browserLanguage() {
  const list = (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language]) || [];
  for (const l of list) {
    const base = String(l).toLowerCase().split('-')[0];
    if (LANGS.includes(base)) return base;
  }
  return 'en';
}

const pref = languagePref();
export const lang = !inBrowser ? 'nl' : pref === 'auto' ? browserLanguage() : pref;
export const LOCALE = lang === 'en' ? 'en-US' : 'nl-NL'; // Amerikaans Engels, net als macOS

/** Vertaal een Nederlandse UI-tekst naar `to` (standaard de huidige taal). {naam} wordt ingevuld uit vars. */
export function translate(nl, vars, to = lang) {
  let s = to === 'en' ? (EN[nl] ?? nl) : nl;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
  return s;
}
export const t = (nl, vars) => translate(nl, vars);
/** Als t(), voor een Nederlandse tekst met meerdere betekenissen: zoekt eerst '{ctx}|{nl}' op. */
export const tc = (ctx, nl, vars) => (lang === 'en' && EN[`${ctx}|${nl}`] ? translate(`${ctx}|${nl}`, vars) : translate(nl, vars));

/** Vervangt elk { nl, en }-object in `value` (diep) door de tekst in taal `to`. */
export function localize(value, to = lang) {
  if (Array.isArray(value)) return value.map((v) => localize(v, to));
  if (value && typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length && keys.every((k) => LANGS.includes(k))) return value[to] ?? value.nl;
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localize(v, to)]));
  }
  return value;
}

/** Bewaar een nieuwe keuze en laad opnieuw; `reopen` = venster dat na het laden weer open moet. */
export function setLanguage(next, reopen) {
  try {
    const p = JSON.parse(localStorage.getItem(STORAGE) || '{}');
    if (next === 'auto') delete p.lang; else p.lang = next;
    localStorage.setItem(STORAGE, JSON.stringify(p));
  } catch { return; } // opslag geblokkeerd: herladen zou niets veranderen
  try { if (reopen) sessionStorage.setItem('svdp.reopen', JSON.stringify(reopen)); } catch { /* alleen het heropenen vervalt */ }
  location.reload();
}

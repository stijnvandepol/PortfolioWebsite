// ============================================================
// apps/registry.js — centrale app-definities
//
// kind: 'system'    — macOS-achtige systeem-apps (Finder, Terminal, Instellingen)
//       'portfolio' — mijn eigen apps (blauwe app-tegels met eigen identiteit)
// ============================================================
import { iconImg, APP_ICONS } from './icons.js';
import { createPortfolioApp } from './portfolio.js';
import { createContactApp } from './contact.js';
import { createAboutApp } from './about.js';
import { quickLook } from '../os/quicklook.js';

// Portfolio/Contact/Over zitten in de eerste lading; de overige apps worden pas
// opgehaald bij de eerste keer openen (of stil in de achtergrond, zie prefetchApps).
const lazy = (load, name) => async (o) => (await load())[name](o);
const loadFinder = () => import('./finder.js');
const loadTerminal = () => import('./terminal.js');
const loadSettings = () => import('./settings.js');

export const APPS = [
  { id: 'portfolio', title: 'Portfolio',            kind: 'portfolio', icon: APP_ICONS.portfolio, create: (o) => createPortfolioApp({ ...o, onPreview: quickLook }) },
  { id: 'contact',   title: 'Contact',              kind: 'portfolio', icon: APP_ICONS.contact,   create: (o) => createContactApp(o) },
  { id: 'finder',    title: 'Finder',               kind: 'system',    icon: iconImg('finder', 'Finder'),        create: lazy(loadFinder, 'createFinderApp') },
  { id: 'terminal',  title: 'Terminal',             kind: 'system',    icon: iconImg('terminal', 'Terminal'),   create: lazy(loadTerminal, 'createTerminalApp') },
  { id: 'settings',  title: 'Systeeminstellingen',  kind: 'system',    icon: iconImg('settings', 'Instellingen'), create: lazy(loadSettings, 'createSettingsApp') },
  // Geen eigen Dock-/Launchpad-icoon: bereikbaar via het Apple-menu.
  { id: 'about',     title: 'Over dit portfolio',   kind: 'portfolio', icon: APP_ICONS.about, hidden: true, create: (o) => createAboutApp(o) },
];

const byId = new Map(APPS.map((a) => [a.id, a]));

export const getApp = (id) => byId.get(id);
export const iconForApp = (id) => byId.get(id)?.icon || '';
export const listApps = () => APPS.filter((a) => !a.hidden).map((a) => ({ id: a.id, title: a.title, icon: a.icon, kind: a.kind }));

/** Haal de overige apps op zodra de browser niets te doen heeft (eerste opening voelt dan direct). */
export function prefetchApps() {
  const run = () => { loadFinder(); loadTerminal(); loadSettings(); };
  if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 4000 }); else setTimeout(run, 2500);
}

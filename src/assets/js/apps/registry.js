// ============================================================
// apps/registry.js — centrale app-definities
// ============================================================
import { APP_ICONS } from './icons.js';
import { createPortfolioApp } from './portfolio.js';
import { createTerminalApp } from './terminal.js';
import { createFinderApp } from './finder.js';
import { createSettingsApp } from './settings.js';
import { quickLook } from '../os/quicklook.js';

// Elke app: id, title, icon (SVG-string) en een factory die een venster-definitie levert.
export const APPS = [
  { id: 'finder',    title: 'Finder',                icon: APP_ICONS.finder,   create: (o) => createFinderApp(o) },
  { id: 'portfolio', title: 'Over Mij',              icon: APP_ICONS.safari,   create: (o) => createPortfolioApp({ ...o, onPreview: quickLook }) },
  { id: 'terminal',  title: 'Terminal',              icon: APP_ICONS.terminal, create: (o) => createTerminalApp(o) },
  { id: 'settings',  title: 'Systeeminstellingen',   icon: APP_ICONS.settings, create: (o) => createSettingsApp(o) },
];

const byId = new Map(APPS.map((a) => [a.id, a]));

export const getApp = (id) => byId.get(id);
export const listApps = () => APPS.map((a) => ({ id: a.id, title: a.title, icon: a.icon }));

// ============================================================
// apps/about.js — "Over dit portfolio" (About This Mac-achtig)
// Herbruikbaar: ook getoond in Systeeminstellingen → Over.
// ============================================================
import { el } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { APP_ICONS } from './icons.js';
import { os } from '../os/bridge.js';
import { t } from '../core/i18n.js';

export function aboutContent() {
  const p = CONFIG.profile;
  const spec = (k, v) => [el('dt', { text: k }), el('dd', { text: v })];
  const contact = el('button', { class: 'btn', type: 'button', text: 'Contact' });
  const source = el('button', { class: 'btn', type: 'button', text: t('Broncode') });
  contact.addEventListener('click', () => os.open('contact'));
  source.addEventListener('click', () => os.openExternal(`${p.github}/PortfolioWebsite`));
  return el('div', { class: 'about' }, [
    el('div', { class: 'about-icon', html: APP_ICONS.about }),
    el('h2', { class: 'about-name', text: p.name }),
    el('p', { class: 'about-role', text: p.role }),
    el('dl', { class: 'about-specs' }, [
      ...spec(t('Systeem'), 'Portfolio OS 5.0'),
      ...spec(t('Techniek'), t('HTML, CSS en JavaScript, zonder framework')),
      ...spec(t('Ontwerp'), t('Geïnspireerd op macOS')),
      ...spec(t('Locatie'), p.location),
    ]),
    el('div', { class: 'about-actions' }, [contact, source]),
  ]);
}

export function createAboutApp() {
  return {
    id: 'about',
    title: t('Over dit portfolio'),
    menuName: 'Portfolio',
    width: 380, height: 410,
    resizable: false,
    chrome: 'plain',
    singleton: true,
    mount({ titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: '' }));
      body.classList.add('about-body');
      body.append(aboutContent());
      return {};
    },
  };
}

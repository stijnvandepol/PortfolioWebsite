// ============================================================
// apps/settings.js — Systeeminstellingen (zijbalk + paneel)
// Panelen: Uiterlijk · Toegankelijkheid · Sneltoetsen · Over
// ============================================================
import { el } from '../core/dom.js';
import { sym } from './icons.js';
import { appearanceControl, accentPicker, languageControl, motionSwitch, transparencySwitch } from '../ui/controls.js';
import { t, tc } from '../core/i18n.js';
import { aboutContent } from './about.js';

const PANES = [
  { id: 'appearance', label: t('Uiterlijk'), icon: 'auto' },
  { id: 'accessibility', label: t('Toegankelijkheid'), icon: 'accessibility' },
  { id: 'keyboard', label: t('Sneltoetsen'), icon: 'keyboard' },
  { id: 'about', label: t('Over'), icon: 'info' },
];

const SHORTCUTS = [
  [t('Algemeen'), [
    ['⌘K', t('Zoeken')], ['F4', 'Launchpad'], ['⌘,', t('Systeeminstellingen')], ['Esc', t('Sluit zoeken, Launchpad of menu')],
  ]],
  [t('Vensters'), [
    ['⌘W', t('Sluit venster')], ['⌘M', t('Minimaliseer venster')], ['⌥⌘W', t('Sluit alle vensters')],
    [t('Dubbelklik'), t('Zoom venster via de titelbalk')], [t('Naar de rand slepen'), t('Tegel links, rechts of vul scherm')],
  ]],
  ['Finder', [
    ['⌘F', t('Zoek in de map')], [t('Spatie'), t('Voorvertoning')], ['↵', t('Open')], ['← → ↑ ↓', t('Selecteer')],
  ]],
  [t('Menu\'s'), [
    ['← →', t('Wissel van menu')], ['↑ ↓', t('Kies een onderdeel')], ['↵', t('Voer uit')],
  ]],
];

export function createSettingsApp({ initialPage } = {}) {
  return {
    id: 'settings',
    title: t('Systeeminstellingen'),
    menuName: t('Systeeminstellingen'),
    width: 780, height: 520, minWidth: 560, minHeight: 380,
    sidebar: true,
    singleton: true,
    mount({ win, titlebar, body }) {
      const titleEl = el('span', { class: 'win-title', text: '' });
      titlebar.append(titleEl);
      win.bindTitle(titleEl);
      body.classList.add('settings-body');

      const nav = el('nav', { class: 'set-sidebar', 'aria-label': t('Instellingen') });
      const content = el('div', { class: 'set-content', role: 'region', 'aria-live': 'off' });
      body.append(nav, content);

      const buttons = PANES.map((pn) => {
        const b = el('button', { class: 'set-nav-item', type: 'button', dataset: { pane: pn.id } }, [
          el('span', { class: 'set-nav-ic', html: sym(pn.icon, 16) }), el('span', { text: pn.label }),
        ]);
        b.addEventListener('click', () => show(pn.id));
        nav.append(b);
        return b;
      });
      // Pijltjes binnen de zijbalk
      nav.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const i = buttons.indexOf(document.activeElement);
        const n = buttons[(Math.max(0, i) + (e.key === 'ArrowDown' ? 1 : -1) + buttons.length) % buttons.length];
        n.focus(); n.click();
      });

      const row = (label, hint, control, labelId) => el('div', { class: 'set-row' }, [
        el('div', { class: 'set-row-text' }, [el('span', { class: 'set-label', id: labelId, text: label }), hint ? el('span', { class: 'set-hint', text: hint }) : null]),
        control,
      ]);
      const card = (...rows) => el('div', { class: 'set-card' }, rows.flatMap((r, i) => (i ? [el('div', { class: 'set-divider' }), r] : [r])));

      const builders = {
        appearance: () => [
          card(
            row(tc('thema', 'Weergave'), t('Licht, donker of automatisch op basis van je systeem.'), appearanceControl()),
            row(t('Accentkleur'), t('Kleur van knoppen, selecties en markeringen.'), accentPicker()),
            row(t('Taal'), t('Automatisch volgt de taal van je browser.'), languageControl()),
          ),
        ],
        accessibility: () => [
          card(
            row(t('Verminder beweging'), t('Vervangt schalen en verschuiven door korte fades.'), motionSwitch('set-motion'), 'set-motion'),
            row(t('Verminder transparantie'), t('Maakt vensters, menu\'s en het Dock ondoorzichtig.'), transparencySwitch('set-trans'), 'set-trans'),
          ),
        ],
        keyboard: () => [
          ...SHORTCUTS.map(([group, list]) => el('section', { class: 'set-keys' }, [
            el('h3', { class: 'set-keys-title', text: group }),
            card(...list.map(([k, d]) => el('div', { class: 'set-row set-key-row' }, [el('span', { class: 'set-label', text: d }), el('kbd', { class: 'kbd', text: k })]))),
          ])),
          el('p', { class: 'set-footnote', text: t('Sommige browsers houden ⌘W, ⌘M en ⌘, voor zichzelf; gebruik dan het Apple- of Venster-menu. Op Windows en Linux werkt Ctrl in plaats van ⌘.') }),
        ],
        about: () => [aboutContent()],
      };

      function show(id) {
        const pane = PANES.find((x) => x.id === id) || PANES[0];
        buttons.forEach((b) => { const on = b.dataset.pane === pane.id; b.classList.toggle('active', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
        content.replaceChildren(el('h2', { class: 'set-title', id: 'set-title', text: pane.label }), ...builders[pane.id]());
        content.setAttribute('aria-labelledby', 'set-title');
        content.scrollTop = 0;
        win.setTitle(pane.label);
      }
      show(initialPage);

      return { api: { navigate: show } };
    },
  };
}

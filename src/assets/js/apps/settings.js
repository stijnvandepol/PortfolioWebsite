// ============================================================
// apps/settings.js — Systeeminstellingen (uiterlijk)
// ============================================================
import { el } from '../core/dom.js';
import { store } from '../core/store.js';
import { setTheme, setAccent, setReducedMotion, accentList } from '../core/theme.js';
import { APP_ICONS, ICONS } from './icons.js';

const ACCENT_HEX = { green: '#7DB87A', blue: '#0A84FF', purple: '#BF5AF2', pink: '#FF375F', orange: '#FF9F0A' };

export function createSettingsApp() {
  return {
    id: 'settings',
    title: 'Systeeminstellingen',
    icon: APP_ICONS.settings,
    width: 560, height: 460, minWidth: 420, minHeight: 320,
    singleton: true,
    mount({ titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: 'Systeeminstellingen' }));
      body.classList.add('settings-body');

      const themeRow = (value, label, icon) => {
        const active = store.get('theme') === value;
        return el('button', { class: `seg-btn${active ? ' active' : ''}`, dataset: { theme: value } }, [
          el('span', { class: 'seg-ic', html: icon }), el('span', { text: label }),
        ]);
      };

      const themeSeg = el('div', { class: 'seg' }, [
        themeRow('light', 'Licht', ICONS.sun),
        themeRow('dark', 'Donker', ICONS.moon),
        themeRow('auto', 'Auto', ICONS.settings ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 100 18V3z"/></svg>' : ''),
      ]);
      themeSeg.addEventListener('click', (e) => {
        const b = e.target.closest('.seg-btn'); if (!b) return;
        setTheme(b.dataset.theme);
        themeSeg.querySelectorAll('.seg-btn').forEach((x) => x.classList.toggle('active', x === b));
      });

      const swatches = el('div', { class: 'accent-row' }, accentList().map((name) =>
        el('button', { class: `accent-dot${store.get('accent') === name ? ' active' : ''}`, dataset: { accent: name }, 'aria-label': name, style: { background: ACCENT_HEX[name] } })));
      swatches.addEventListener('click', (e) => {
        const b = e.target.closest('.accent-dot'); if (!b) return;
        setAccent(b.dataset.accent);
        swatches.querySelectorAll('.accent-dot').forEach((x) => x.classList.toggle('active', x === b));
      });

      const motionToggle = el('button', { class: `switch${store.get('reducedMotion') ? ' on' : ''}`, role: 'switch', 'aria-checked': String(store.get('reducedMotion')) }, [el('span', { class: 'switch-knob' })]);
      motionToggle.addEventListener('click', () => {
        const next = !store.get('reducedMotion');
        setReducedMotion(next);
        motionToggle.classList.toggle('on', next);
        motionToggle.setAttribute('aria-checked', String(next));
      });

      body.append(
        el('div', { class: 'settings-hero' }, [
          el('div', { class: 'settings-hero-ic', html: APP_ICONS.settings }),
          el('div', {}, [el('h2', { text: 'Uiterlijk' }), el('p', { text: 'Pas het thema en de accentkleur van de desktop aan.' })]),
        ]),
        el('div', { class: 'settings-card' }, [
          el('div', { class: 'set-row' }, [el('span', { class: 'set-label', text: 'Weergave' }), themeSeg]),
          el('div', { class: 'set-divider' }),
          el('div', { class: 'set-row' }, [el('span', { class: 'set-label', text: 'Accentkleur' }), swatches]),
          el('div', { class: 'set-divider' }),
          el('div', { class: 'set-row' }, [
            el('span', {}, [el('span', { class: 'set-label', text: 'Verminder beweging' }), el('span', { class: 'set-hint', text: 'Schakelt animaties uit (toegankelijkheid).' })]),
            motionToggle,
          ]),
        ]),
      );
      return {};
    },
  };
}

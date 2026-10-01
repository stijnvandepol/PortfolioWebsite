// ============================================================
// ui/controls.js — gedeelde controls (Instellingen én Bedieningspaneel)
// Eén implementatie, zodat gedrag en uiterlijk overal identiek zijn.
// ============================================================
import { el } from '../core/dom.js';
import { store } from '../core/store.js';
import {
  setTheme, setAccent, setReducedMotion, setReducedTransparency,
  accentList, accentHex, ACCENT_LABELS,
} from '../core/theme.js';
import { sym } from '../apps/icons.js';

/** Segmented control (radiogroup) met pijltoets-navigatie. */
export function segmented({ label, options, value, onChange, variant = '' }) {
  const wrap = el('div', { class: `seg ${variant}`.trim(), role: 'radiogroup', 'aria-label': label });
  const buttons = options.map((o) => {
    const b = el('button', { class: 'seg-btn', type: 'button', role: 'radio', 'aria-label': o.label, dataset: { value: o.value } }, [
      o.icon ? el('span', { class: 'seg-ic', html: o.icon }) : null,
      el('span', { class: 'seg-label', text: o.label }),
    ]);
    b.addEventListener('click', () => { set(o.value); onChange?.(o.value); });
    return b;
  });
  wrap.append(...buttons);

  function set(v) {
    buttons.forEach((b) => {
      const on = b.dataset.value === v;
      b.classList.toggle('active', on);
      b.setAttribute('aria-checked', String(on));
      b.tabIndex = on ? 0 : -1; // roving tabindex
    });
  }
  wrap.addEventListener('keydown', (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const i = buttons.findIndex((b) => b.classList.contains('active'));
    const next = buttons[(i + dir + buttons.length) % buttons.length];
    next.focus(); next.click();
  });
  set(value);
  wrap.setValue = set;
  return wrap;
}

/** macOS-achtige schakelaar (role=switch). */
export function switchControl({ label, checked, onChange, labelledBy }) {
  const knob = el('span', { class: 'switch-knob' });
  const b = el('button', { class: `switch${checked ? ' on' : ''}`, type: 'button', role: 'switch', 'aria-checked': String(!!checked), 'aria-label': labelledBy ? null : label, 'aria-labelledby': labelledBy || null }, [knob]);
  b.addEventListener('click', () => { const next = !b.classList.contains('on'); b.setChecked(next); onChange?.(next); });
  b.setChecked = (v) => { b.classList.toggle('on', v); b.setAttribute('aria-checked', String(v)); };
  return b;
}

/** Accentkleur-kiezer (radiogroup van kleurstippen). */
export function accentPicker() {
  const wrap = el('div', { class: 'accent-row', role: 'radiogroup', 'aria-label': 'Accentkleur' });
  const dots = accentList().map((name) => {
    const d = el('button', { class: 'accent-dot', type: 'button', role: 'radio', title: ACCENT_LABELS[name] || name, 'aria-label': ACCENT_LABELS[name] || name, dataset: { accent: name }, style: { '--dot': accentHex(name) } }, [
      el('span', { class: 'accent-dot-check', html: sym('check', 12) }),
    ]);
    d.addEventListener('click', () => setAccent(name));
    return d;
  });
  wrap.append(...dots);
  const sync = () => dots.forEach((d) => {
    const on = d.dataset.accent === store.get('accent');
    d.classList.toggle('active', on); d.setAttribute('aria-checked', String(on));
  });
  store.on('accent', sync); sync();
  wrap.addEventListener('keydown', (e) => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const i = dots.findIndex((d) => d.classList.contains('active'));
    const next = dots[(i + dir + dots.length) % dots.length];
    next.focus(); next.click();
  });
  return wrap;
}

/** Weergave-keuze (Licht/Donker/Auto), gesynchroniseerd met de store. */
export function appearanceControl() {
  const seg = segmented({
    label: 'Weergave',
    value: store.get('theme'),
    options: [
      { value: 'light', label: 'Licht', icon: sym('sun', 15) },
      { value: 'dark', label: 'Donker', icon: sym('moon', 15) },
      { value: 'auto', label: 'Automatisch', icon: sym('auto', 15) },
    ],
    onChange: setTheme,
  });
  store.on('theme', (t) => seg.setValue(t));
  return seg;
}

export function motionSwitch(labelledBy) {
  const sw = switchControl({ label: 'Verminder beweging', labelledBy, checked: store.get('reducedMotion'), onChange: setReducedMotion });
  store.on('reducedMotion', (v) => sw.setChecked(!!v));
  return sw;
}
export function transparencySwitch(labelledBy) {
  const sw = switchControl({ label: 'Verminder transparantie', labelledBy, checked: store.get('reducedTransparency'), onChange: setReducedTransparency });
  store.on('reducedTransparency', (v) => sw.setChecked(!!v));
  return sw;
}

// ============================================================
// apps/calculator.js — Rekenmachine (verborgen in Launchpad)
//
// Gedraagt zich als de macOS-rekenmachine: ketting-berekening zonder
// voorrang (2 + 3 × 4 = 20), herhaald '=' herhaalt de laatste bewerking,
// AC/C, ±, %, Nederlandse notatie (1.234,5) en volledige toetsenbordbediening.
// ============================================================
import { el, copyText } from '../core/dom.js';
import { store } from '../core/store.js';

const MAX_DIGITS = 9;
const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => a / b };

/** Getal → weergavestring (punt als decimaalteken, max. 9 cijfers). */
function fmt(n) {
  if (!Number.isFinite(n)) return null;
  if (Object.is(n, -0)) n = 0;
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e9 || abs < 1e-8)) return n.toExponential(4).replace(/\.?0+e/, 'e').replace('e+', 'e');
  const intDigits = Math.max(1, Math.floor(abs).toString().length);
  return String(parseFloat(n.toFixed(Math.max(0, MAX_DIGITS - intDigits))));
}

/** Weergavestring → Nederlandse notatie met duizendtallen. */
function pretty(s) {
  if (s.includes('e')) return s.replace('.', ',');
  const neg = s.startsWith('-');
  const [int, frac] = s.replace('-', '').split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${neg ? '-' : ''}${grouped}${frac !== undefined ? `,${frac}` : ''}`;
}

export function createCalculatorApp() {
  return {
    id: 'calculator',
    title: 'Rekenmachine',
    menuName: 'Rekenmachine',
    width: 240, height: 382, minWidth: 240, minHeight: 382,
    resizable: false,
    chrome: 'plain',
    winClass: 'calc-win',
    singleton: true,
    mount({ win, titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: '' }));
      body.classList.add('calc-body');

      // ---- Toestand ----
      let cur = '0';          // invoer of resultaat op het scherm
      let acc = null;         // linkeroperand
      let op = null;          // lopende bewerking
      let entered = false;    // tweede operand ingevoerd?
      let replace = true;     // volgende cijfer vervangt het scherm
      let repeat = null;      // { op, b } voor herhaald '='
      let error = false;

      const screen = el('output', { class: 'calc-screen', 'aria-live': 'polite', 'aria-atomic': 'true', text: '0' });
      const display = el('div', { class: 'calc-display', title: '⌘C kopieert het resultaat' }, [screen]);
      const keys = el('div', { class: 'calc-keys', role: 'group', 'aria-label': 'Toetsen' });
      body.append(display, keys);

      const KEYS = [
        ['clear', 'AC', 'fn', 'Wis'], ['sign', '±', 'fn', 'Plus of min'], ['percent', '%', 'fn', 'Procent'], ['÷', '÷', 'op', 'Deel'],
        ['7', '7'], ['8', '8'], ['9', '9'], ['×', '×', 'op', 'Vermenigvuldig'],
        ['4', '4'], ['5', '5'], ['6', '6'], ['−', '−', 'op', 'Trek af'],
        ['1', '1'], ['2', '2'], ['3', '3'], ['+', '+', 'op', 'Tel op'],
        ['0', '0', 'wide'], ['.', ',', '', 'Komma'], ['=', '=', 'op eq', 'Is'],
      ];
      const btn = new Map();
      KEYS.forEach(([k, label, cls = '', aria]) => {
        const b = el('button', { class: `calc-key ${cls}`.trim(), type: 'button', dataset: { k }, text: label, 'aria-label': aria || label });
        btn.set(k, b);
        keys.append(b);
      });

      const num = () => parseFloat(cur);
      function setResult(n) {
        const s = fmt(n);
        if (s === null) { error = true; cur = '0'; acc = null; op = null; repeat = null; return; }
        cur = s;
      }

      function input(k) {
        if (error && k !== 'clear') { error = false; cur = '0'; acc = null; op = null; repeat = null; replace = true; }
        if (/^\d$/.test(k) || k === '.') {
          if (replace) { cur = k === '.' ? '0.' : k; replace = false; }
          else {
            if (k === '.' && cur.includes('.')) return paint();
            if (cur.replace(/[-.]/g, '').length >= MAX_DIGITS) return paint();
            cur = (cur === '0' || cur === '-0') && k !== '.' ? cur.replace('0', k) : cur + k;
          }
          entered = true;
        } else if (k in OPS) {
          if (op && entered) setResult(OPS[op](acc, num()));
          if (!error) { acc = num(); op = k; entered = false; replace = true; }
        } else if (k === '=') {
          if (op) {
            const b = num();
            setResult(OPS[op](acc, b));
            if (!error) repeat = { op, b };
            op = null; acc = null;
          } else if (repeat) setResult(OPS[repeat.op](num(), repeat.b));
          entered = false; replace = true;
        } else if (k === 'clear') {
          if (!error && entered && cur !== '0') { cur = '0'; replace = true; entered = false; }
          else { cur = '0'; acc = null; op = null; repeat = null; entered = false; replace = true; error = false; }
        } else if (k === 'sign') {
          if (replace && op) { cur = '-0'; replace = false; entered = true; }
          else cur = cur.startsWith('-') ? cur.slice(1) : `-${cur}`;
        } else if (k === 'percent') {
          const v = num();
          setResult(op === '+' || op === '−' ? (acc * v) / 100 : v / 100);
          entered = true; replace = true;
        } else if (k === 'back') {
          if (replace) return paint();
          cur = cur.length > 1 && cur !== '-0' ? cur.slice(0, -1) : '0';
          if (cur === '-') cur = '0';
        }
        paint();
      }

      function paint() {
        const text = error ? 'Fout' : pretty(cur);
        screen.textContent = text;
        // Krimpt mee zodat negen cijfers altijd passen (zoals het echte scherm).
        const len = text.replace(/[.,]/g, '').length + (text.match(/[.,]/g) || []).length * 0.4;
        screen.style.fontSize = `${Math.min(52, Math.floor(52 * 6.2 / Math.max(6.2, len)))}px`;
        btn.get('clear').textContent = !error && entered && cur !== '0' ? 'C' : 'AC';
        btn.get('clear').setAttribute('aria-label', btn.get('clear').textContent === 'C' ? 'Wis invoer' : 'Wis alles');
        Object.keys(OPS).forEach((o) => {
          const on = op === o && !entered;
          btn.get(o).classList.toggle('active', on);
          btn.get(o).setAttribute('aria-pressed', String(on));
        });
      }

      // Muisklik verplaatst de focus niet (geen blijvende focusring, zoals op macOS); Tab werkt wel.
      keys.addEventListener('mousedown', (e) => { if (e.target.closest('.calc-key')) e.preventDefault(); });
      keys.addEventListener('click', (e) => {
        const b = e.target.closest('.calc-key');
        if (b) input(b.dataset.k);
      });

      // Toetsenbord: werkt zodra dit het actieve venster is (zoals een key window).
      const MAP = { '/': '÷', '*': '×', x: '×', X: '×', '-': '−', '+': '+', ',': '.', '.': '.', Enter: '=', '=': '=', '%': 'percent', Backspace: 'back', Delete: 'clear', Escape: 'clear', c: 'clear', C: 'clear' };
      const flash = (k) => {
        const b = btn.get(k === 'back' ? 'clear' : k);
        if (!b || k === 'back') return;
        b.classList.add('pressed');
        setTimeout(() => b.classList.remove('pressed'), 110);
      };
      const onKey = (e) => {
        if (store.get('activeWindowId') !== win.id) return;
        if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
        if (document.querySelector('.spotlight.open, .ql.open, .launchpad.open, .menu')) return;
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
          if (window.getSelection()?.toString()) return;
          e.preventDefault(); copyText(error ? '' : pretty(cur)); return;
        }
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const k = /^\d$/.test(e.key) ? e.key : MAP[e.key];
        if (!k) return;
        e.preventDefault();
        flash(k);
        input(k);
      };
      window.addEventListener('keydown', onKey);

      paint();
      return { onClose: () => window.removeEventListener('keydown', onKey) };
    },
  };
}

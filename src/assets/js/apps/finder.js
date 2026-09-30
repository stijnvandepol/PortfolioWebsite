// ============================================================
// apps/finder.js — Finder met gesimuleerd bestandssysteem
// Toolbar (vorige/volgende, weergave, zoeken), zijbalk, statusbalk.
// Toetsenbord: pijltjes selecteren, Enter opent, Spatie = voorvertoning, ⌘F zoekt.
// ============================================================
import { el, qsa } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { sym } from './icons.js';
import { os } from '../os/bridge.js';
import { segmented } from '../ui/controls.js';

const KIND = { image: 'Afbeelding', pdf: 'PDF-document', text: 'Tekstbestand', link: 'Internetlocatie' };

function buildFS() {
  const byName = (a, b) => a.name.localeCompare(b.name, 'nl');
  return {
    Projecten: CONFIG.projects.map((p) => ({ type: 'image', name: `${p.title}.webp`, src: p.image, title: p.title, desc: p.text, tags: p.tags })).sort(byName),
    Documenten: [
      { type: 'pdf', name: 'CV — Stijn van de Pol.pdf', href: CONFIG.profile.cv },
      { type: 'text', name: 'over-mij.txt', body: `${CONFIG.profile.name}\n${CONFIG.profile.role}\n${CONFIG.profile.location}\n${CONFIG.profile.email}` },
    ].sort(byName),
    Websites: CONFIG.blog.filter((b) => b.url).map((b) => ({ type: 'link', name: `${b.title}.url`, href: b.url })).sort(byName),
  };
}

const glyph = (item) => ({ image: 'image', pdf: 'doc', text: 'doc.text', link: 'globe' })[item.type];

export function createFinderApp({ initial = 'Projecten' } = {}) {
  return {
    id: 'finder',
    title: 'Finder',
    menuName: 'Finder',
    width: 780, height: 500, minWidth: 520, minHeight: 320,
    singleton: false,
    mount({ win, titlebar, body }) {
      const fs = buildFS();
      const places = Object.keys(fs);
      let loc = places.includes(initial) ? initial : places[0];
      let view = 'icons';
      let selected = -1;
      let visible = [];
      const past = [], future = [];

      // ---- Toolbar ----
      const back = el('button', { class: 'tb-btn no-drag', type: 'button', 'aria-label': 'Terug', html: sym('chevron.left', 15) });
      const fwd = el('button', { class: 'tb-btn no-drag', type: 'button', 'aria-label': 'Vooruit', html: sym('chevron.right', 15) });
      const titleEl = el('span', { class: 'win-title', text: loc });
      win.bindTitle(titleEl);
      const viewSeg = segmented({
        label: 'Weergave', variant: 'seg-icons no-drag', value: view,
        options: [{ value: 'icons', label: 'Pictogrammen', icon: sym('grid', 15) }, { value: 'list', label: 'Lijst', icon: sym('list', 15) }],
        onChange: (v) => { view = v; paint(); },
      });
      const search = el('input', { class: 'field field-search no-drag', type: 'search', placeholder: 'Zoek', 'aria-label': 'Zoek in map', autocomplete: 'off' });
      titlebar.append(el('div', { class: 'tb-nav' }, [back, fwd]), titleEl, el('div', { class: 'tb-actions' }, [viewSeg, search]));

      // ---- Zijbalk + hoofdvlak ----
      body.classList.add('finder-body');
      const sidebar = el('nav', { class: 'finder-sidebar', 'aria-label': 'Locaties' }, [
        el('div', { class: 'fsb-section', text: 'Favorieten' }),
        ...places.map((name) => {
          const b = el('button', { class: 'fsb-item', type: 'button', dataset: { loc: name } }, [el('span', { class: 'fsb-ic', html: sym('folder', 16) }), el('span', { text: name })]);
          b.addEventListener('click', () => go(name));
          return b;
        }),
      ]);
      const grid = el('div', { class: 'finder-grid', role: 'listbox', 'aria-label': 'Onderdelen', 'aria-orientation': 'horizontal' });
      const status = el('div', { class: 'finder-status', 'aria-live': 'polite' });
      const main = el('div', { class: 'finder-main' }, [grid, status]);
      body.append(sidebar, main);

      function openItem(item) {
        if (item.type === 'image') os.preview({ items: fs[loc].filter((i) => i.type === 'image').map((i) => ({ src: i.src, title: i.title, desc: i.desc })), index: fs[loc].filter((i) => i.type === 'image').indexOf(item) });
        else if (item.type === 'pdf') os.openFile(item.href);
        else if (item.type === 'link') os.openExternal(item.href);
        else if (item.type === 'text') os.preview({ text: item.body, title: item.name });
      }
      // Spatie = voorvertoning; voor pdf/links is dat gewoon openen.
      const quick = (item) => (item.type === 'pdf' || item.type === 'link' ? null : openItem(item));

      function select(i, { focus = true } = {}) {
        selected = i;
        qsa('.finder-item', grid).forEach((c, idx) => {
          const on = idx === i;
          c.classList.toggle('selected', on);
          c.setAttribute('aria-selected', String(on));
          c.tabIndex = on || (i < 0 && idx === 0) ? 0 : -1;
        });
        if (focus && i >= 0) qsa('.finder-item', grid)[i]?.focus({ preventScroll: false });
        updateStatus();
      }

      function updateStatus() {
        const total = fs[loc].length;
        const q = search.value.trim();
        status.textContent = q ? `${visible.length} van ${total} onderdelen` : `${total} onderdelen`;
      }

      function paint() {
        const q = search.value.trim().toLowerCase();
        visible = fs[loc].filter((i) => !q || `${i.name} ${i.tags || ''}`.toLowerCase().includes(q));
        grid.className = `finder-grid${view === 'list' ? ' as-list' : ''}`;
        grid.replaceChildren();
        if (!visible.length) {
          grid.append(el('div', { class: 'finder-empty', text: q ? `Geen resultaten voor “${search.value.trim()}”` : 'Lege map' }));
          selected = -1; updateStatus(); return;
        }
        visible.forEach((item, idx) => {
          const thumb = item.type === 'image'
            ? el('div', { class: 'finder-thumb' }, [el('img', { src: item.src, alt: '', loading: 'lazy', decoding: 'async' })])
            : el('div', { class: 'finder-thumb finder-thumb-icon', html: sym(glyph(item), 34) });
          const cell = el('button', { class: 'finder-item', type: 'button', role: 'option', tabindex: idx === 0 ? '0' : '-1', 'aria-selected': 'false', 'aria-label': `${item.name}, ${KIND[item.type]}` }, [
            thumb, el('span', { class: 'finder-name', text: item.name }), el('span', { class: 'finder-kind', text: KIND[item.type] }),
          ]);
          cell.addEventListener('click', () => select(idx, { focus: false }));
          cell.addEventListener('dblclick', () => openItem(item));
          cell.addEventListener('keydown', (e) => onItemKey(e, idx, item));
          grid.append(cell);
        });
        selected = -1; updateStatus();
      }

      function onItemKey(e, idx, item) {
        const cells = qsa('.finder-item', grid);
        let n = idx;
        if (e.key === 'Enter') { e.preventDefault(); openItem(item); return; }
        if (e.key === ' ') { e.preventDefault(); e.stopPropagation(); quick(item); return; } // stopPropagation: Quick Look sluit anders op dezelfde toetsaanslag
        if (e.key === 'ArrowRight') n = idx + 1;
        else if (e.key === 'ArrowLeft') n = idx - 1;
        else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          if (view === 'list') n = idx + (e.key === 'ArrowDown' ? 1 : -1);
          else {
            // zelfde kolom in de volgende/vorige rij
            const cur = cells[idx].getBoundingClientRect();
            const cand = cells.filter((c) => (e.key === 'ArrowDown' ? c.getBoundingClientRect().top > cur.top + 4 : c.getBoundingClientRect().top < cur.top - 4));
            if (cand.length) {
              const rowTop = e.key === 'ArrowDown' ? Math.min(...cand.map((c) => c.getBoundingClientRect().top)) : Math.max(...cand.map((c) => c.getBoundingClientRect().top));
              const row = cand.filter((c) => Math.abs(c.getBoundingClientRect().top - rowTop) < 4);
              n = cells.indexOf(row.sort((a, b) => Math.abs(a.getBoundingClientRect().left - cur.left) - Math.abs(b.getBoundingClientRect().left - cur.left))[0]);
            }
          }
        } else return;
        e.preventDefault();
        if (n >= 0 && n < cells.length) select(n);
      }

      function go(name, { record = true } = {}) {
        if (name === loc && record) return;
        if (record) { past.push(loc); future.length = 0; }
        loc = name; search.value = '';
        titleEl.textContent = loc; win.setTitle(loc);
        qsa('.fsb-item', sidebar).forEach((b) => { const on = b.dataset.loc === loc; b.classList.toggle('active', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
        back.disabled = !past.length; fwd.disabled = !future.length;
        paint();
      }
      back.addEventListener('click', () => { if (past.length) { future.push(loc); go(past.pop(), { record: false }); } });
      fwd.addEventListener('click', () => { if (future.length) { past.push(loc); go(future.pop(), { record: false }); } });
      search.addEventListener('input', paint);
      search.addEventListener('keydown', (e) => { if (e.key === 'Escape' && search.value) { e.stopPropagation(); search.value = ''; paint(); } });
      // Klik op lege ruimte deselecteert
      grid.addEventListener('pointerdown', (e) => { if (e.target === grid) select(-1, { focus: false }); });

      win.setTitle(loc);
      go(loc, { record: false });

      return {
        onFocus: () => {},
        getMenus: () => ({
          file: [
            { label: 'Open', action: () => visible[selected] && openItem(visible[selected]), disabled: selected < 0 },
            { label: 'Nieuw Finder-venster', action: () => os.open('finder', { fresh: true }) },
          ],
          view: [
            { label: 'Als pictogrammen', checked: view === 'icons', action: () => { viewSeg.setValue('icons'); view = 'icons'; paint(); } },
            { label: 'Als lijst', checked: view === 'list', action: () => { viewSeg.setValue('list'); view = 'list'; paint(); } },
          ],
          find: () => search.focus(),
        }),
      };
    },
  };
}

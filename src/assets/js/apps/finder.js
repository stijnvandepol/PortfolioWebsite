// ============================================================
// apps/finder.js — Finder met gesimuleerd bestandssysteem
// ============================================================
import { el, qsa } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { APP_ICONS, ICONS } from './icons.js';
import { os } from '../os/bridge.js';

function buildFS() {
  const projecten = CONFIG.projects.map((p) => ({
    type: 'image', name: `${p.title}.png`, src: p.image, title: p.title,
  }));
  return {
    Projecten: { kind: 'folder', children: projecten },
    Documenten: { kind: 'folder', children: [
      { type: 'pdf', name: 'CV — Stijn van de Pol.pdf', href: CONFIG.profile.github },
      { type: 'text', name: 'over-mij.txt', body: `${CONFIG.profile.name}\n${CONFIG.profile.role}\n${CONFIG.profile.location}\n${CONFIG.profile.email}` },
    ] },
    Blog: { kind: 'folder', children: CONFIG.blog.map((b) => ({ type: 'link', name: `${b.title}.url`, href: b.url })) },
    Downloads: { kind: 'folder', children: [] },
  };
}

export function createFinderApp({ initial = 'Projecten' } = {}) {
  return {
    id: 'finder',
    title: 'Finder',
    icon: APP_ICONS.finder,
    width: 760, height: 480, minWidth: 480, minHeight: 320,
    singleton: false,
    mount({ titlebar, body }) {
      const fs = buildFS();
      const titleSpan = el('span', { class: 'win-title', text: initial });
      titlebar.append(titleSpan);
      body.classList.add('finder-body');

      const sidebar = el('nav', { class: 'finder-sidebar', 'aria-label': 'Locaties' }, [
        el('div', { class: 'fsb-section', text: 'Favorieten' }),
        ...Object.keys(fs).map((name) =>
          el('button', { class: `fsb-item${name === initial ? ' active' : ''}`, dataset: { loc: name } }, [
            el('span', { class: 'fsb-ic', html: ICONS.folder }), el('span', { text: name }),
          ])),
      ]);

      const grid = el('div', { class: 'finder-grid', role: 'list' });
      const main = el('div', { class: 'finder-main' }, [grid]);
      body.append(sidebar, main);

      function openItem(item) {
        if (item.type === 'image') os.preview({ src: item.src, title: item.title });
        else if (item.type === 'pdf' || item.type === 'link') os.openExternal(item.href);
        else if (item.type === 'text') os.preview({ text: item.body, title: item.name });
      }

      function render(loc) {
        titleSpan.textContent = loc;
        qsa('.fsb-item', sidebar).forEach((b) => b.classList.toggle('active', b.dataset.loc === loc));
        const items = fs[loc].children;
        grid.replaceChildren();
        if (!items.length) { grid.append(el('div', { class: 'finder-empty', text: 'Lege map' })); return; }
        items.forEach((item) => {
          const thumb = item.type === 'image'
            ? el('div', { class: 'finder-thumb' }, [el('img', { src: item.src, alt: item.title, loading: 'lazy' })])
            : el('div', { class: 'finder-thumb finder-thumb-icon', html: item.type === 'pdf' ? ICONS.file : item.type === 'link' ? ICONS.share : ICONS.file });
          const cell = el('button', { class: 'finder-item', role: 'listitem', 'aria-label': item.name }, [
            thumb, el('span', { class: 'finder-name', text: item.name }),
          ]);
          cell.addEventListener('dblclick', () => openItem(item));
          cell.addEventListener('keydown', (e) => { if (e.key === 'Enter') openItem(item); });
          cell.addEventListener('click', () => { qsa('.finder-item', grid).forEach((c) => c.classList.remove('selected')); cell.classList.add('selected'); });
          grid.append(cell);
        });
      }

      sidebar.addEventListener('click', (e) => { const b = e.target.closest('.fsb-item'); if (b) render(b.dataset.loc); });
      render(initial);
      return {};
    },
  };
}

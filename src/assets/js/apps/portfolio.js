// ============================================================
// apps/portfolio.js — de Portfolio-app: zijbalk + inhoud
//
// Informatiearchitectuur (altijd zichtbaar in de zijbalk):
//   Over mij · Projecten · Ervaring (incl. opleiding) · Skills · Contact · CV
// Elke pagina heeft een deelbare URL (#projecten, #projecten/snackspot, …).
// Rendert veilig vanuit data/config.js (alles via el()/textContent).
// ============================================================
import { el, qsa } from '../core/dom.js';
import { store } from '../core/store.js';
import { CONFIG, projectById } from '../data/config.js';
import { sym } from './icons.js';
import { segmented } from '../ui/controls.js';
import { contactView } from './contact.js';
import { setView } from '../core/view.js';

const PAGES = [
  { id: 'home', label: 'Over mij', icon: 'person' },
  { id: 'projecten', label: 'Projecten', icon: 'grid' },
  { id: 'ervaring', label: 'Ervaring', icon: 'briefcase' },
  { id: 'skills', label: 'Skills', icon: 'chart' },
  { id: 'contact', label: 'Contact', icon: 'envelope' },
  { id: 'cv', label: 'CV', icon: 'doc' },
];
const LABEL = Object.fromEntries(PAGES.map((p) => [p.id, p.label]));
// Oude namen (menu's, links) blijven werken.
const ALIAS = { 'over-mij': 'home', ontwikkeling: 'ervaring', portfolio: 'projecten', blog: 'projecten' };

/** 'projecten/snackspot' → { page: 'projecten', project: <project> } */
export function parseRoute(route) {
  const [head, slug] = String(route || 'home').replace(/^#/, '').split('/');
  // Opleiding staat onder Ervaring; oude links (#opleiding) scrollen naar dat deel.
  if (head === 'opleiding') return { page: 'ervaring', anchor: 'opleiding' };
  const page = ALIAS[head] || head;
  if (!LABEL[page]) return { page: 'home' };
  if (page === 'projecten' && slug) {
    const project = projectById(decodeURIComponent(slug));
    if (project) return { page: 'projecten', project };
  }
  return { page };
}

const icon = (name, size) => el('span', { class: 'i', html: sym(name, size) });
const chips = (list, cls = 'chips', max) => {
  const shown = max ? list.slice(0, max) : list;
  return el('ul', { class: cls }, [
    ...shown.map((t) => el('li', { class: 'chip', text: t })),
    max && list.length > max ? el('li', { class: 'chip chip-more', text: `+${list.length - max}` }) : null,
  ]);
};
const statusBadge = (s) => (s ? el('span', { class: `status ${s}`, text: s === 'online' ? 'Online' : 'Offline' }) : null);
const kindLabel = (pr) => (pr.kind === 'web' ? 'Website' : 'Homelab & opdracht');
/** Link binnen de app: echte <a href="#route"> (deelbaar/middelklik) + zachte navigatie. */
const routeLink = (route, className, children) => el('a', { class: className, href: `#${route}`, dataset: { route } }, children);

// ---------------------------------------------------------------- pagina's
function projectCard(pr) {
  return routeLink(`projecten/${pr.id}`, 'pcard', [
    el('figure', { class: 'pcard-img' }, [el('img', { src: pr.thumb || pr.image, alt: '', width: 600, height: pr.kind === 'web' ? 300 : 450, loading: 'lazy', decoding: 'async' })]),
    el('div', { class: 'pcard-body' }, [
      el('p', { class: 'pcard-kind' }, [kindLabel(pr), statusBadge(pr.status)]),
      el('h3', { class: 'pcard-title', text: pr.title }),
      el('p', { class: 'pcard-sub', text: pr.subtitle }),
      chips(pr.tags, 'chips chips-sm', 4),
      el('span', { class: 'pcard-more' }, ['Bekijk project', icon('chevron.right', 13)]),
    ]),
  ]);
}

function sectionHead(title, more) {
  return el('div', { class: 'sec-head' }, [
    el('h2', { class: 'section-heading accent-bar', text: title }),
    more ? routeLink(more.route, 'sec-more', [more.label, icon('chevron.right', 13)]) : null,
  ]);
}

function skillGroup(g) {
  return el('div', { class: 'skill-group' }, [
    el('h3', { class: 'skill-title' }, [icon(g.icon, 16), g.category]),
    chips(g.items),
  ]);
}

function timelineList(items, render) {
  return el('ol', { class: 'timeline' }, items.map((it) => el('li', { class: 'timeline-item' }, render(it))));
}
const expItem = (e) => [
  el('h3', { class: 'tl-title' }, [e.role, el('span', { class: 'tl-org', text: ` – ${e.org}` })]),
  el('p', { class: 'tl-date', text: [e.period, e.duration, e.location].filter(Boolean).join(' · ') }),
  el('p', { class: 'tl-text', text: e.text }),
  e.tags?.length ? chips(e.tags, 'chips chips-sm') : null,
];

function pageHome() {
  const p = CONFIG.profile;
  const featured = CONFIG.projects.filter((x) => x.featured);
  return el('article', { class: 'page', dataset: { page: 'home' } }, [
    el('header', { class: 'hero' }, [
      el('div', { class: 'avatar-wrap' }, [
        el('div', { class: 'avatar-glow', 'aria-hidden': 'true' }),
        el('figure', { class: 'avatar-box' }, [el('img', { src: './assets/images/portret.webp', alt: `Portret van ${p.name}`, width: 116, height: 116, decoding: 'async' })]),
      ]),
      el('div', { class: 'hero-text' }, [
        el('h1', { class: 'profile-name', text: p.name }),
        el('p', { class: 'profile-role', text: p.role }),
        el('div', { class: 'profile-meta' }, [
          el('a', { class: 'meta-item', href: `mailto:${p.email}` }, [icon('envelope', 14), p.email]),
          el('span', { class: 'meta-item' }, [icon('mappin', 14), p.location]),
        ]),
        el('div', { class: 'hero-cta' }, [
          routeLink('contact', 'btn btn-primary', ['Neem contact op']),
          el('a', { class: 'btn', href: p.cv, download: p.cvName }, [icon('download', 15), 'Download CV']),
          routeLink('projecten', 'btn', ['Bekijk projecten']),
          el('a', { class: 'btn', href: p.github, target: '_blank', rel: 'noopener noreferrer' }, ['GitHub', icon('external', 13)]),
        ]),
      ]),
    ]),
    el('section', { class: 'about-text', 'aria-label': 'Over mij' }, CONFIG.about.map((t) => el('p', { text: t }))),
    el('section', { class: 'home-sec', 'aria-label': 'Wat ik doe' }, [
      el('h2', { class: 'section-heading accent-bar', text: 'Wat ik doe' }),
      el('div', { class: 'bento-grid' }, CONFIG.focus.map((f) =>
        el('div', { class: 'bento-card' }, [
          el('div', { class: 'bento-icon', html: sym(f.icon, 20) }),
          el('h3', { text: f.title }),
          el('p', { text: f.text }),
        ]))),
    ]),
    el('section', { class: 'home-sec', 'aria-label': 'Uitgelichte projecten' }, [
      sectionHead('Uitgelichte projecten', { route: 'projecten', label: 'Alle projecten' }),
      el('div', { class: 'pgrid' }, featured.map(projectCard)),
    ]),
    el('section', { class: 'home-sec', 'aria-label': 'Ervaring in het kort' }, [
      sectionHead('Ervaring', { route: 'ervaring', label: 'Ervaring & opleiding' }),
      el('ul', { class: 'exp-glance' }, CONFIG.experience.slice(0, 3).map((e) =>
        el('li', {}, [
          el('span', { class: 'eg-main' }, [el('strong', { text: e.role }), ` — ${e.org}`]),
          el('span', { class: 'eg-date', text: e.period }),
        ]))),
    ]),
  ]);
}

function pageProjecten() {
  const cats = CONFIG.projectCategories.filter((c) => c.id === 'all' || CONFIG.projects.some((p) => p.category === c.id));
  const bar = segmented({ label: 'Filter projecten', variant: 'seg-filter', value: 'all', options: cats.map((c) => ({ value: c.id, label: c.label })) });
  bar.dataset.role = 'filter';
  return el('article', { class: 'page', dataset: { page: 'projecten' } }, [
    el('h2', { class: 'section-heading', text: 'Projecten' }),
    el('p', { class: 'lead', text: 'Live websites en projecten uit mijn homelab en stages. Klik op een project voor de details.' }),
    bar,
    el('div', { class: 'pgrid', dataset: { role: 'grid' } }, CONFIG.projects.map((pr) => {
      const c = projectCard(pr); c.dataset.category = pr.category; return c;
    })),
  ]);
}

function pageProject(pr, onPreview) {
  const list = CONFIG.projects;
  const i = list.indexOf(pr);
  const prev = list[i - 1], next = list[i + 1];
  const optional = (title, node) => (node ? el('section', { class: 'pd-sec' }, [el('h3', { class: 'pd-h', text: title }), node]) : null);
  const img = el('button', { class: 'pd-img', type: 'button', 'aria-label': `Vergroot afbeelding van ${pr.title}` }, [
    el('img', { src: pr.image, alt: `Screenshot van ${pr.title}`, width: 900, height: pr.kind === 'web' ? 450 : 675, decoding: 'async' }),
  ]);
  img.addEventListener('click', () => onPreview?.({ src: pr.image, title: pr.title, desc: pr.subtitle }));
  return el('article', { class: 'page', dataset: { page: 'project' } }, [
    el('nav', { class: 'crumbs', 'aria-label': 'Kruimelpad' }, [
      routeLink('projecten', 'crumb-link', [icon('chevron.left', 13), 'Projecten']),
      el('span', { class: 'crumb-sep', 'aria-hidden': 'true', text: '›' }),
      el('span', { class: 'crumb-here', 'aria-current': 'page', text: pr.title }),
    ]),
    el('header', { class: 'pd-head' }, [
      el('p', { class: 'pcard-kind' }, [kindLabel(pr), pr.date ? ` · ${pr.date}` : '', statusBadge(pr.status)]),
      el('h2', { class: 'pd-title', text: pr.title }),
      el('p', { class: 'pd-sub', text: pr.subtitle }),
      el('div', { class: 'hero-cta' }, [
        pr.url ? el('a', { class: 'btn btn-primary', href: pr.url, target: '_blank', rel: 'noopener noreferrer' }, ['Bezoek website', icon('external', 13)]) : null,
        ...(pr.links || []).map((l) => el('a', { class: 'btn', href: l.url, target: '_blank', rel: 'noopener noreferrer' }, [l.label, icon('external', 13)])),
        routeLink('contact', 'btn', ['Vraag erover']),
      ]),
    ]),
    img,
    optional('Over dit project', el('p', { class: 'prose', text: pr.text })),
    optional('Technologieën & kenmerken', chips(pr.tags)),
    optional('Mijn rol', pr.role ? el('p', { class: 'prose', text: pr.role }) : null),
    optional('Resultaat', pr.result ? el('p', { class: 'prose', text: pr.result }) : null),
    ...(pr.details || []).map((d) => optional(d.title, el('p', { class: 'prose', text: d.text }))),
    el('nav', { class: 'pd-pager', 'aria-label': 'Andere projecten' }, [
      prev ? routeLink(`projecten/${prev.id}`, 'pager-link', [icon('chevron.left', 14), el('span', {}, [el('small', { text: 'Vorig project' }), prev.title])]) : el('span'),
      next ? routeLink(`projecten/${next.id}`, 'pager-link pager-next', [el('span', {}, [el('small', { text: 'Volgend project' }), next.title]), icon('chevron.right', 14)]) : el('span'),
    ]),
  ]);
}

const bigHead = (ic, text, id) => el('h2', { class: 'section-heading accent-bar big', id }, [el('span', { class: 'i head-ic', html: sym(ic, 20) }), text]);

function pageErvaring() {
  return el('article', { class: 'page', dataset: { page: 'ervaring' } }, [
    bigHead('briefcase', 'Ervaring'),
    timelineList(CONFIG.experience, expItem),
    el('div', { class: 'tl-section', dataset: { anchor: 'opleiding' } }, [
      bigHead('cap', 'Opleiding'),
      timelineList(CONFIG.education, (e) => [
        el('h3', { class: 'tl-title' }, [e.title, el('span', { class: 'tl-org', text: ` – ${e.org}` })]),
        el('p', { class: 'tl-date', text: e.period }),
        el('p', { class: 'tl-text', text: e.text }),
      ]),
    ]),
  ]);
}

function pageSkills() {
  return el('article', { class: 'page', dataset: { page: 'skills' } }, [
    bigHead('chart', 'Skills'),
    el('p', { class: 'lead', text: 'Waar ik mee werk, gegroepeerd per vakgebied.' }),
    el('div', { class: 'skgrid' }, CONFIG.skills.map(skillGroup)),
    el('h3', { class: 'pd-h', text: 'Soft skills' }),
    chips(CONFIG.softskills, 'chips chips-pill'),
  ]);
}

function pageCV() {
  const p = CONFIG.profile;
  return el('article', { class: 'page', dataset: { page: 'cv' } }, [
    el('h2', { class: 'section-heading', text: 'CV' }),
    el('p', { class: 'lead', text: 'Mijn actuele cv als PDF: opleiding, ervaring en vaardigheden op één pagina.' }),
    el('div', { class: 'hero-cta' }, [
      el('a', { class: 'btn btn-primary', href: p.cv, download: p.cvName }, [icon('download', 15), 'Download CV (PDF)']),
      el('a', { class: 'btn', href: p.cv, target: '_blank', rel: 'noopener noreferrer' }, ['Open in nieuw tabblad', icon('external', 13)]),
    ]),
    el('p', { class: 'prose muted', text: 'Liever eerst een overzicht? Bekijk Ervaring (incl. opleiding) en Skills in de zijbalk.' }),
  ]);
}

// ---------------------------------------------------------------- app
export function createPortfolioApp({ initialPage = 'home', onPreview } = {}) {
  return {
    id: 'portfolio',
    title: 'Portfolio',
    menuName: 'Portfolio',
    width: 1040, height: 680, minWidth: 460, minHeight: 360,
    grow: { maxWidth: 1280, maxHeight: 820 },
    fillBelow: { width: 1100, height: 760 },   // op kleinere schermen: venster vult het scherm
    singleton: true,
    mount({ win, titlebar, body }) {
      // ---- Toolbar ----
      const back = el('button', { class: 'tb-btn no-drag', type: 'button', 'aria-label': 'Terug', html: sym('chevron.left', 15) });
      const fwd = el('button', { class: 'tb-btn no-drag', type: 'button', 'aria-label': 'Vooruit', html: sym('chevron.right', 15) });
      const subtitle = el('span', { class: 'tb-subtitle' });
      const titleWrap = el('div', { class: 'tb-title' }, [el('span', { class: 'tb-title-main', text: 'Portfolio' }), subtitle]);
      const contactBtn = el('a', { class: 'tb-btn tb-text no-drag', href: '#contact', dataset: { route: 'contact' }, title: 'Contact', html: `${sym('envelope', 15)}<span>Contact</span>` });
      const cvBtn = el('a', { class: 'tb-btn tb-text no-drag', href: CONFIG.profile.cv, download: CONFIG.profile.cvName, title: 'Download CV', html: `${sym('download', 15)}<span>CV</span>` });
      titlebar.append(el('div', { class: 'tb-nav' }, [back, fwd]), titleWrap, el('div', { class: 'tb-actions' }, [contactBtn, cvBtn]));

      // ---- Zijbalk + pagina's ----
      const simpleBtn = el('button', { class: 'pf-item pf-simple', type: 'button', title: 'Toon het portfolio als gewone pagina, zonder desktop' }, [
        el('span', { class: 'pf-item-ic', html: sym('list', 17) }), el('span', { class: 'pf-item-label', text: 'Eenvoudige weergave' }),
      ]);
      simpleBtn.addEventListener('click', () => setView('simple'));
      const sidebar = el('nav', { class: 'pf-sidebar', 'aria-label': 'Portfolio' }, [
        ...PAGES.map((pg) =>
          routeLink(pg.id, 'pf-item', [el('span', { class: 'pf-item-ic', html: sym(pg.icon, 17) }), el('span', { class: 'pf-item-label', text: pg.label })])),
        el('div', { class: 'pf-spacer' }),
        simpleBtn,
      ]);
      const projectHost = el('div', { class: 'project-host' });
      const pages = el('div', { class: 'win-pages', tabindex: '0', role: 'region', 'aria-label': 'Inhoud' }, [
        pageHome(), pageProjecten(), pageErvaring(), pageSkills(),
        el('article', { class: 'page', dataset: { page: 'contact' } }, [el('h2', { class: 'section-heading', text: 'Contact' }), contactView().view]),
        pageCV(), projectHost,
      ]);
      body.classList.add('pf-body');
      body.append(sidebar, pages);

      // ---- Navigatie + history ----
      const history = [];
      let idx = -1;
      let current = { page: 'home' };
      let started = false;

      function render(route) {
        const r = parseRoute(route);
        current = r;
        qsa('.page', pages).forEach((p) => p.classList.remove('active'));
        let crumb = LABEL[r.page];
        if (r.project) {
          projectHost.replaceChildren(pageProject(r.project, onPreview));
          projectHost.firstElementChild.classList.add('active');
          crumb = `Projecten › ${r.project.title}`;
        } else {
          pages.querySelector(`.page[data-page="${r.page}"]`)?.classList.add('active');
        }
        qsa('.pf-item[data-route]', sidebar).forEach((t) => {
          const on = t.dataset.route === r.page;
          t.classList.toggle('active', on);
          if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current');
        });
        subtitle.textContent = crumb;
        win.setTitle(`Portfolio — ${crumb}`);
        if (r.anchor) pages.querySelector(`[data-anchor="${r.anchor}"]`)?.scrollIntoView({ block: 'start' });
        else if (started) pages.scrollTop = 0; // geen layout-read bij de eerste render
        started = true;
        // Deelbare URL zonder de browsergeschiedenis vol te schrijven
        const hash = r.project ? `#projecten/${r.project.id}` : `#${r.page}`;
        if (location.hash !== hash) { try { window.history.replaceState(null, '', hash); } catch { /* sandbox */ } }
        updateNav();
      }
      function navigate(route) {
        const key = typeof route === 'string' ? route : 'home';
        if (history[idx] !== key) { history.splice(idx + 1); history.push(key); idx = history.length - 1; }
        render(key);
      }
      function goBack() { if (idx > 0) { idx--; render(history[idx]); } }
      function goFwd() { if (idx < history.length - 1) { idx++; render(history[idx]); } }
      function updateNav() { back.disabled = idx <= 0; fwd.disabled = idx >= history.length - 1; }

      back.addEventListener('click', goBack);
      fwd.addEventListener('click', goFwd);

      // Alle interne links (zijbalk, kaarten, kruimelpad, knoppen) lopen via één handler.
      win.el.addEventListener('click', (e) => {
        const a = e.target.closest('a[data-route]');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(a.dataset.route);
        if (a.classList.contains('pf-item')) a.focus({ preventScroll: true });
      });
      sidebar.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const items = qsa('.pf-item[data-route]', sidebar);
        const i = Math.max(0, items.indexOf(document.activeElement));
        const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
        n.focus(); navigate(n.dataset.route);
      });

      // Sneltoetsen: ⌘[ ⌘] (vorige/volgende), Esc (uit projectdetail terug naar de lijst)
      const onKey = (e) => {
        if (store.get('activeWindowId') !== win.id) return;
        if ((e.metaKey || e.ctrlKey) && e.key === '[') { e.preventDefault(); goBack(); }
        else if ((e.metaKey || e.ctrlKey) && e.key === ']') { e.preventDefault(); goFwd(); }
        else if (e.key === 'Escape' && current.project && !document.querySelector('.spotlight.open, .ql.open, .launchpad.open, .menu')) { e.preventDefault(); navigate('projecten'); }
      };
      window.addEventListener('keydown', onKey);
      // Handmatig een andere #-URL invoeren of een link met hash volgen
      const onHash = () => { const h = location.hash.slice(1); if (h && h !== (current.project ? `projecten/${current.project.id}` : current.page)) navigate(h); };
      window.addEventListener('hashchange', onHash);

      // ---- Filter (Projecten) ----
      const filterBar = pages.querySelector('[data-role="filter"]');
      filterBar.addEventListener('click', (e) => {
        const b = e.target.closest('.seg-btn'); if (!b) return;
        qsa('[data-role="grid"] .pcard', pages).forEach((c) => { c.hidden = !(b.dataset.value === 'all' || c.dataset.category === b.dataset.value); });
      });

      navigate(initialPage);

      return {
        api: { navigate },
        onClose: () => { window.removeEventListener('keydown', onKey); window.removeEventListener('hashchange', onHash); },
        getMenus: () => ({
          view: [
            ...PAGES.map((pg) => ({ label: pg.label, checked: current.page === pg.id, action: () => navigate(pg.id) })),
            { divider: true },
            { label: 'Vorige pagina', key: '⌘[', action: goBack, disabled: idx <= 0 },
            { label: 'Volgende pagina', key: '⌘]', action: goFwd, disabled: idx >= history.length - 1 },
          ],
        }),
      };
    },
  };
}

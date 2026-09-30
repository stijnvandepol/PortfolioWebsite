// ============================================================
// apps/portfolio.js — Portfolio-app: zijbalk + inhoud
// Rendert veilig vanuit data/config.js (alles via el()/textContent).
// ============================================================
import { el, qsa, prefersReducedMotion } from '../core/dom.js';
import { store } from '../core/store.js';
import { CONFIG } from '../data/config.js';
import { sym } from './icons.js';
import { segmented } from '../ui/controls.js';
import { os } from '../os/bridge.js';

const PAGES = [
  { id: 'over-mij', label: 'Over mij', icon: 'person' },
  { id: 'ontwikkeling', label: 'Ontwikkeling', icon: 'briefcase' },
  { id: 'portfolio', label: 'Portfolio', icon: 'grid' },
  { id: 'blog', label: 'Websites', icon: 'globe' },
];
const PAGE_LABEL = Object.fromEntries(PAGES.map((p) => [p.id, p.label]));

const icon = (name, size) => el('span', { class: 'i', html: sym(name, size) });

function pageOverMij() {
  const p = CONFIG.profile;
  const services = [
    ['network', 'Netwerk & Infrastructuur', 'Netwerken ontwerpen, segmenteren en beheren. Ervaring met firewalls, monitoring en logging voor een veilige en stabiele omgeving.'],
    ['bolt', 'Automation', 'PowerShell & Python scripting, Infrastructure as Code en CI/CD-pijplijnen. Aangevuld met low-code automatisering en AI.'],
    ['shield', 'Security', 'Hardening-best practices toepassen, pentests/kwetsbaarheidsscans uitvoeren en loganalyse.'],
    ['cloud', 'Cloud & Development', 'Applicaties en oplossingen ontwikkelen. Ervaring met Azure & Cloudflare, gecombineerd met programmeerkennis.'],
  ];
  return el('article', { class: 'page active', dataset: { page: 'over-mij' } }, [
    el('div', { class: 'profile-header' }, [
      el('figure', { class: 'avatar-box' }, [el('img', { src: './assets/images/portret.webp', alt: p.name, width: 110, height: 110, decoding: 'async' })]),
      el('div', { class: 'profile-info' }, [
        el('h1', { class: 'profile-name', text: p.name }),
        el('p', { class: 'profile-role', text: p.role }),
        el('div', { class: 'profile-meta' }, [
          el('span', { class: 'meta-item' }, [icon('envelope', 14), el('a', { href: `mailto:${p.email}`, text: p.email })]),
          el('span', { class: 'meta-item' }, [icon('mappin', 14), p.location]),
        ]),
        el('div', { class: 'hero-cta' }, [
          el('button', { class: 'btn btn-primary', dataset: { goto: 'portfolio' }, type: 'button', text: 'Bekijk projecten' }),
          el('a', { class: 'btn', href: p.cv, target: '_blank', rel: 'noopener noreferrer', text: 'Bekijk CV' }),
          el('button', { class: 'btn', dataset: { app: 'contact' }, type: 'button', text: 'Contact' }),
        ]),
      ]),
    ]),
    el('section', { class: 'about-text' }, [
      el('p', { text: 'Ik ben Stijn van de Pol, student HBO-ICT aan Fontys met de specialisatie Infrastructuur & Cybersecurity. Mijn interesse gaat verder dan techniek: ik wil begrijpen hoe systemen werken, hoe ik ze kan verbeteren en waarom een oplossing werkt.' }),
      el('p', { text: 'In mijn homelab experimenteer ik met nieuwe tools en configuraties. Wat mij motiveert is dat IT nooit af is — er valt altijd iets te verbeteren, te beveiligen of slimmer te maken.' }),
    ]),
    el('section', { class: 'service-section' }, [
      el('h2', { class: 'section-heading', text: 'Wat ik doe' }),
      el('div', { class: 'bento-grid' }, services.map(([ic, title, text]) =>
        el('div', { class: 'bento-card reveal' }, [
          el('div', { class: 'bento-icon', html: sym(ic, 20) }),
          el('h3', { text: title }),
          el('p', { text }),
        ]))),
    ]),
  ]);
}

function timeline(items) {
  return el('div', { class: 'timeline' }, items.map((it) =>
    el('div', { class: 'timeline-item reveal' }, [
      el('h4', { class: 'tl-title', text: it.title }),
      el('span', { class: 'tl-date', text: it.date }),
      el('p', { class: 'tl-text', text: it.text }),
    ])));
}

function pageOntwikkeling() {
  const skills = el('div', { class: 'skills-card' }, CONFIG.vaardigheden.map((s) =>
    el('div', { class: 'skill-item reveal' }, [
      el('div', { class: 'skill-header' }, [
        el('span', { class: 'skill-name', text: s.name }),
        el('span', { class: 'skill-val', dataset: { val: s.value }, text: `${s.value}%` }),
      ]),
      el('div', { class: 'skill-track', role: 'progressbar', 'aria-label': s.name, 'aria-valuenow': String(s.value), 'aria-valuemin': '0', 'aria-valuemax': '100' }, [
        el('div', { class: 'skill-fill', style: { '--scale': String(s.value / 100) } }),
      ]),
    ])));
  const softSkills = el('div', { class: 'softskills' }, CONFIG.softskills.map((s) => el('span', { class: 'softskill-tag', text: s })));
  const heading = (ic, text) => el('h2', { class: 'section-heading' }, [icon(ic, 18), text]);
  return el('article', { class: 'page', dataset: { page: 'ontwikkeling' } }, [
    heading('cap', 'Opleiding'), timeline(CONFIG.opleiding),
    heading('briefcase', 'Ervaring'), timeline(CONFIG.ervaring),
    heading('chart', 'Vaardigheden'), skills, softSkills,
  ]);
}

function pagePortfolio() {
  // Alleen categorieën met projecten tonen (geen lege filter).
  const cats = CONFIG.portfolioCategories.filter((c) => c.id === 'all' || CONFIG.projects.some((p) => p.category === c.id));
  const bar = segmented({
    label: 'Filter projecten', variant: 'seg-filter', value: 'all',
    options: cats.map((c) => ({ value: c.id, label: c.label })),
    onChange: () => {},
  });
  bar.dataset.role = 'filter';
  const grid = el('div', { class: 'project-grid' }, CONFIG.projects.map((p, i) =>
    el('div', { class: 'project-card active reveal', dataset: { category: p.category } }, [
      el('button', { class: 'project-open', type: 'button', dataset: { idx: String(i) }, 'aria-label': `Bekijk ${p.title}` }, [
        el('figure', { class: 'project-img' }, [
          el('img', { src: p.image, alt: '', width: 600, height: 450, loading: 'lazy', decoding: 'async' }),
          el('div', { class: 'project-overlay', html: sym('eye', 24) }),
        ]),
        el('h3', { class: 'project-title', text: p.title }),
        el('p', { class: 'project-cat', text: p.tags }),
      ]),
    ])));
  return el('article', { class: 'page', dataset: { page: 'portfolio' } }, [
    el('h2', { class: 'section-heading', text: 'Portfolio' }), bar, grid,
  ]);
}

function pageWebsites() {
  return el('article', { class: 'page', dataset: { page: 'blog' } }, [
    el('h2', { class: 'section-heading', text: 'Websites' }),
    el('div', { class: 'blog-grid' }, CONFIG.blog.map((b) =>
      el(b.url ? 'a' : 'div', { class: 'blog-card reveal', href: b.url, target: b.url ? '_blank' : null, rel: b.url ? 'noopener noreferrer' : null }, [
        el('figure', { class: 'blog-img' }, [el('img', { src: b.image, alt: '', width: 1200, height: 600, loading: 'lazy', decoding: 'async' })]),
        el('div', { class: 'blog-content' }, [
          el('div', { class: 'blog-meta' }, [
            el('span', { class: 'blog-category', text: b.category }),
            el('span', { class: 'blog-dot', 'aria-hidden': 'true' }),
            el('time', { datetime: b.datetime, text: b.date }),
          ]),
          el('div', { class: 'blog-title-row' }, [
            el('h3', { text: b.title }),
            el('span', { class: `blog-status ${b.status}`, text: b.status === 'online' ? 'Online' : 'Offline' }),
            b.url ? el('span', { class: 'blog-ext', 'aria-hidden': 'true', html: sym('external', 14) }) : null,
          ]),
          el('p', { class: 'blog-text', text: b.text }),
        ]),
      ]))),
  ]);
}

export function createPortfolioApp({ initialPage = 'over-mij', onPreview } = {}) {
  return {
    id: 'portfolio',
    title: 'Portfolio',
    menuName: 'Portfolio',
    width: 980, height: 620, minWidth: 460, minHeight: 360,
    grow: { maxWidth: 1240, maxHeight: 800 },
    singleton: true,
    mount({ win, titlebar, body }) {
      // ---- Toolbar in de titelbalk ----
      const back = el('button', { class: 'tb-btn no-drag', type: 'button', 'aria-label': 'Terug', html: sym('chevron.left', 15) });
      const fwd = el('button', { class: 'tb-btn no-drag', type: 'button', 'aria-label': 'Vooruit', html: sym('chevron.right', 15) });
      const subtitle = el('span', { class: 'tb-subtitle' });
      const titleWrap = el('div', { class: 'tb-title' }, [el('span', { class: 'tb-title-main', text: 'Portfolio' }), subtitle]);
      const contactBtn = el('button', { class: 'tb-btn tb-text no-drag', type: 'button', 'aria-label': 'Contact', title: 'Contact', html: `${sym('envelope', 15)}<span>Contact</span>` });
      const cvBtn = el('a', { class: 'tb-btn tb-text no-drag', href: CONFIG.profile.cv, target: '_blank', rel: 'noopener noreferrer', 'aria-label': 'Bekijk CV (PDF)', title: 'Bekijk CV', html: `${sym('doc', 15)}<span>CV</span>` });
      contactBtn.addEventListener('click', () => os.open('contact'));
      titlebar.append(el('div', { class: 'tb-nav' }, [back, fwd]), titleWrap, el('div', { class: 'tb-actions' }, [contactBtn, cvBtn]));

      // ---- Zijbalk + pagina's ----
      const sidebar = el('nav', { class: 'pf-sidebar', 'aria-label': 'Portfolio' }, PAGES.map((pg) =>
        el('button', { class: 'pf-item', type: 'button', dataset: { page: pg.id }, 'aria-label': pg.label, title: pg.label }, [
          el('span', { class: 'pf-item-ic', html: sym(pg.icon, 17) }), el('span', { class: 'pf-item-label', text: pg.label }),
        ])));
      const pages = el('div', { class: 'win-pages', tabindex: '0', role: 'region', 'aria-label': 'Inhoud' }, [pageOverMij(), pageOntwikkeling(), pagePortfolio(), pageWebsites()]);
      body.classList.add('pf-body');
      body.append(sidebar, pages);

      // ---- Navigatie + history ----
      const history = [initialPage];
      let idx = 0;
      let current = null;
      let started = false;

      function setActive(id) {
        if (!PAGE_LABEL[id]) id = 'over-mij';
        current = id;
        qsa('.page', pages).forEach((p) => p.classList.toggle('active', p.dataset.page === id));
        qsa('.pf-item', sidebar).forEach((t) => { const on = t.dataset.page === id; t.classList.toggle('active', on); if (on) t.setAttribute('aria-current', 'page'); else t.removeAttribute('aria-current'); });
        subtitle.textContent = PAGE_LABEL[id];
        win.setTitle(`Portfolio — ${PAGE_LABEL[id]}`);
        if (started) pages.scrollTop = 0; // geen layout-read bij de eerste render
        started = true;
        const page = pages.querySelector(`.page[data-page="${id}"]`);
        if (page) revealIn(page);
        if (id === 'ontwikkeling') requestAnimationFrame(() => animateSkills(page));
        updateNav();
      }
      function navigate(id) { if (history[idx] !== id) { history.splice(idx + 1); history.push(id); idx = history.length - 1; } setActive(id); }
      function goBack() { if (idx > 0) { idx--; setActive(history[idx]); } }
      function goFwd() { if (idx < history.length - 1) { idx++; setActive(history[idx]); } }
      function updateNav() { back.disabled = idx <= 0; fwd.disabled = idx >= history.length - 1; }

      back.addEventListener('click', goBack);
      fwd.addEventListener('click', goFwd);
      sidebar.addEventListener('click', (e) => { const t = e.target.closest('.pf-item'); if (t) navigate(t.dataset.page); });
      sidebar.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
        e.preventDefault();
        const items = qsa('.pf-item', sidebar);
        const i = Math.max(0, items.indexOf(document.activeElement));
        const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
        n.focus(); navigate(n.dataset.page);
      });

      // ⌘[ en ⌘] — vorige/volgende pagina (alleen als dit venster actief is)
      const onKey = (e) => {
        if (!(e.metaKey || e.ctrlKey) || store.get('activeWindowId') !== win.id) return;
        if (e.key === '[') { e.preventDefault(); goBack(); } else if (e.key === ']') { e.preventDefault(); goFwd(); }
      };
      window.addEventListener('keydown', onKey);

      // ---- Interactie binnen pagina's ----
      const filterBar = pages.querySelector('[data-role="filter"]');
      let filter = 'all';
      filterBar.addEventListener('click', (e) => {
        const b = e.target.closest('.seg-btn'); if (!b) return;
        filter = b.dataset.value;
        qsa('.project-card', pages).forEach((c) => c.classList.toggle('active', filter === 'all' || c.dataset.category === filter));
      });
      pages.addEventListener('click', (e) => {
        const goto = e.target.closest('[data-goto]');
        if (goto) { navigate(goto.dataset.goto); return; }
        if (e.target.closest('[data-app]')) { os.open(e.target.closest('[data-app]').dataset.app); return; }
        const open = e.target.closest('.project-open');
        if (open && onPreview) {
          // Quick Look loopt door de zichtbare (gefilterde) projecten.
          const cards = qsa('.project-card.active .project-open', pages);
          onPreview({
            items: cards.map((c) => { const pr = CONFIG.projects[+c.dataset.idx]; return { src: pr.image, title: pr.title, desc: pr.text }; }),
            index: cards.indexOf(open),
          });
        }
      });

      // ---- Reveal + skills ----
      function revealIn(container) {
        const nodes = qsa('.reveal:not(.visible)', container);
        if (prefersReducedMotion()) { nodes.forEach((n) => n.classList.add('visible')); return; }
        nodes.forEach((n, i) => setTimeout(() => n.classList.add('visible'), Math.min(i, 8) * 50));
      }
      function animateSkills(container) {
        qsa('.skill-fill', container).forEach((b) => b.classList.add('animated'));
      }

      setActive(initialPage);

      return {
        api: { navigate },
        onClose: () => window.removeEventListener('keydown', onKey),
        getMenus: () => ({
          view: [
            ...PAGES.map((pg) => ({ label: pg.label, checked: current === pg.id, action: () => navigate(pg.id) })),
            { divider: true },
            { label: 'Vorige pagina', key: '⌘[', action: goBack, disabled: idx <= 0 },
            { label: 'Volgende pagina', key: '⌘]', action: goFwd, disabled: idx >= history.length - 1 },
          ],
        }),
      };
    },
  };
}

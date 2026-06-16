// ============================================================
// apps/portfolio.js — Safari-achtige browser met portfolio-content
// Rendert veilig vanuit data/config.js (escaped).
// ============================================================
import { el, qsa, escapeHtml, prefersReducedMotion } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { ICONS } from './icons.js';

const PAGE_NAMES = { 'over-mij': 'Over Mij', ontwikkeling: 'Ontwikkeling', portfolio: 'Portfolio', blog: 'Blog' };

function svg(markup) { return el('span', { class: 'i', html: markup }); }

function pageOverMij() {
  const p = CONFIG.profile;
  const services = [
    ['icon-net', ICONS.dev, 'Netwerk & Infrastructuur', 'Netwerken ontwerpen, segmenteren en beheren. Ervaring met firewalls, monitoring en logging voor een veilige en stabiele omgeving.'],
    ['icon-auto', ICONS.app, 'Automation', 'PowerShell & Python scripting, Infrastructure as Code en CI/CD-pijplijnen. Aangevuld met low-code automatisering en AI.'],
    ['icon-sec', ICONS.photo, 'Security', 'Hardening-best practices toepassen, pentests/kwetsbaarheidsscans uitvoeren en loganalyse.'],
    ['icon-cloud', ICONS.design, 'Cloud & Development', 'Applicaties en oplossingen ontwikkelen. Ervaring met Azure & Cloudflare, gecombineerd met programmeerkennis.'],
  ];
  return el('article', { class: 'page active', dataset: { page: 'over-mij' } }, [
    el('div', { class: 'profile-header' }, [
      el('div', { class: 'avatar-wrap' }, [
        el('div', { class: 'avatar-glow', 'aria-hidden': 'true' }),
        el('figure', { class: 'avatar-box' }, [el('img', { src: './assets/images/portret.png', alt: p.name, width: 110, decoding: 'async' })]),
      ]),
      el('div', { class: 'profile-info' }, [
        el('h1', { class: 'profile-name', text: p.name }),
        el('p', { class: 'profile-role', text: p.role }),
        el('div', { class: 'profile-meta' }, [
          el('span', { class: 'meta-item' }, [svg(ICONS.mail), el('a', { href: `mailto:${p.email}`, text: p.email })]),
          el('span', { class: 'meta-item' }, [svg(ICONS.pin), p.location]),
        ]),
        el('div', { class: 'hero-cta' }, [
          el('button', { class: 'cta-btn cta-primary', dataset: { goto: 'portfolio' }, type: 'button', text: 'Bekijk projecten' }),
          el('a', { class: 'cta-btn cta-secondary', href: CONFIG.profile.cv, target: '_blank', rel: 'noopener noreferrer', text: 'Bekijk mijn CV' }),
        ]),
      ]),
    ]),
    el('section', { class: 'about-text' }, [
      el('p', { text: 'Ik ben Stijn van de Pol, student HBO-ICT aan Fontys met de specialisatie Infrastructuur & Cybersecurity. Mijn interesse gaat verder dan techniek: ik wil begrijpen hoe systemen werken, hoe ik ze kan verbeteren en waarom een oplossing werkt.' }),
      el('p', { text: 'In mijn homelab experimenteer ik met nieuwe tools en configuraties. Wat mij motiveert is dat IT nooit af is — er valt altijd iets te verbeteren, te beveiligen of slimmer te maken.' }),
    ]),
    el('section', { class: 'service-section' }, [
      el('h2', { class: 'section-heading' }, ['Wat ik doe']),
      el('div', { class: 'bento-grid' }, services.map(([cls, icon, title, body]) =>
        el('div', { class: 'bento-card reveal' }, [
          el('div', { class: `bento-icon ${cls}`, html: icon }),
          el('h3', { text: title }),
          el('p', { text: body }),
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
        el('span', { class: 'skill-val', dataset: { val: s.value }, text: '0%' }),
      ]),
      el('div', { class: 'skill-track' }, [el('div', { class: 'skill-fill', style: { '--target': `${s.value}%` } })]),
    ])));
  return el('article', { class: 'page', dataset: { page: 'ontwikkeling' } }, [
    el('h2', { class: 'section-heading', html: `${ICONS.cap} Opleiding` }),
    timeline(CONFIG.opleiding),
    el('h2', { class: 'section-heading', html: `${ICONS.work} Ervaring` }),
    timeline(CONFIG.ervaring),
    el('h2', { class: 'section-heading', html: `${ICONS.medal} Vaardigheden` }),
    skills,
  ]);
}

function pagePortfolio() {
  const bar = el('div', { class: 'filter-bar', role: 'tablist', 'aria-label': 'Filter projecten' },
    CONFIG.portfolioCategories.map((c, i) =>
      el('button', { class: `filter-btn${i === 0 ? ' active' : ''}`, role: 'tab', 'aria-selected': i === 0 ? 'true' : 'false', dataset: { filter: c.id }, text: c.label })));
  const grid = el('div', { class: 'project-grid' }, CONFIG.projects.map((p) =>
    el('div', { class: 'project-card active reveal', dataset: { category: p.category } }, [
      el('button', { class: 'project-open', dataset: { img: p.image, title: p.title }, 'aria-label': `Bekijk ${p.title}` }, [
        el('figure', { class: 'project-img' }, [
          el('img', { src: p.image, alt: p.title, loading: 'lazy', decoding: 'async' }),
          el('div', { class: 'project-overlay', html: ICONS.eye }),
        ]),
        el('h3', { class: 'project-title', text: p.title }),
        el('p', { class: 'project-cat', text: p.tags }),
      ]),
    ])));
  return el('article', { class: 'page', dataset: { page: 'portfolio' } }, [
    el('h2', { class: 'section-heading' }, ['Portfolio']), bar, grid,
  ]);
}

function pageBlog() {
  return el('article', { class: 'page', dataset: { page: 'blog' } }, [
    el('h2', { class: 'section-heading' }, ['Blog']),
    el('div', { class: 'blog-grid' }, CONFIG.blog.map((b) =>
      el('a', { class: 'blog-card reveal', href: b.url, target: '_blank', rel: 'noopener noreferrer' }, [
        el('figure', { class: 'blog-img' }, [el('img', { src: b.image, alt: b.title, loading: 'lazy', decoding: 'async' })]),
        el('div', { class: 'blog-content' }, [
          el('div', { class: 'blog-meta' }, [
            el('span', { class: 'blog-category', text: b.category }),
            el('span', { class: 'blog-dot' }),
            el('time', { datetime: b.datetime, text: b.date }),
          ]),
          el('div', { class: 'blog-title-row' }, [
            el('h3', { text: b.title }),
            el('span', { class: `blog-status ${b.status}`, text: b.status.charAt(0).toUpperCase() + b.status.slice(1) }),
          ]),
          el('p', { class: 'blog-text', text: b.text }),
        ]),
      ]))),
  ]);
}

export function createPortfolioApp({ initialPage = 'over-mij', onPreview } = {}) {
  return {
    id: 'portfolio',
    title: 'Over Mij',
    icon: ICONS.dockSafari,
    width: 980, height: 620, minWidth: 420, minHeight: 360,
    singleton: true,
    mount({ win, titlebar, body }) {
      // ---- Toolbar in de titelbalk (Safari-stijl) ----
      const back = el('button', { class: 'tb-btn no-drag', 'aria-label': 'Terug', html: ICONS.chevL });
      const fwd = el('button', { class: 'tb-btn no-drag', 'aria-label': 'Vooruit', html: ICONS.chevR });
      const urlText = el('span', { text: 'stijnvandepol.nl — Over Mij' });
      const url = el('div', { class: 'tb-url no-drag', html: ICONS.lock }, [urlText]);
      const share = el('a', { class: 'tb-btn no-drag', 'aria-label': 'Open echte site', href: 'https://stijnvandepol.nl', target: '_blank', rel: 'noopener noreferrer', html: ICONS.share });
      titlebar.append(
        el('div', { class: 'tb-nav' }, [back, fwd]),
        url,
        el('div', { class: 'tb-actions' }, [share]),
      );

      // ---- Tabbar + pages in de body ----
      const tabbar = el('div', { class: 'tabbar', role: 'tablist', 'aria-label': 'Pagina\'s' });
      Object.entries(PAGE_NAMES).forEach(([id, label]) => {
        tabbar.append(el('button', { class: `tab${id === initialPage ? ' active' : ''}`, role: 'tab', dataset: { tab: id }, 'aria-selected': id === initialPage ? 'true' : 'false' }, [
          el('span', { class: 'tab-favicon', html: ICONS.faviconSafari }),
          el('span', { class: 'tab-label', text: label }),
        ]));
      });
      const pages = el('div', { class: 'win-pages' }, [pageOverMij(), pageOntwikkeling(), pagePortfolio(), pageBlog()]);
      body.classList.add('safari-body');
      body.append(tabbar, pages);

      // ---- Navigatie + history ----
      const history = [initialPage];
      let idx = 0;

      function setActive(id) {
        qsa('.page', pages).forEach((p) => p.classList.toggle('active', p.dataset.page === id));
        qsa('.tab', tabbar).forEach((t) => { const on = t.dataset.tab === id; t.classList.toggle('active', on); t.setAttribute('aria-selected', on); });
        urlText.textContent = `stijnvandepol.nl — ${PAGE_NAMES[id] || id}`;
        win.title = PAGE_NAMES[id] || id;
        pages.scrollTop = 0;
        const page = pages.querySelector(`.page[data-page="${id}"]`);
        if (page) revealIn(page);
        if (id === 'ontwikkeling') setTimeout(() => animateSkills(page), 250);
        updateNav();
      }
      function navigate(id) { if (history[idx] !== id) { history.splice(idx + 1); history.push(id); idx = history.length - 1; } setActive(id); }
      function updateNav() { back.style.opacity = idx > 0 ? '1' : '0.3'; fwd.style.opacity = idx < history.length - 1 ? '1' : '0.3'; }

      back.addEventListener('click', () => { if (idx > 0) { idx--; setActive(history[idx]); } });
      fwd.addEventListener('click', () => { if (idx < history.length - 1) { idx++; setActive(history[idx]); } });
      tabbar.addEventListener('click', (e) => { const t = e.target.closest('.tab'); if (t) navigate(t.dataset.tab); });

      // ---- Filter ----
      pages.addEventListener('click', (e) => {
        const cta = e.target.closest('.cta-btn');
        if (cta && cta.dataset.goto) { navigate(cta.dataset.goto); return; }
        const fb = e.target.closest('.filter-btn');
        if (fb) {
          const f = fb.dataset.filter;
          qsa('.filter-btn', pages).forEach((b) => { const on = b === fb; b.classList.toggle('active', on); b.setAttribute('aria-selected', on); });
          qsa('.project-card', pages).forEach((c) => c.classList.toggle('active', f === 'all' || c.dataset.category === f));
          return;
        }
        const open = e.target.closest('.project-open');
        if (open && onPreview) onPreview({ src: open.dataset.img, title: open.dataset.title });
      });

      // ---- Reveal + skills ----
      function revealIn(container) {
        if (prefersReducedMotion()) { qsa('.reveal', container).forEach((n) => n.classList.add('visible')); return; }
        let d = 0;
        qsa('.reveal:not(.visible)', container).forEach((n) => { setTimeout(() => n.classList.add('visible'), d); d += 55; });
      }
      function animateSkills(container) {
        qsa('.skill-fill', container).forEach((b) => b.classList.add('animated'));
        qsa('.skill-val', container).forEach((node) => {
          const t = parseInt(node.dataset.val, 10); if (!t) return;
          if (prefersReducedMotion()) { node.textContent = `${t}%`; return; }
          let c = 0; const step = t / 50;
          (function tick() { c += step; if (c >= t) { node.textContent = `${t}%`; return; } node.textContent = `${Math.round(c)}%`; requestAnimationFrame(tick); })();
        });
      }

      setActive(initialPage);

      return {
        api: { navigate },
        getMenus: () => portfolioMenus(navigate),
        onFocus() {},
      };
    },
  };
}

function portfolioMenus(navigate) {
  return [
    { label: 'Weergave', items: [
      { label: 'Over Mij', action: () => navigate('over-mij') },
      { label: 'Ontwikkeling', action: () => navigate('ontwikkeling') },
      { label: 'Portfolio', action: () => navigate('portfolio') },
      { label: 'Blog', action: () => navigate('blog') },
    ] },
  ];
}

// ============================================================
// os/mobile.js — statische, leesbare mobiele weergave (geen macOS)
// Wordt op ≤768px gerenderd i.p.v. de desktop-OS. Eén bron van
// waarheid: data/config.js, veilig via el() (geen rauwe innerHTML).
// ============================================================
import { el } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { ICONS } from '../apps/icons.js';

const glyph = (markup) => el('span', { class: 'm-i', html: markup });

function sectionTitle(text) {
  return el('h2', { class: 'm-section-title' }, [text]);
}

function section(title, id, children) {
  return el('section', { class: 'm-section', id }, [sectionTitle(title), ...children]);
}

function timeline(items) {
  return el('div', { class: 'm-timeline' }, items.map((it) =>
    el('div', { class: 'm-tl-item' }, [
      el('h4', { class: 'm-tl-title', text: it.title }),
      el('span', { class: 'm-tl-date', text: it.date }),
      el('p', { class: 'm-text', text: it.text }),
    ])));
}

function skills(items) {
  return el('div', { class: 'm-skills' }, items.map((s) =>
    el('div', { class: 'm-skill' }, [
      el('div', { class: 'm-skill-head' }, [
        el('span', { class: 'm-skill-name', text: s.name }),
        el('span', { class: 'm-skill-val', text: `${s.value}%` }),
      ]),
      el('div', { class: 'm-skill-track' }, [
        el('div', { class: 'm-skill-fill', style: { width: `${s.value}%` } }),
      ]),
    ])));
}

/** Render de volledige statische mobiele portfolio en hang 'm aan <body>. */
export function initMobile() {
  document.documentElement.classList.add('mobile-mode');
  const p = CONFIG.profile;
  const root = el('div', { class: 'm-portfolio' });

  // 1) Notice-balk
  root.append(el('div', { class: 'm-notice' }, [
    el('span', { text: '💻 Voor de volledige interactieve macOS-ervaring, open deze site op desktop.' }),
  ]));

  // 2) Hero
  root.append(el('header', { class: 'm-hero' }, [
    el('figure', { class: 'm-avatar' }, [
      el('img', { src: './assets/images/portret.png', alt: p.name, width: 120, height: 120, decoding: 'async' }),
    ]),
    el('h1', { class: 'm-name', text: p.name }),
    el('p', { class: 'm-role', text: p.role }),
    el('div', { class: 'm-contact' }, [
      el('a', { class: 'm-contact-item', href: `mailto:${p.email}` }, [glyph(ICONS.mail), el('span', { text: p.email })]),
      el('span', { class: 'm-contact-item' }, [glyph(ICONS.pin), el('span', { text: p.location })]),
    ]),
    el('div', { class: 'm-cta' }, [
      el('a', { class: 'm-btn m-btn-primary', href: '#m-projecten', text: 'Bekijk projecten' }),
      el('a', { class: 'm-btn m-btn-secondary', href: '#m-cv', text: 'Bekijk mijn CV' }),
    ]),
  ]));

  // 3) Over mij
  root.append(section('Over mij', 'm-over', [
    el('p', { class: 'm-text', text: 'Ik ben Stijn van de Pol, student HBO-ICT aan Fontys met de specialisatie Infrastructuur & Cybersecurity. Mijn interesse gaat verder dan techniek: ik wil begrijpen hoe systemen werken, hoe ik ze kan verbeteren en waarom een oplossing werkt.' }),
    el('p', { class: 'm-text', text: 'In mijn homelab experimenteer ik met nieuwe tools en configuraties. Wat mij motiveert is dat IT nooit af is — er valt altijd iets te verbeteren, te beveiligen of slimmer te maken.' }),
  ]));

  // 4) Projecten
  root.append(section('Projecten', 'm-projecten', [
    el('div', { class: 'm-projects' }, CONFIG.projects.map((pr) =>
      el('article', { class: 'm-project' }, [
        el('figure', { class: 'm-project-img' }, [
          el('img', { src: pr.image, alt: pr.title, loading: 'lazy', decoding: 'async' }),
        ]),
        el('div', { class: 'm-project-body' }, [
          el('h3', { class: 'm-project-title', text: pr.title }),
          el('p', { class: 'm-project-tags', text: pr.tags }),
        ]),
      ]))),
  ]));

  // 5) Ontwikkeling & CV
  root.append(section('Ontwikkeling & CV', 'm-cv', [
    el('h3', { class: 'm-subtitle', text: 'Opleiding' }), timeline(CONFIG.opleiding),
    el('h3', { class: 'm-subtitle', text: 'Ervaring' }), timeline(CONFIG.ervaring),
    el('h3', { class: 'm-subtitle', text: 'Vaardigheden' }), skills(CONFIG.vaardigheden),
  ]));

  // 6) Blog / meer
  if (CONFIG.blog && CONFIG.blog.length) {
    root.append(section('Meer', 'm-blog', [
      el('div', { class: 'm-blog' }, CONFIG.blog.map((b) =>
        el('a', { class: 'm-blog-card', href: b.url, target: '_blank', rel: 'noopener noreferrer' }, [
          el('figure', { class: 'm-blog-img' }, [
            el('img', { src: b.image, alt: b.title, loading: 'lazy', decoding: 'async' }),
          ]),
          el('div', { class: 'm-blog-body' }, [
            el('div', { class: 'm-blog-meta' }, [
              el('span', { text: b.category }),
              el('span', { class: 'm-dot', text: '·' }),
              el('span', { text: b.date }),
            ]),
            el('h3', { class: 'm-blog-title', text: b.title }),
            el('p', { class: 'm-text', text: b.text }),
          ]),
        ]))),
    ]));
  }

  // 7) Contact / social
  root.append(el('footer', { class: 'm-footer', id: 'm-contact' }, [
    sectionTitle('Contact'),
    el('div', { class: 'm-social' }, [
      el('a', { class: 'm-social-btn', href: p.github, target: '_blank', rel: 'noopener noreferrer', text: 'GitHub' }),
      el('a', { class: 'm-social-btn', href: p.linkedin, target: '_blank', rel: 'noopener noreferrer', text: 'LinkedIn' }),
      el('a', { class: 'm-social-btn', href: p.instagram, target: '_blank', rel: 'noopener noreferrer', text: 'Instagram' }),
    ]),
    el('a', { class: 'm-mail-link', href: `mailto:${p.email}`, text: p.email }),
    el('p', { class: 'm-copyright', text: `© ${p.name}` }),
  ]));

  document.body.append(root);
}

// ============================================================
// apps/contact.js — Contact: contactkaart (zoals Contacten op macOS)
//
// Bewust geen formulier (geen backend; mailto-formulieren falen zonder mail-app).
// ============================================================
import { el, copyText } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { sym } from './icons.js';

/**
 * Contactkaart (zoals Contacten op macOS). Geen formulier: dat kon alleen het
 * e-mailprogramma van de bezoeker openen en werkte niet zonder ingestelde mail-app.
 * Deze acties werken altijd: adres zichtbaar en selecteerbaar, kopiëren, mailen,
 * LinkedIn, GitHub en CV. Gebruikt in het Contact-venster én als pagina in Portfolio.
 */
export function contactView() {
  const p = CONFIG.profile;
  const live = el('span', { class: 'sr-only', 'aria-live': 'polite' });
  const copyLabel = el('span', { text: 'Kopieer e-mailadres' });
  const copyIc = el('span', { class: 'i', html: sym('copy', 15) });
  const copyBtn = el('button', { class: 'btn ct-copy-btn', type: 'button' }, [copyIc, copyLabel]);
  let resetT;
  async function copyMail() {
    const ok = await copyText(p.email);
    copyIc.innerHTML = sym(ok ? 'check' : 'xmark', 15);
    copyLabel.textContent = ok ? 'Gekopieerd' : 'Kopiëren mislukt';
    copyBtn.classList.toggle('done', ok);
    live.textContent = ok ? 'E-mailadres gekopieerd' : 'Kopiëren mislukt';
    clearTimeout(resetT);
    resetT = setTimeout(() => { copyIc.innerHTML = sym('copy', 15); copyLabel.textContent = 'Kopieer e-mailadres'; copyBtn.classList.remove('done'); live.textContent = ''; }, 1800);
  }
  copyBtn.addEventListener('click', copyMail);

  const ext = { target: '_blank', rel: 'noopener noreferrer' };
  const row = (icon, label, valueNode) => el('div', { class: 'ct-row' }, [
    el('span', { class: 'ct-row-ic', html: sym(icon, 16) }),
    el('div', { class: 'ct-row-main' }, [el('span', { class: 'ct-row-label', text: label }), valueNode]),
  ]);
  const link = (href, text, extra = ext) => el('a', { class: 'ct-link', href, ...extra, text });

  const view = el('div', { class: 'contact-view' }, [
    el('section', { class: 'ct-card', 'aria-label': 'Contactgegevens' }, [
      el('figure', { class: 'ct-avatar' }, [el('img', { src: './assets/images/portret.webp', alt: '', width: 96, height: 96, decoding: 'async' })]),
      el('h2', { class: 'ct-name', text: p.name }),
      el('p', { class: 'ct-role', text: p.role }),
      el('p', { class: 'ct-intro', text: 'Ik denk graag mee over stages, opdrachten en samenwerking. Stuur me gerust een bericht.' }),
      el('div', { class: 'ct-actions' }, [
        el('a', { class: 'btn btn-primary', href: `mailto:${p.email}` }, [el('span', { class: 'i', html: sym('envelope', 15) }), 'Stuur e-mail']),
        copyBtn,
        el('a', { class: 'btn', href: p.linkedin, ...ext }, ['LinkedIn', el('span', { class: 'i', html: sym('external', 13) })]),
      ]),
      el('div', { class: 'ct-rows' }, [
        row('envelope', 'e-mail', el('span', { class: 'ct-val ct-selectable', text: p.email })),
        row('mappin', 'locatie', el('span', { class: 'ct-val', text: p.location })),
        row('external', 'LinkedIn', link(p.linkedin, 'linkedin.com/in/stijnvandepol')),
        row('external', 'GitHub', link(p.github, 'github.com/stijnvandepol')),
        row('doc', 'CV', link(p.cv, 'Download CV (PDF)', { download: p.cvName })),
      ]),
      live,
    ]),
  ]);
  return { view, copyMail };
}

export function createContactApp() {
  return {
    id: 'contact',
    title: 'Contact',
    menuName: 'Contact',
    width: 520, height: 640, minWidth: 380, minHeight: 420,
    singleton: true,
    mount({ win, titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: 'Contact' }));
      body.classList.add('contact-body');
      const { view, copyMail } = contactView();
      body.append(view);
      return {
        getMenus: () => ({ file: [{ label: 'Kopieer e-mailadres', action: copyMail }] }),
      };
    },
  };
}

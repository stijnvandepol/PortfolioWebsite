// ============================================================
// apps/contact.js — Contact: contactkaart (Contacten) + nieuw bericht (Mail)
//
// Er is geen backend: "Verstuur" opent het e-mailprogramma van de bezoeker
// met onderwerp en bericht al ingevuld. De hint zegt dat ook eerlijk.
// ============================================================
import { el, copyText } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { sym } from './icons.js';
import { os } from '../os/bridge.js';

/**
 * Contactkaart + nieuw bericht. Wordt gebruikt in het Contact-venster én als
 * pagina in de Portfolio-app (zodat contact altijd één klik verwijderd is).
 */
export function contactView(uid) {
  const p = CONFIG.profile;

  // ---- Contactkaart ----
  const copyBtn = el('button', { class: 'ct-copy', type: 'button', 'aria-label': 'Kopieer e-mailadres', title: 'Kopieer e-mailadres', html: sym('copy', 15) });
  const live = el('span', { class: 'sr-only', 'aria-live': 'polite' });
  let resetT;
  async function copyMail() {
    const ok = await copyText(p.email);
    copyBtn.innerHTML = sym(ok ? 'check' : 'xmark', 15);
    copyBtn.classList.toggle('done', ok);
    live.textContent = ok ? 'E-mailadres gekopieerd' : 'Kopiëren mislukt';
    clearTimeout(resetT);
    resetT = setTimeout(() => { copyBtn.innerHTML = sym('copy', 15); copyBtn.classList.remove('done'); live.textContent = ''; }, 1600);
  }
  copyBtn.addEventListener('click', copyMail);

  const row = (icon, label, valueNode) => el('div', { class: 'ct-row' }, [
    el('span', { class: 'ct-row-ic', html: sym(icon, 16) }),
    el('div', { class: 'ct-row-main' }, [el('span', { class: 'ct-row-label', text: label }), valueNode]),
  ]);
  const link = (href, text) => el('a', { class: 'ct-link', href, target: '_blank', rel: 'noopener noreferrer', text });

  const card = el('aside', { class: 'ct-card', 'aria-label': 'Contactkaart' }, [
    el('figure', { class: 'ct-avatar' }, [el('img', { src: './assets/images/portret.webp', alt: '', width: 96, height: 96, decoding: 'async' })]),
    el('h2', { class: 'ct-name', text: p.name }),
    el('p', { class: 'ct-role', text: p.role }),
    el('div', { class: 'ct-rows' }, [
      row('envelope', 'e-mail', el('span', { class: 'ct-mail' }, [link(`mailto:${p.email}`, p.email), copyBtn])),
      row('mappin', 'locatie', el('span', { class: 'ct-val', text: p.location })),
      row('external', 'LinkedIn', link(p.linkedin, 'linkedin.com/in/stijnvandepol')),
      row('external', 'GitHub', link(p.github, 'github.com/stijnvandepol')),
      row('doc', 'CV', link(p.cv, 'Bekijk CV (PDF)')),
    ]),
    live,
  ]);

  // ---- Nieuw bericht ----
  const status = el('p', { class: 'ct-status', role: 'status' });
  const subject = el('input', { class: 'field', id: `${uid}-s`, type: 'text', placeholder: 'Onderwerp', autocomplete: 'off' });
  const message = el('textarea', { class: 'field ct-message', id: `${uid}-m`, placeholder: 'Schrijf je bericht…', 'aria-label': 'Bericht', rows: 8, required: true, 'aria-describedby': `${uid}-st` });
  status.id = `${uid}-st`;
  const send = el('button', { class: 'btn btn-primary', type: 'submit', text: 'Verstuur' });
  const form = el('form', { class: 'ct-compose', novalidate: true, 'aria-label': 'Nieuw bericht' }, [
    el('div', { class: 'ct-field' }, [el('span', { class: 'ct-field-label', text: 'Aan' }), el('span', { class: 'ct-to', text: `${p.name} <${p.email}>` })]),
    el('div', { class: 'ct-field' }, [el('label', { class: 'ct-field-label', for: `${uid}-s`, text: 'Onderwerp' }), subject]),
    message,
    el('div', { class: 'ct-foot' }, [
      el('p', { class: 'ct-hint', text: 'Opent je e-mailprogramma met dit bericht ingevuld.' }),
      send,
    ]),
    status,
  ]);
  message.addEventListener('input', () => { message.removeAttribute('aria-invalid'); status.textContent = ''; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = message.value.trim();
    if (!text) {
      message.setAttribute('aria-invalid', 'true');
      status.textContent = 'Schrijf eerst een bericht.';
      message.focus();
      return;
    }
    const s = subject.value.trim() || 'Hallo Stijn';
    os.openExternal(`mailto:${p.email}?subject=${encodeURIComponent(s)}&body=${encodeURIComponent(text)}`);
    status.textContent = 'Je e-mailprogramma wordt geopend…';
  });

  return { view: el('div', { class: 'contact-view' }, [card, form]), copyMail };
}

export function createContactApp() {
  return {
    id: 'contact',
    title: 'Contact',
    menuName: 'Contact',
    width: 760, height: 500, minWidth: 560, minHeight: 420,
    singleton: true,
    mount({ win, titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: 'Contact' }));
      body.classList.add('contact-body');
      const { view, copyMail } = contactView(`${win.id}-ct`);
      body.append(view);
      return {
        getMenus: () => ({ file: [{ label: 'Kopieer e-mailadres', action: copyMail }] }),
      };
    },
  };
}

// ============================================================
// os/simple.js — verrijkt de statische portfolio-pagina (mobiel / eenvoudige weergave)
// De inhoud staat al in de HTML (snel, crawlbaar); dit voegt alleen toe:
//  - de tabbalk markeert de huidige sectie
//  - op brede schermen: knop om terug te gaan naar de macOS-desktop
// ============================================================
import { setView } from '../core/view.js';
import { mountContributions } from '../ui/contributions.js';
import { lang, setLanguage } from '../core/i18n.js';
import { CONFIG } from '../data/config.js';

export function initSimple() {
  // Engels: de Engelse versie uit <template id="static-en"> in de plaats van de Nederlandse zetten.
  const nlRoot = document.getElementById('static-portfolio');
  const enTpl = document.getElementById('static-en');
  if (lang === 'en' && nlRoot && enTpl) nlRoot.replaceWith(enTpl.content.cloneNode(true));
  document.title = CONFIG.site.title;
  const langBtn = document.getElementById('view-lang');
  if (langBtn) { langBtn.hidden = false; langBtn.addEventListener('click', () => setLanguage(langBtn.dataset.lang)); }

  const tabs = [...document.querySelectorAll('.m-tab')];
  const set = (id) => tabs.forEach((t) => {
    const on = t.dataset.target === id;
    t.classList.toggle('active', on);
    if (on) t.setAttribute('aria-current', 'true'); else t.removeAttribute('aria-current');
  });
  // Huidige sectie = de laatste tab-sectie waarvan de bovenkant boven 35% van het scherm is gepasseerd.
  // (Scroll-berekening i.p.v. IntersectionObserver: die meldt bij het verlaten van een lange sectie nog
  // 'zichtbaar' en overschreef daardoor de juiste markering.)
  const targets = tabs.map((t) => document.getElementById(t.dataset.target)).filter(Boolean);
  let queued = false;
  const update = () => {
    queued = false;
    const line = window.innerHeight * 0.35;
    let cur = targets[0];
    for (const el of targets) if (el.getBoundingClientRect().top <= line) cur = el;
    // Onderaan de pagina hoort de laatste tab (Contact) actief te zijn, ook als die sectie kort is.
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = targets[targets.length - 1];
    set(cur.id);
  };
  window.addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();

  const gh = document.querySelector('[data-gh]');
  if (gh) mountContributions(gh);

  // Diepe link uit de desktop-weergave (#projecten/slug): scroll naar het project.
  if (location.hash.length > 1) requestAnimationFrame(() => document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView());

  // Terug naar de desktop kan alleen als het scherm breed genoeg is.
  const btn = document.getElementById('view-desktop');
  if (btn && window.innerWidth > 768) {
    btn.hidden = false;
    btn.addEventListener('click', () => setView('desktop'));
  }
}

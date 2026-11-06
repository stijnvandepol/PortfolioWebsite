// ============================================================
// ui/contributions.js: GitHub-contributions als grafiek in GitHub-stijl.
// De data komt uit assets/data/github.json (dagelijks opgehaald door
// scripts/fetch-github.mjs). Ontbreekt dat bestand, dan blijft het blok verborgen.
// ============================================================
import { el } from '../core/dom.js';
import { t, LOCALE } from '../core/i18n.js';

const MONTHS = Array.from({ length: 12 }, (_, m) => new Date(2024, m, 15).toLocaleDateString(LOCALE, { month: 'short' }).replace('.', ''));
const nf = new Intl.NumberFormat(LOCALE);
const fmtDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });

function graph(data) {
  const first = new Date(`${data.days[0].date}T12:00:00`).getDay(); // 0 = zondag, net als op GitHub
  const cells = [...Array(first).fill(null), ...data.days];
  const weeks = Math.ceil(cells.length / 7);

  // Maandlabel boven de eerste week waarin een nieuwe maand begint.
  const months = [];
  let prev = -1;
  for (let w = 0; w < weeks; w++) {
    const day = cells.slice(w * 7, w * 7 + 7).find(Boolean);
    const m = day ? Number(day.date.slice(5, 7)) - 1 : prev;
    if (m !== prev && w < weeks - 2) months.push(el('span', { class: 'gh-month', style: { gridColumn: `${w + 1} / span 3` }, text: MONTHS[m] }));
    prev = m;
  }

  const grid = el('div', { class: 'gh-grid', style: { '--weeks': weeks } }, cells.map((d) => (d
    ? el('span', { class: 'gh-cell', dataset: { level: d.level }, title: d.count === 1 ? t('1 contribution op {date}', { date: fmtDate(d.date) }) : t('{n} contributions op {date}', { n: nf.format(d.count), date: fmtDate(d.date) }) })
    : el('span', { class: 'gh-cell gh-empty' }))));

  const scroller = el('div', { class: 'gh-scroll' }, [
    el('div', { class: 'gh-body', style: { '--weeks': weeks } }, [
      el('div', { class: 'gh-months', 'aria-hidden': 'true' }, months),
      el('div', { class: 'gh-days', 'aria-hidden': 'true' }, ['', t('ma'), '', t('wo'), '', t('vr'), ''].map((d) => el('span', { text: d }))),
      grid,
    ]),
  ]);
  // Op smalle schermen staan de recentste weken rechts in beeld. Bij elke layoutwijziging
  // opnieuw (de eerste meting is vaak nog zonder overflow), tot de bezoeker zelf scrolt.
  const ro = new ResizeObserver(() => { scroller.scrollLeft = scroller.scrollWidth; });
  ro.observe(scroller);
  ro.observe(grid);
  const stop = () => ro.disconnect();
  ['pointerdown', 'wheel', 'touchstart', 'keydown'].forEach((ev) => scroller.addEventListener(ev, stop, { once: true, passive: true }));

  return [
    el('p', { class: 'gh-total' }, [el('strong', { text: nf.format(data.total) }), ` ${t('contributions in het afgelopen jaar')}`]),
    scroller,
    el('div', { class: 'gh-foot' }, [
      el('a', { class: 'gh-link', href: `https://github.com/${data.login}`, target: '_blank', rel: 'noopener noreferrer', text: `github.com/${data.login}` }),
      el('span', { class: 'gh-legend', 'aria-hidden': 'true' }, [t('Minder'), ...[0, 1, 2, 3, 4].map((l) => el('span', { class: 'gh-cell', dataset: { level: l } })), t('Meer')]),
    ]),
  ];
}

/** Vult `host` met de grafiek zodra de data binnen is; zonder data blijft `host` verborgen. */
export function mountContributions(host) {
  host.hidden = true;
  fetch('./assets/data/github.json', { cache: 'no-cache' })
    .then((r) => (r.ok ? r.json() : null))
    .then((data) => {
      if (!data?.days?.length) return;
      host.append(...graph(data));
      host.hidden = false;
    })
    .catch(() => {});
  return host;
}

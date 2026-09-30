#!/usr/bin/env node
// ============================================================
// scripts/generate-static.mjs
//
// Genereert uit src/assets/js/data/config.js:
//   1. de statische, crawlbare portfolio-HTML (mobiel, eenvoudige weergave,
//      zoekmachines, gebruikers zonder JavaScript)   → <!-- static:start/end -->
//   2. title, meta description, canonical, Open Graph, Twitter en JSON-LD
//                                                    → <!-- head:start/end -->
//   3. sitemap.xml
//
// Gebruik:  node scripts/generate-static.mjs          (schrijft src/index.html)
//           node scripts/generate-static.mjs --check  (faalt als index.html verouderd is)
// ============================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = (p) => join(root, 'src', p);
const { CONFIG, categoryLabel } = await import(pathToFileURL(src('assets/js/data/config.js')).href);
const { sym } = await import(pathToFileURL(src('assets/js/apps/icons.js')).href);

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const { profile: p, site } = CONFIG;
const ext = 'target="_blank" rel="noopener noreferrer"';
const tags = (list, cls = 'm-tags') => `<ul class="${cls}">${list.map((t) => `<li class="m-tag">${esc(t)}</li>`).join('')}</ul>`;

// ---------------------------------------------------------------- <head>
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Person',
      '@id': `${site.url}#person`,
      name: p.name,
      jobTitle: p.role,
      description: p.intro,
      url: site.url,
      image: site.image,
      email: `mailto:${p.email}`,
      address: { '@type': 'PostalAddress', addressLocality: 'Landhorst', addressRegion: 'Noord-Brabant', addressCountry: 'NL' },
      sameAs: [p.github, p.linkedin],
      alumniOf: CONFIG.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.org })),
      knowsAbout: CONFIG.skills.flatMap((s) => s.items),
    },
    { '@type': 'WebSite', '@id': `${site.url}#website`, url: site.url, name: `${p.name} — Portfolio`, inLanguage: 'nl-NL', author: { '@id': `${site.url}#person` } },
    {
      '@type': 'ItemList',
      name: 'Projecten',
      itemListElement: CONFIG.projects.map((pr, i) => ({
        '@type': 'ListItem', position: i + 1,
        item: { '@type': 'CreativeWork', name: pr.title, description: pr.text, url: pr.url || `${site.url}#projecten/${pr.id}`, keywords: pr.tags.join(', '), author: { '@id': `${site.url}#person` } },
      })),
    },
  ],
};
const head = `<!-- head:start (gegenereerd door scripts/generate-static.mjs — niet handmatig wijzigen) -->
  <title>${esc(site.title)}</title>
  <meta name="description" content="${esc(site.description)}">
  <link rel="canonical" href="${esc(site.url)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="nl_NL">
  <meta property="og:site_name" content="${esc(p.name)}">
  <meta property="og:title" content="${esc(site.title)}">
  <meta property="og:description" content="${esc(site.description)}">
  <meta property="og:url" content="${esc(site.url)}">
  <meta property="og:image" content="${esc(site.image)}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="Portfolio van ${esc(p.name)}: een macOS-achtige desktop met het Portfolio-venster">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(site.title)}">
  <meta name="twitter:description" content="${esc(site.description)}">
  <meta name="twitter:image" content="${esc(site.image)}">
  <script type="application/ld+json">${JSON.stringify(ld)}</script>
  <!-- head:end -->`;

// ---------------------------------------------------------------- body
const project = (pr) => `
      <article class="m-project" id="projecten/${esc(pr.id)}">
        <figure class="m-project-img"><img src="${esc(pr.thumb || pr.image)}" alt="Screenshot van ${esc(pr.title)}" width="600" height="${pr.kind === 'web' ? 300 : 450}" loading="lazy" decoding="async"></figure>
        <div class="m-project-body">
          <p class="m-kind">${pr.kind === 'web' ? 'Website' : 'Homelab &amp; opdracht'}${pr.status ? ` · <span class="m-status ${esc(pr.status)}">${pr.status === 'online' ? 'Online' : 'Offline'}</span>` : ''}${pr.date ? ` · ${esc(pr.date)}` : ''}</p>
          <h3 class="m-project-title">${esc(pr.title)}</h3>
          <p class="m-project-sub">${esc(pr.subtitle)}</p>
          ${tags(pr.tags)}
          <p class="m-project-text">${esc(pr.text)}</p>
          ${pr.role ? `<p class="m-project-text"><strong>Rol:</strong> ${esc(pr.role)}</p>` : ''}
          ${pr.result ? `<p class="m-project-text"><strong>Resultaat:</strong> ${esc(pr.result)}</p>` : ''}
          ${(pr.details || []).map((d) => `<p class="m-project-text"><strong>${esc(d.title)}:</strong> ${esc(d.text)}</p>`).join('')}
          ${pr.url ? `<a class="m-link" href="${esc(pr.url)}" ${ext}>Bezoek ${esc(pr.title)} <span aria-hidden="true">↗</span></a>` : ''}
          ${(pr.links || []).map((l) => `<a class="m-link" href="${esc(l.url)}" ${ext}>${esc(l.label)} <span aria-hidden="true">↗</span></a>`).join('')}
        </div>
      </article>`;

const experience = (e) => `
      <li class="m-tl-item">
        <h3 class="m-tl-title">${esc(e.role)} <span class="m-tl-org">— ${esc(e.org)}</span></h3>
        <p class="m-tl-date">${esc([e.period, e.duration, e.location].filter(Boolean).join(' · '))}</p>
        <p class="m-text">${esc(e.text)}</p>
        ${tags(e.tags)}
      </li>`;

const tabs = [['home', 'Home', 'person'], ['projecten', 'Projecten', 'grid'], ['ervaring', 'Ervaring', 'briefcase'], ['skills', 'Skills', 'chart'], ['contact', 'Contact', 'envelope']];

const body = `<!-- static:start (gegenereerd door scripts/generate-static.mjs — niet handmatig wijzigen) -->
  <div class="m-root" id="static-portfolio">
    <main class="m-portfolio" id="main">
      <header class="m-hero" id="home">
        <figure class="m-avatar"><img src="./assets/images/portret.webp" alt="Portret van ${esc(p.name)}" width="120" height="120" fetchpriority="high" decoding="async"></figure>
        <h1 class="m-name">${esc(p.name)}</h1>
        <p class="m-role">${esc(p.role)}</p>
        <p class="m-intro">${esc(p.intro)}</p>
        <ul class="m-chips" aria-label="Specialisaties">${CONFIG.focus.map((f) => `<li class="m-chip">${esc(f.title)}</li>`).join('')}</ul>
        <div class="m-cta">
          <a class="m-btn m-btn-primary" href="#contact">Neem contact op</a>
          <a class="m-btn" href="${esc(p.cv)}" download="${esc(p.cvName)}">Download CV</a>
          <a class="m-btn" href="#projecten">Bekijk projecten</a>
          <a class="m-btn" href="${esc(p.github)}" ${ext}>GitHub</a>
        </div>
      </header>

      <section class="m-section" id="projecten" aria-labelledby="h-projecten">
        <h2 class="m-section-title" id="h-projecten">Projecten</h2>
        <div class="m-projects">${CONFIG.projects.map(project).join('')}
        </div>
      </section>

      <section class="m-section" id="ervaring" aria-labelledby="h-ervaring">
        <h2 class="m-section-title" id="h-ervaring">Ervaring</h2>
        <ol class="m-timeline">${CONFIG.experience.map(experience).join('')}
        </ol>
      </section>

      <section class="m-section" id="skills" aria-labelledby="h-skills">
        <h2 class="m-section-title" id="h-skills">Skills</h2>
        <div class="m-skill-groups">${CONFIG.skills.map((s) => `
          <div class="m-skill-group"><h3 class="m-skill-title">${esc(s.category)}</h3>${tags(s.items)}</div>`).join('')}
        </div>
        <h3 class="m-subtitle">Soft skills</h3>
        ${tags(CONFIG.softskills)}
      </section>

      <section class="m-section" id="opleiding" aria-labelledby="h-opleiding">
        <h2 class="m-section-title" id="h-opleiding">Opleiding</h2>
        <ol class="m-timeline">${CONFIG.education.map((e) => `
          <li class="m-tl-item"><h3 class="m-tl-title">${esc(e.title)} <span class="m-tl-org">— ${esc(e.org)}</span></h3><p class="m-tl-date">${esc(e.period)}</p><p class="m-text">${esc(e.text)}</p></li>`).join('')}
        </ol>
      </section>

      <section class="m-section" id="over" aria-labelledby="h-over">
        <h2 class="m-section-title" id="h-over">Over mij</h2>
        ${CONFIG.about.map((t) => `<p class="m-text">${esc(t)}</p>`).join('\n        ')}
      </section>

      <footer class="m-footer" id="contact">
        <h2 class="m-section-title" id="h-contact">Contact</h2>
        <p class="m-text">Ik denk graag mee over stages, opdrachten en samenwerking. Stuur me gerust een bericht.</p>
        <div class="m-social">
          <a class="m-btn m-btn-primary" href="mailto:${esc(p.email)}">${sym('envelope', 16)} ${esc(p.email)}</a>
          <a class="m-btn" href="${esc(p.linkedin)}" ${ext}>LinkedIn</a>
          <a class="m-btn" href="${esc(p.github)}" ${ext}>GitHub</a>
          <a class="m-btn" href="${esc(p.cv)}" download="${esc(p.cvName)}">Download CV</a>
        </div>
        <p class="m-location">${sym('mappin', 14)} ${esc(p.location)}</p>
        <p class="m-note"><button class="m-view-toggle" id="view-desktop" type="button" hidden>Bekijk als macOS-desktop</button></p>
        <p class="m-copyright">© ${esc(p.name)}</p>
      </footer>
    </main>
    <nav class="m-tabbar" aria-label="Secties">${tabs.map(([id, label, ic]) => `
      <a class="m-tab" href="#${id}" data-target="${id}"><span class="m-tab-ic">${sym(ic, 22)}</span><span class="m-tab-label">${label}</span></a>`).join('')}
    </nav>
  </div>
  <!-- static:end -->`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${esc(site.url)}</loc><changefreq>monthly</changefreq><priority>1.0</priority></url>
</urlset>
`;

// ---------------------------------------------------------------- schrijven
const file = src('index.html');
const before = readFileSync(file, 'utf8');
let html = before
  .replace(/<!-- head:start[\s\S]*?<!-- head:end -->/, head)
  .replace(/<!-- static:start[\s\S]*?<!-- static:end -->/, body);
if (html === before && !before.includes('static:start')) { console.error('Markers <!-- static:start/end --> en <!-- head:start/end --> ontbreken in src/index.html'); process.exit(1); }

if (process.argv.includes('--check')) {
  if (html !== before) { console.error('src/index.html is verouderd t.o.v. config.js — draai: node scripts/generate-static.mjs'); process.exit(1); }
  console.log('index.html is up-to-date'); process.exit(0);
}
writeFileSync(file, html);
writeFileSync(src('sitemap.xml'), sitemap);
console.log(`index.html + sitemap.xml gegenereerd (${CONFIG.projects.length} projecten, ${CONFIG.experience.length} ervaringen, ${CONFIG.skills.length} skillgroepen)`);

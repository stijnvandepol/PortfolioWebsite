# Realistische macOS-portfolio — Implementatieplan

> **Voor agentische uitvoerders:** VEREISTE SUB-SKILL: gebruik superpowers:subagent-driven-development (aanbevolen) of superpowers:executing-plans om dit plan taak-voor-taak uit te voeren. Stappen gebruiken checkbox (`- [ ]`) syntax.

**Goal:** De bestaande macOS-desktop-portfolio realistischer én leesbaarder maken: echte self-hosted macOS-icoon-PNG's in de dock, een landingsvenster dat het werk in ~10s verkoopt, en visuele rust (minder concurrerende lagen).

**Architecture:** Puur de waarneembare laag aanpassen; de modulaire ES-module-architectuur blijft. Iconen worden vanaf één centrale plek (`apps/icons.js`) als PNG-`<img>` geleverd, zodat dock, launchpad en spotlight dezelfde set delen. Geen build-stap, geen framework.

**Tech Stack:** Vanilla HTML/CSS/ES-modules, statisch geserveerd. **Verificatie via de browser (Playwright MCP)** — er is geen testframework; "test" = de site laden en gedrag/uiterlijk controleren.

**Bron-spec:** `docs/superpowers/specs/2026-06-15-macos-portfolio-realism-design.md`

---

## Verificatie-conventie (geldt voor elke taak)

Er zijn geen unit-tests. Elke taak verifieer je zo:

1. Start een statische server vanuit `src/` (eenmalig, blijft draaien):
   `cd src && python -m http.server 8099`
2. Open in Playwright MCP: `http://localhost:8099/index.html`, viewport 1440×900.
3. Wacht ~3s (boot-animatie) en maak een screenshot; lees die terug en controleer het
   beschreven verwachte resultaat.
4. Controleer de browserconsole op fouten (`browser_console_messages`) — verwacht: geen errors.

---

## File Structure

- `src/assets/images/icons/` — **nieuw**. Eén consistente set macOS-systeem-icoon-PNG's
  (Big Sur): `finder.png`, `safari.png`, `terminal.png`, `settings.png`, `photos.png`,
  `launchpad.png`. GitHub/LinkedIn blijven SVG-squircle-tegels in `icons.js`.
  Verantwoordelijkheid: realistische dock/launchpad-assets.
- `src/assets/js/apps/icons.js` — voegt PNG-pad-map + `iconImg()` helper toe. Blijft de bron van
  iconen.
- `src/assets/js/os/dock.js` — rendert PNG-`<img>` (al via `html:`), geen wijziging nodig behalve
  controle.
- `src/assets/js/main.js` — dock-entries verwijzen naar PNG-iconen.
- `src/assets/js/apps/registry.js` — `listApps()` levert PNG-iconen (dock/launchpad/spotlight
  consistent).
- `src/assets/js/apps/portfolio.js` — hero-CTA-knoppen op de "Over Mij"-pagina.
- `src/assets/js/os/desktop.js` — desktop-iconen terug naar 3; misleidende CV-actie eerlijk maken.
- `src/assets/css/os.css` — `.di-icon img` niet meer in `#squircle` klemmen; hero-CTA-styling.

---

## Task 1: Echte macOS-systeem-icoon-PNG's downloaden (self-hosted, één consistente set)

**Files:**
- Create: `src/assets/images/icons/finder.png`, `safari.png`, `terminal.png`, `settings.png`,
  `photos.png`, `launchpad.png`
- Create: `src/assets/images/icons/SOURCE.md` (herkomst + licentie documenteren)

> **Beslissing (door eigenaar bevestigd):** alleen de échte macOS-**systeem-apps** komen als PNG uit
> één consistente Big Sur-set. **GitHub/LinkedIn worden NIET gedownload** — die blijven als eigen
> squircle-SVG-tegels (zie Taak 2) omdat ze geen macOS-apps zijn en dus niet in de set bestaan.

- [ ] **Stap 1: Download de 6 systeem-iconen uit één set (geverifieerd werkend)**

Bron: [puruvj/macos-web](https://github.com/puruvj/macos-web) — `public/app-icons/<naam>/256.png`,
één consistente Big Sur-set. Raw-URL's zijn geverifieerd (HTTP 200 op `main`). Run vanuit de
repo-root:

```bash
mkdir -p src/assets/images/icons
base="https://raw.githubusercontent.com/puruvj/macos-web/main/public/app-icons"
curl -fsSL "$base/finder/256.png"              -o src/assets/images/icons/finder.png
curl -fsSL "$base/safari/256.png"              -o src/assets/images/icons/safari.png
curl -fsSL "$base/terminal/256.png"            -o src/assets/images/icons/terminal.png
curl -fsSL "$base/system-preferences/256.png"  -o src/assets/images/icons/settings.png
curl -fsSL "$base/photos/256.png"              -o src/assets/images/icons/photos.png
curl -fsSL "$base/launchpad/256.png"           -o src/assets/images/icons/launchpad.png
```

- [ ] **Stap 2: Controleer dat alle 6 bestanden geldig en vierkant zijn**

Run: `cd src/assets/images/icons && file *.png && ls -la *.png`
Verwacht: 6 × "PNG image data, 256 x 256", elk groter dan 0 bytes (geen lege/404-bestanden).

> Toont `file` "ASCII text" of "HTML" i.p.v. "PNG image data"? Dan is een download mislukt
> (404 als tekst opgeslagen) — verwijder dat bestand en herhaal de `curl` voor dat icoon.

- [ ] **Stap 3: Documenteer herkomst en licentie**

Schrijf `src/assets/images/icons/SOURCE.md`:

```markdown
# Dock-iconen — herkomst

Systeem-iconen (finder, safari, terminal, settings, photos, launchpad):
Bron: https://github.com/puruvj/macos-web (public/app-icons/<app>/256.png)
Stijl/versie: macOS Big Sur — één consistente set.

Dit zijn Apple's eigen icoon-ontwerpen, gebruikt voor een persoonlijk, niet-commercieel portfolio.
GitHub/LinkedIn zijn géén systeem-apps en worden als eigen squircle-SVG-tegels gerenderd.
```

- [ ] **Stap 4: Commit**

```bash
git add src/assets/images/icons/
git commit -m "assets: self-hosted echte macOS-systeem-iconen (Big Sur-set) voor dock"
```

---

## Task 2: Dock + launchpad echte PNG-iconen laten renderen

**Files:**
- Modify: `src/assets/js/apps/icons.js` (PNG-map + helper toevoegen, onderaan)
- Modify: `src/assets/js/main.js:58-69` (dock-entries)
- Modify: `src/assets/js/apps/registry.js:12-17` (app-iconen)
- Modify: `src/assets/css/os.css:75` (img niet klemmen)

- [ ] **Stap 1: Voeg PNG-icoonmap + helper toe aan `icons.js`**

Voeg onderaan `src/assets/js/apps/icons.js` toe (ná de bestaande `ICONS.*`-regels):

```js
// ---- Realistische dock/launchpad-iconen (self-hosted PNG, Big Sur-set) ----
const ICON_BASE = './assets/images/icons/';
export const APP_ICON_IMG = {
  finder:    `${ICON_BASE}finder.png`,
  safari:    `${ICON_BASE}safari.png`,
  terminal:  `${ICON_BASE}terminal.png`,
  settings:  `${ICON_BASE}settings.png`,
  photos:    `${ICON_BASE}photos.png`,
  launchpad: `${ICON_BASE}launchpad.png`,
};
// Levert een <img>-string die dock.js/launchpad via `html:` renderen.
export const iconImg = (key, label = '') =>
  `<img src="${APP_ICON_IMG[key]}" alt="${label}" draggable="false">`;
```

- [ ] **Stap 2: Laat de dock-entries de PNG-iconen gebruiken**

Vervang in `src/assets/js/main.js` het `import { APP_ICONS }`-gebruik in `dockEntries` door
`iconImg(...)`. Werk de import bij (regel 18) en de `dockEntries`-array (regel 58-69):

Werk de import bij (regel 18 gebruikt al `APP_ICONS`; voeg `iconImg` toe):

```js
import { APP_ICONS, iconImg } from './apps/icons.js';
```

```js
  const dockEntries = [
    { id: 'finder', label: 'Finder', icon: iconImg('finder', 'Finder') },
    { id: 'portfolio', label: 'Over Mij', icon: iconImg('safari', 'Over Mij') },
    { id: 'terminal', label: 'Terminal', icon: iconImg('terminal', 'Terminal') },
    { id: 'portfolio', label: 'Projecten', icon: iconImg('photos', 'Projecten'), action: () => os.open('portfolio', { initialPage: 'portfolio' }) },
    { id: 'settings', label: 'Instellingen', icon: iconImg('settings', 'Instellingen') },
    { id: 'launchpad', label: 'Launchpad', icon: iconImg('launchpad', 'Launchpad'), action: () => os.toggleLaunchpad() },
    { sep: true },
    { id: 'github', label: 'GitHub', icon: APP_ICONS.github, href: CONFIG.profile.github },
    { id: 'linkedin', label: 'LinkedIn', icon: APP_ICONS.linkedin, href: CONFIG.profile.linkedin },
  ];
```

> Wijzigingen t.o.v. nu: systeem-apps gebruiken `iconImg(...)` (echte PNG); "Projecten" opent de
> in-app Portfolio-pagina (echte projectengrid) i.p.v. Finder; Instagram is uit de dock gehaald om
> 'm rustiger te maken (blijft via het profiel/contact bereikbaar). GitHub/LinkedIn blijven hun
> bestaande `APP_ICONS.*`-SVG-squircle-tegel (geen echte macOS-apps).

- [ ] **Stap 3: Laat registry/launchpad dezelfde PNG-iconen gebruiken**

In `src/assets/js/apps/registry.js`, vervang de SVG-iconen door PNG zodat Launchpad/Spotlight
overeenkomen met de dock. Pas de import (regel 4) en de `APPS`-iconen (regel 12-17) aan:

```js
import { iconImg } from './icons.js';
```

```js
export const APPS = [
  { id: 'finder',    title: 'Finder',              icon: iconImg('finder', 'Finder'),     create: (o) => createFinderApp(o) },
  { id: 'portfolio', title: 'Over Mij',            icon: iconImg('safari', 'Over Mij'),   create: (o) => createPortfolioApp({ ...o, onPreview: quickLook }) },
  { id: 'terminal',  title: 'Terminal',            icon: iconImg('terminal', 'Terminal'), create: (o) => createTerminalApp(o) },
  { id: 'settings',  title: 'Systeeminstellingen', icon: iconImg('settings', 'Instellingen'), create: (o) => createSettingsApp(o) },
];
```

- [ ] **Stap 4: Verwijder de squircle-clip op echte icoon-`<img>`**

In `src/assets/css/os.css` regel 75, splits de selector zodat alleen SVG-iconen geklemd worden
(echte PNG's hebben hun vorm + schaduw al ingebakken). Geef de SVG-tegels (GitHub/LinkedIn) een
zachte drop-shadow zodat ze visueel aansluiten bij de PNG's met ingebakken schaduw:

```css
.di-icon svg { width: 100%; height: 100%; display: block; clip-path: url(#squircle); filter: drop-shadow(0 3px 5px rgba(0,0,0,0.28)); }
.di-icon img { width: 100%; height: 100%; display: block; }
```

- [ ] **Stap 5: Verifieer in de browser**

Laad `http://localhost:8099/index.html`, wacht 3s, screenshot. Verwacht:
- Dock toont realistische macOS-iconen (Finder/Safari/Terminal/Foto's/Instellingen/Launchpad,
  separator, GitHub/LinkedIn) — geen vlakke zelfgetekende SVG's meer.
- Hover over de dock → magnification werkt nog, iconen blijven scherp (niet bijgeknipt).
- `browser_console_messages` → geen 404's op `/assets/images/icons/*.png` en geen JS-errors.
- Open Launchpad (klik launchpad-icoon of F4) → dezelfde iconen als in de dock.

- [ ] **Stap 6: Commit**

```bash
git add src/assets/js/apps/icons.js src/assets/js/main.js src/assets/js/apps/registry.js src/assets/css/os.css
git commit -m "feat: echte PNG-iconen in dock + launchpad, squircle-clip alleen op SVG"
```

---

## Task 3: Landingsvenster verkoopt — hero-CTA's op "Over Mij"

**Files:**
- Modify: `src/assets/js/apps/portfolio.js:13-50` (`pageOverMij`)
- Modify: `src/assets/css/os.css` (hero-CTA-styling toevoegen, onderaan vóór media-queries)

- [ ] **Stap 1: Voeg twee CTA-knoppen toe aan de profielheader**

In `src/assets/js/apps/portfolio.js`, breid de `profile-info`-blok in `pageOverMij()` uit met een
CTA-rij ná `profile-meta`. De knoppen navigeren in-app (geen verzonnen CV-bestand):

```js
        el('div', { class: 'profile-meta' }, [
          el('span', { class: 'meta-item' }, [svg(ICONS.mail), el('a', { href: `mailto:${p.email}`, text: p.email })]),
          el('span', { class: 'meta-item' }, [svg(ICONS.pin), p.location]),
        ]),
        el('div', { class: 'hero-cta' }, [
          el('button', { class: 'cta-btn cta-primary', dataset: { goto: 'portfolio' }, type: 'button', text: 'Bekijk projecten' }),
          el('button', { class: 'cta-btn cta-secondary', dataset: { goto: 'ontwikkeling' }, type: 'button', text: 'Bekijk mijn CV' }),
        ]),
```

> "Bekijk mijn CV" gaat naar de Ontwikkeling-pagina — díe bevat opleiding, ervaring en
> vaardigheden, oftewel de CV-inhoud. Eerlijk en werkend zonder los PDF-bestand.

- [ ] **Stap 2: Bedraad de CTA-knoppen op de bestaande navigatie**

In `createPortfolioApp(...).mount(...)`, in de bestaande `pages.addEventListener('click', ...)`
handler (regel 177), voeg bovenaan de handler een afhandeling voor de CTA toe:

```js
      pages.addEventListener('click', (e) => {
        const cta = e.target.closest('.cta-btn');
        if (cta) { navigate(cta.dataset.goto); return; }
        const fb = e.target.closest('.filter-btn');
```

(de rest van de handler blijft ongewijzigd)

- [ ] **Stap 3: Styling voor de CTA-knoppen**

Voeg toe aan `src/assets/css/os.css` (bij de overige `.page`/profiel-styling):

```css
.hero-cta { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.cta-btn { font: inherit; font-size: var(--text-md); font-weight: 600; padding: 9px 18px; border-radius: var(--r-md); cursor: pointer; border: 1px solid transparent; transition: transform 0.12s var(--ease), filter 0.15s var(--ease); }
.cta-btn:active { transform: translateY(1px); }
.cta-primary { background: var(--accent); color: #fff; }
.cta-primary:hover { filter: brightness(1.08); }
.cta-secondary { background: var(--surface); color: var(--text-primary); border-color: var(--glass-border); }
.cta-secondary:hover { background: var(--surface-hover); }
```

- [ ] **Stap 4: Verifieer in de browser**

Laad de site, wacht op het auto-geopende venster. Verwacht:
- Onder naam/rol/contact staan twee knoppen: groene "Bekijk projecten" + neutrale "Bekijk mijn CV".
- Klik "Bekijk projecten" → venster navigeert naar de projectengrid.
- Klik "Bekijk mijn CV" → venster navigeert naar Ontwikkeling (opleiding/ervaring/skills).
- Geen console-errors.

- [ ] **Stap 5: Commit**

```bash
git add src/assets/js/apps/portfolio.js src/assets/css/os.css
git commit -m "feat: hero-CTA's (Bekijk projecten / Bekijk mijn CV) op landingsvenster"
```

---

## Task 4: Desktop ontrommelen — 3 iconen, geen misleidende CV-dummy

**Files:**
- Modify: `src/assets/js/os/desktop.js:6-19` (icoonlijst + CV-icoon)

- [ ] **Stap 1: Breng desktop-iconen terug tot 3 en maak de CV-actie eerlijk**

Vervang `DESKTOP_ICONS` (regel 10-15) en het PNG-`fileIcon()` blijft, maar de actie wijst niet meer
misleidend naar GitHub. Gebruik PNG-iconen voor consistentie met de dock:

```js
import { iconImg } from '../apps/icons.js';
```

```js
const DESKTOP_ICONS = [
  { id: 'projecten', label: 'Projecten', icon: iconImg('photos', 'Projecten'), open: () => os.open('portfolio', { initialPage: 'portfolio' }) },
  { id: 'cv', label: 'CV', icon: fileIcon(), open: () => os.open('portfolio', { initialPage: 'ontwikkeling' }) },
  { id: 'trash', label: 'Prullenmand', icon: APP_ICONS.trash, open: () => os.open('finder', { initial: 'Downloads' }) },
];
```

> "Over Mij" valt weg als losse desktop-icoon (opent al automatisch bij boot + staat in de dock) →
> minder concurrentie met het venster. De CV-tegel opent nu de Ontwikkeling-pagina i.p.v.
> misleidend naar GitHub te springen. Label "CV.pdf" → "CV" omdat het geen los bestand is.
> Behoud de bestaande `import { APP_ICONS }` (nog gebruikt voor `trash`).

- [ ] **Stap 2: Verifieer in de browser**

Laad de site, screenshot de rechterkolom. Verwacht:
- Exact 3 desktop-iconen: Projecten, CV, Prullenmand.
- Dubbelklik "Projecten" → projectengrid; dubbelklik "CV" → Ontwikkeling-pagina.
- Geen console-errors.

- [ ] **Stap 3: Commit**

```bash
git add src/assets/js/os/desktop.js
git commit -m "feat: desktop ontrommeld naar 3 iconen, CV-actie eerlijk (in-app)"
```

---

## Task 5: Visuele eindcontrole — rust, beide thema's, mobiel

**Files:**
- Geen verplichte wijziging; alleen aanpassen wat de controle aan het licht brengt.

- [ ] **Stap 1: Desktop-screenshot beide thema's**

Laad de site (dark, standaard), screenshot. Open Instellingen (⌘, of dock) en zet light-mode aan,
screenshot. Verwacht in beide: dock-iconen scherp en realistisch, één venster als duidelijk
focuspunt, ≤3 desktop-iconen, geen overlappende/rommelige lagen.

- [ ] **Stap 2: Mobiele viewport**

Zet viewport 390×844 (`browser_resize`), herlaad, screenshot. Verwacht: venster vult netjes het
scherm (bestaande media-query regel 335+), dock blijft bruikbaar, geen horizontale overflow.

- [ ] **Stap 3: Console-check**

`browser_console_messages` op desktop én mobiel. Verwacht: geen errors, geen 404's.

- [ ] **Stap 4: Los kleine bevindingen op en commit (indien nodig)**

Als de controle een rommelpunt toont (uitlijning menubar, spacing, een resterend SVG-icoon),
corrigeer het via tokens en commit:

```bash
git add -A
git commit -m "fix: visuele puntjes op de i na eindcontrole"
```

---

## Self-Review (door auteur uitgevoerd)

- **Spec-dekking:** §4.1 dock → Taak 1+2. §4.2 landingsvenster → Taak 3. §4.3 rust/hiërarchie →
  Taak 4+5. §4.4 buiten scope → gerespecteerd (geen nieuwe apps; CV-dummy eerlijk gemaakt i.p.v.
  nieuwe feature). Icoon-consistentie-eis → Taak 1 stap 1 + registry/launchpad in Taak 2.
- **Placeholders:** geen TBD/TODO; alle code-stappen bevatten concrete code en verwachte resultaten.
- **Type-consistentie:** `iconImg(key, label)` gedefinieerd in Taak 2 en identiek gebruikt in
  main.js, registry.js, desktop.js. `APP_ICON_IMG`-sleutels matchen de PNG-bestandsnamen uit Taak 1.
- **Open content-afhankelijkheid:** echte icoon-PNG's moeten gedownload worden (Taak 1) — dit is
  het enige deel dat externe assets vergt; expliciet als eerste taak gemarkeerd.

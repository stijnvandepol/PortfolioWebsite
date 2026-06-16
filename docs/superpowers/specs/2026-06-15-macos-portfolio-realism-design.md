# Ontwerp: Realistische macOS-desktop die het werk in 10 seconden verkoopt

> Status: goedgekeurd ontwerp (brainstormfase) · Datum: 2026-06-15
> Scope: visuele/UX-laag van het bestaande `src/`-portfolio. Geen architectuurherbouw.

## 1. Doel

De portfolio is na de vorige ronde omgebouwd tot een macOS-desktop. De eigenaar ervaart het
resultaat als **rommelig** en twijfelt aan de OS-richting, maar wil die richting behouden en
juist geloofwaardiger maken. Twee gelijkwaardige doelen:

1. **Indruk maken** — vol inzetten op de macOS-illusie; het moet *echt* aanvoelen.
2. **Bruikbaar blijven** — een recruiter begrijpt binnen ~10 seconden wie Stijn is en vindt
   zijn werk (projecten + CV) zonder de OS te hoeven "leren bedienen".

Leidend principe: **één duidelijke leesvolgorde binnen een geloofwaardige OS.** Indruk komt van
authenticiteit (echte dock, echte vensters); bruikbaarheid van hiërarchie (één focuspunt, rust
eromheen).

## 2. Kernprobleem

Er concurreren nu vier navigatielagen om aandacht bij het eerste beeld: menubar, desktop-iconen,
dock én venster-tabs. Het oog heeft geen rustpunt → "rommelig". Daarnaast voelen de dock-iconen
nep: het zijn handgetekende inline-SVG's. De overtuigende macOS-web-clones
([puruvj/macos-web](https://github.com/puruvj/macos-web), [aarxa/macos-clone](https://github.com/aarxa/macos-clone))
gebruiken **echte macOS-icoon-bestanden (hoge-res PNG)**, niet zelfgetekende SVG. De vorige
portfolio-versie laadde die echte iconen nog van `macos-web.app`; bij de herbouw zijn ze
vervangen door SVG "om alles self-hosted te maken" — daar zit de realisme-regressie.

## 3. Beslissingen (door eigenaar bevestigd)

- **Richting:** macOS-OS behouden en versterken (niet reverten, geen dual-mode).
- **Balans:** indruk én leesbaarheid; recruiter binnen seconden bij het werk.
- **Dock-iconen:** echte macOS-icoon-PNG's, **self-hosted** in de repo (geen externe requests;
  audit-doel C6 blijft overeind). Het zijn Apple's eigen ontwerpen — acceptabel voor een
  persoonlijk, niet-commercieel portfolio.
- **Icoon-consistentie (harde eis):** alle iconen komen uit **één set / één macOS-versie**. Een
  oudere stijl (bv. Big Sur) is prima, zolang álle iconen dezelfde versie/stijl delen — geen mix
  van Big Sur + Tahoe/Sonoma door elkaar.
- **Desktop-iconen:** terugbrengen tot ~3 (Projecten, CV.pdf, Prullenmand) zodat het venster het
  hoofdpunt is.
- **Scope:** geen nieuwe apps/features; de bestaande illusie geloofwaardiger maken. Halve/dode
  interacties worden óf echt gemaakt óf verwijderd.

## 4. Ontwerp per onderdeel

### 4.1 Realistische dock
- Nieuwe map `src/assets/images/icons/` met hoge-res PNG's voor: Finder, Safari, Terminal,
  Systeeminstellingen, Foto's/Projecten, Launchpad, GitHub, LinkedIn. Bron: een open
  macOS-icoonset (bv. [nunosans/big-sur-icons](https://github.com/nunosans/big-sur-icons) of
  [macOSicons](https://macosicons.com/)), gedownload in de repo.
- `apps/icons.js`: `APP_ICONS.*` levert PNG-paden i.p.v. SVG-strings (of een tweede export
  `APP_ICON_IMG` zodat menubar/launchpad die ook kunnen gebruiken).
- [dock.js](../../../src/assets/js/os/dock.js): render `<img>` met de PNG i.p.v. `html: entry.icon`.
  Bestaande mechaniek behouden: magnification (rAF), running-dots (`.di-dot`), launch-bounce.
- Iconen ogen op een squircle-canvas met de ingebakken macOS-schaduw. Separator vóór de
  social-iconen blijft.
- **Acceptatie:** de dock is op een screenshot niet te onderscheiden van een echte macOS-dock
  qua iconen; geen externe netwerk-requests voor dock-assets.

### 4.2 Eerste indruk: landingsvenster verkoopt
- Bij boot opent automatisch één gecentreerd Portfolio-venster (gebeurt al via `main.js`).
- De eerste pagina ("Over Mij") wordt een echte **hero**: foto, naam, één sterke pitch-zin, en
  twee primaire knoppen — *Bekijk projecten* en *Download CV* — die respectievelijk de
  Projecten-weergave openen en het CV-bestand openen/downloaden.
- **Acceptatie:** een nieuwe bezoeker ziet zonder enige interactie wie Stijn is en heeft twee
  duidelijke vervolgacties in beeld.

### 4.3 Rust & hiërarchie
- Desktop-iconen terug naar ~3 (Projecten, CV.pdf, Prullenmand); rechterkolom concurreert niet
  meer met het venster.
- Menubar: alleen essentiële items; klok/Control Center rechts netjes uitgelijnd.
- Spacing/typografie strikt via bestaande tokens (`tokens.css`); geen losse magic numbers in
  componenten.
- Onboarding-hint (notificatie "⌘Space / F4 / dubbelklik") behouden, iets rustiger getimed.
- **Acceptatie:** bij eerste paint is het geopende venster het onmiskenbare focuspunt.

### 4.4 Buiten scope
- Geen Mission Control, widgets, lock-screen of extra apps.
- Geen architectuur-refactor; de modulaire ES-module-opzet blijft zoals die is.

## 5. Betrokken bestanden (verwacht)

- `src/assets/images/icons/*` — nieuwe PNG-assets.
- `src/assets/js/apps/icons.js` — iconen als PNG-pad.
- `src/assets/js/os/dock.js` — `<img>`-rendering.
- `src/assets/js/apps/portfolio.js` — hero-pagina met CTA-knoppen.
- `src/assets/js/os/desktop.js` — desktop-iconen terugbrengen.
- `src/assets/js/main.js` — dock-entries / icoonverwijzingen.
- `src/assets/css/os.css` — dock/icoon/hero-styling, hiërarchie/spacing.
- Mogelijk `src/assets/js/os/menubar.js` — menubar opschonen.

## 6. Risico's

- **Icoon-licentie/herkomst:** Apple-icoon-ontwerpen; acceptabel voor persoonlijk gebruik,
  expliciet door eigenaar gekozen. Bron + licentie documenteren in de repo.
- **Asset-grootte:** PNG's kunnen zwaar zijn → high-res maar geoptimaliseerd (bv. 2x, ~128px
  base) en `loading="eager"` voor dock (zichtbaar bij paint), `decoding="async"`.
- **Regressie:** alles is visuele laag; bestaande mechaniek hergebruiken beperkt risico.

## 7. Succescriteria

1. Dock-iconen ogen authentiek macOS (screenshot-test), volledig self-hosted.
2. Eerste beeld na boot: één rustig venster met naam, pitch en twee CTA's.
3. Geen concurrerende rommel: ≤3 desktop-iconen, opgeschoonde menubar.
4. Geen dode/dummy-interacties meer in de zichtbare laag.
5. Geen externe UI-asset-requests.

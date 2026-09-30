# Portfolio Website — macOS Desktop

Een persoonlijke portfolio van Stijn van de Pol, gepresenteerd als een **interactieve macOS-desktop**: vensterbeheer, een dock, Spotlight, Launchpad, Finder, een interactieve Terminal en light/dark-thema's. Gebouwd in **vanilla HTML/CSS/ES-modules** (geen build-stap), containerized via Docker en geserveerd met Nginx achter Cloudflared op [stijnvandepol.nl](https://stijnvandepol.nl).

## Functionaliteiten

- **Portfolio eerst.** De Portfolio-app opent direct en heeft een zijbalk met labels: **Over mij · Projecten · Ervaring · Skills · Opleiding · Contact · CV**. Elke pagina heeft een deelbare URL (`#projecten/snackspot`).
- **Home** toont naam, rol, specialisaties, vier duidelijke knoppen (contact, CV, projecten, GitHub), uitgelichte projecten, skills en ervaring.
- **Projecten** zijn scanbaar (titel, ondertitel, tags) met een projectpagina, kruimelpad en vorige/volgende.
- **Eenvoudige weergave** — het portfolio als gewone, snelle pagina zonder desktop (S-menu, zijbalk, Help of Spotlight). Mobiel (≤ 768 px) gebruikt dit automatisch.
- **macOS-desktop** — vensterbeheer (slepen, resizen, zoomen, tegelen, minimaliseren naar het Dock), menubalk met toetsenbordnavigatie, Dock, Spotlight (`⌘K`), Launchpad, Finder, Terminal, Systeeminstellingen, Contact.
- **Weergave** — Licht / Donker / Automatisch, vijf accentkleuren (standaard **blauw**), verminder beweging en transparantie.
- **SEO** — statische, semantische HTML met alle inhoud, canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`; werkt ook zonder JavaScript.
- **Toegankelijk** — volledig toetsenbord, ARIA, focus-ring, contrast per accent berekend, `prefers-reduced-motion/-transparency/-contrast`.
- Veilige rendering (alle content escaped), self-hosted iconen en lettertype — geen externe afhankelijkheden.

## Architectuur

```
src/index.html         shell + GEGENEREERDE statische portfolio-HTML en SEO-tags
src/assets/js/
  main.js              kiest desktop of eenvoudige weergave (dynamic import)
  boot-desktop.js      compositie van de desktop-OS
  preboot.js           klassiek script: weergave/boot-vlaggen vóór eerste paint
  core/                store, dom-helpers, theme (accent/contrast), view (weergavekeuze)
  ui/                  gedeelde controls (segmented, switch, accent)
  os/                  windowManager, dock, menubar, menu, contextmenu, spotlight,
                       launchpad, desktop, notifications, quicklook, simple, bridge
  apps/                registry + portfolio, contact, finder, terminal, settings, about, icons
  data/config.js       content (single source of truth)
src/assets/css/        tokens.css (design system) · style.css · os.css · apps.css · mobile.css
scripts/generate-static.mjs   genereert de statische HTML + SEO uit config.js
```

**Content aanpassen:** pas alleen **`src/assets/js/data/config.js`** aan (projecten, ervaring, skills, contact).
Draai daarna `npm run generate` (of `node scripts/generate-static.mjs`) om `index.html` bij te werken;
`npm run check` controleert of die actueel is. De Docker-build doet dit automatisch.
Projecten kennen optionele velden (`role`, `result`, `details`, `links`) die vanzelf verschijnen.

Zie [`docs/DESIGN.md`](docs/DESIGN.md) voor de UX-review, ontwerpkeuzes, metingen en testdekking.

## Lokaal draaien

### Snel (statische server)
```sh
cd src && python3 -m http.server 8080   # → http://localhost:8080  (?view=simple voor de gewone pagina)
```

### Docker (zoals productie)
```sh
docker build -t portfoliowebsite .
docker run -d -p 8081:80 portfoliowebsite   # → http://localhost:8081
```

## Sneltoetsen

| Toets | Actie |
|-------|-------|
| `⌘K` / `Ctrl+K` | Zoeken (projecten, ervaring, skills, acties) |
| `F4` | Launchpad |
| `⌘,` | Systeeminstellingen |
| `⌘W` / `⌘M` / `⌥⌘W` | Venster sluiten / minimaliseren / alles sluiten |
| `⌘F` | Zoeken in de Finder |
| `Spatie` | Voorvertoning (Finder) |
| `⌘[` `⌘]` | Vorige / volgende pagina (Portfolio) |
| `Esc` | Sluit overlay of menu; in een projectpagina: terug naar de lijst |

Sommige browsers houden `⌘W`/`⌘,` voor zichzelf; alle acties staan ook in de menu's.

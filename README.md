# Portfolio Website — macOS Desktop

Een persoonlijke portfolio van Stijn van de Pol, gepresenteerd als een **interactieve macOS-desktop**: vensterbeheer, een dock, Spotlight, Launchpad, Finder, een interactieve Terminal en light/dark-thema's. Gebouwd in **vanilla HTML/CSS/ES-modules** (geen build-stap), containerized via Docker en geserveerd met Nginx achter Cloudflared op [stijnvandepol.nl](https://stijnvandepol.nl).

## Functionaliteiten

- **Echt vensterbeheer** — meerdere vensters met focus/z-order, slepen, resizen (8 handles), minimaliseren naar het dock, maximaliseren en **window-snapping** (helften/kwarten).
- **Apps** — Over Mij (Safari-stijl), **Finder** met gesimuleerd bestandssysteem, interactieve **Terminal** (`help`, `projects`, `neofetch`, …), **Systeeminstellingen**, en **Quick Look** preview.
- **Spotlight** (`⌘Space`) — fuzzy zoeken over apps, pagina's, projecten en acties.
- **Launchpad** (`F4`), dock-magnification, running-indicators en launch-bounce.
- **Light / Dark / Auto** thema met accentkleuren en `prefers-reduced-motion`-ondersteuning (persistent).
- **Toegankelijk** — toetsenbordbediening, focus-trapping in modals, ARIA-rollen, zichtbare focus-ring.
- Veilige rendering (alle content escaped) en self-hosted iconen — geen externe UI-afhankelijkheden.

## Architectuur

```
src/assets/js/
  main.js              bootstrap/compositie
  core/                store (reactief), dom-helpers (escape/focus-trap), theme
  os/                  windowManager, dock, menubar, spotlight, launchpad,
                       desktop, notifications, contextmenu, quicklook, bridge
  apps/                registry + portfolio, terminal, finder, settings, icons
  data/config.js       content (single source of truth)
src/assets/css/        tokens.css (thema's) · style.css (vensters/content) · os.css (chrome)
```

Pas je content aan in **`src/assets/js/data/config.js`** — de UI rendert automatisch.
Zie [`docs/AUDIT.md`](docs/AUDIT.md) voor de volledige architectuur- en kwaliteitsanalyse.

## Lokaal draaien

### Snel (statische server)
```sh
cd src && python3 -m http.server 8080   # → http://localhost:8080
```

### Docker (zoals productie)
```sh
docker build -t portfoliowebsite .
docker run -d -p 8081:80 portfoliowebsite   # → http://localhost:8081
```

## Sneltoetsen

| Toets | Actie |
|-------|-------|
| `⌘Space` | Spotlight |
| `F4` | Launchpad |
| `⌘,` | Systeeminstellingen |
| `⌘W` / `⌘M` | Actief venster sluiten / minimaliseren |
| `Esc` | Sluit overlay/menu |

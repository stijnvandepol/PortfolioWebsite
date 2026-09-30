# Portfolio Website — macOS Desktop

Een persoonlijke portfolio van Stijn van de Pol, gepresenteerd als een **interactieve macOS-desktop**: vensterbeheer, een dock, Spotlight, Launchpad, Finder, een interactieve Terminal en light/dark-thema's. Gebouwd in **vanilla HTML/CSS/ES-modules** (geen build-stap), containerized via Docker en geserveerd met Nginx achter Cloudflared op [stijnvandepol.nl](https://stijnvandepol.nl).

## Functionaliteiten

- **Echt vensterbeheer** — meerdere vensters met focus/z-order, slepen, resizen (8 handles), dubbelklik = zoomen, tegelen (helften/kwarten), minimaliseren naar een eigen Dock-tegel en aanpassing aan kleine schermen.
- **Apps** — **Portfolio** (zijbalk: Over mij, Ontwikkeling, Portfolio, Websites), **Contact** (contactkaart + nieuw bericht), **Finder** (zoeken, lijst/iconen, Quick Look), interactieve **Terminal** (Tab-aanvullen), **Systeeminstellingen** en **Over dit portfolio**.
- **Menubalk** met Apple-menu, app-menu en Bestand/Bewerken/Weergave/Ga/Venster/Help, Bedieningspaneel en kalender; volledig met toetsenbord te bedienen.
- **Zoeken** (`⌘K`) over apps, pagina's, projecten, ervaring en vaardigheden; **Launchpad** (`F4`); Dock met magnificatie en contextmenu.
- **Weergave** — Licht / Donker / Automatisch, vijf accentkleuren (standaard **blauw**), verminder beweging en transparantie.
- **Mobiel (≤ 768 px)** — een statische, snelle weergave met iOS-achtige tabbalk in plaats van de desktop.
- **Toegankelijk** — volledig toetsenbord, ARIA-rollen, focus-ring, contrast per accent berekend, `prefers-reduced-motion/-transparency/-contrast`.
- Veilige rendering (alle content escaped), self-hosted iconen en lettertype — geen externe afhankelijkheden.

## Architectuur

```
src/assets/js/
  main.js              kiest desktop of mobiel (dynamic import)
  boot-desktop.js      compositie van de desktop-OS
  preboot.js           klassiek script: boot/mobiel-vlaggen vóór eerste paint
  core/                store (reactief), dom-helpers, theme (accent/contrast)
  ui/                  gedeelde controls (segmented, switch, accent)
  os/                  windowManager, dock, menubar, menu, contextmenu, spotlight,
                       launchpad, desktop, notifications, quicklook, bridge, mobile
  apps/                registry + portfolio, contact, finder, terminal, settings, about, icons
  data/config.js       content (single source of truth)
src/assets/css/        tokens.css (design system) · style.css (venster/content)
                       os.css (chrome) · apps.css · mobile.css
```

Pas je content aan in **`src/assets/js/data/config.js`** — de UI rendert automatisch.
Zie [`docs/DESIGN.md`](docs/DESIGN.md) voor ontwerpkeuzes, design system, metingen en testdekking.

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
| `⌘K` / `Ctrl+K` | Zoeken |
| `F4` | Launchpad |
| `⌘,` | Systeeminstellingen |
| `⌘W` / `⌘M` / `⌥⌘W` | Venster sluiten / minimaliseren / alles sluiten |
| `⌘F` | Zoeken in de Finder |
| `Spatie` | Voorvertoning (Finder) |
| `⌘[` `⌘]` | Vorige / volgende pagina (Portfolio) |
| `Esc` | Sluit overlay of menu |

Sommige browsers houden `⌘W`/`⌘,` voor zichzelf; alle acties staan ook in de menu's.

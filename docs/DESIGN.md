# Ontwerp & kwaliteit

Dit portfolio is een kleine macOS-omgeving waarin de content draait. Dit document
beschrijft de ontwerpkeuzes, het design system en hoe alles is gecontroleerd.

## Uitgangspunten

1. **Inhoud eerst.** Binnen een paar seconden moet duidelijk zijn wie, wat, welke
   techniek en hoe contact. Het Portfolio-venster opent automatisch; de zijbalk toont
   permanent alle secties; Contact staat in Dock, toolbar en Spotlight.
2. **Geen gimmicks.** Elk onderdeel heeft een doel. Weggelaten omdat ze niets deden:
   Prullenmand, doorlopende achtergrondanimaties, gloeiende avatar, decoratieve
   blur-schijven, een tweede Dock-icoon voor dezelfde app.
3. **Glas alleen in de navigatielaag** (menubalk, Dock, menu's, popovers, Spotlight,
   zijbalken). Inhoudsvlakken zijn effen. Zo blijft er hiërarchie en blijft het licht.
4. **Eigen identiteit.** Systeem-apps (Finder, Terminal, Instellingen) gebruiken
   het Big Sur-icoonpakket; mijn eigen apps (Portfolio, Contact, Over) hebben eigen
   blauwe tegels met het S-merkteken (dat ook de favicon is).

## Design system (`assets/css/tokens.css`)

Alle componenten gebruiken tokens; geen losse `border-radius`/`box-shadow`/`transition`.

| Onderdeel | Tokens |
|---|---|
| Kleur | `--accent`, `--accent-fill` (vulling, ≥ 4.5:1 met tekst), `--accent-text` (accent als tekst), `--on-accent`; semantisch: `--text-*`, `--surface*`, `--hairline`, `--separator`, `--window-bg` |
| Materialen | `--material-chrome` (dun) < `--material-window` < `--material-popover` < `--material-overlay`, met `--edge` (0,5px rand) en `--specular` (lichtrand bovenaan) |
| Typografie | SF Pro via `-apple-system`; Inter (zelf gehost, alleen niet-Apple) met metrisch afgestemde fallback; schaal 11/12/13/14/16/20/24/30 |
| Radii · spacing | `--r-*`, `--win-radius`, `--dock-radius`, 4pt-raster `--sp-*` |
| Motion | `--dur-*` (80–400 ms), `--ease-window` (kritisch gedempt, geen overshoot), `--ease-out`, `--ease-in` |
| Z-lagen | `--z-window` … `--z-tooltip` (vensters < snap < dock < menubalk < meldingen < overlays < menu's) |
| Toegankelijkheid | `prefers-reduced-motion`, `prefers-reduced-transparency`, `prefers-contrast` + eigen schakelaars voor beweging en transparantie |

**Accent.** Blauw (`#0A84FF`) is de standaard. Per accent worden vulkleur, tekst-op-vulling
en accent-tekst automatisch op WCAG-contrast berekend (`core/theme.js`), zodat ook
oranje/groen leesbaar blijven. Alleen bewuste keuzes worden opgeslagen; een oude,
automatisch bewaarde groene voorkeur wordt eenmalig teruggezet naar blauw.

## Gedrag

- **Vensters:** slepen via `translate` (GPU), 8 resize-handles, dubbelklik = zoomen,
  tegelen naar randen en hoeken (of via Venster-menu), passen zich aan viewport-wijziging aan.
- **Motion als ruimtelijke uitleg:** een venster schaalt vanuit zijn Dock-icoon;
  minimaliseren vliegt naar een eigen Dock-tegel en terug; sluiten is een korte fade-schaal.
- **Menubalk:** Apple-menu, app-menu, Bestand, Bewerken, Weergave, Ga, Venster, Help;
  gevuld bij openen; ←/→/↑/↓/Esc/type-ahead; hover wisselt tussen menu's; gekozen item knippert.
- **Dock:** cosinus-magnificatie zonder layout-reads, bounce alleen bij starten,
  contextmenu met venster­lijst, running-indicator.
- **Zoeken (⌘K):** apps, pagina's, projecten, ervaring, vaardigheden en acties.
- **Onboarding:** één melding bij het eerste bezoek. Geen tutorial.

## Toetsenbord

Zie Systeeminstellingen → Sneltoetsen. Browsers houden ⌘W/⌘Q/⌘, soms voor zichzelf;
alle acties staan daarom ook in de menu's.

## Onderzoek

Gebaseerd op Apple's Human Interface Guidelines (Windows, Menus, The menu bar, Dock
menus, Sidebars, Materials, Typography, Motion, Accessibility, Color), WWDC25 (Liquid Glass) en
de SwiftUI-animatiedocumentatie. Pixelmaten voor menu's, Dock en schaduwen publiceert Apple niet;
die waarden zijn eigen, gemotiveerde keuzes. Er is bewust geen SVG-lensing
(`backdrop-filter: url()`) gebruikt: dat werkt alleen in Chromium en is duur.

## Metingen (Chromium 141, lokaal)

| | Voor | Na |
|---|---|---|
| Desktop, overdracht (onverkleind, zonder gzip) | 739 KB | 309 KB |
| Desktop, overdracht met gzip | — | 156 KB |
| Afbeeldingen | 575 KB | 32 KB (WebP, incl. Dock-iconen) |
| Externe verzoeken (Google Fonts) | 1 | 0 |
| Mobiel: JS dat wordt geladen | 105 KB | 36 KB (15,5 KB gzip) |
| Lighthouse desktop | — | Perf 99 · A11y 96 · BP 100 · SEO 100 |
| Lighthouse mobiel (simulated 4G) | 72 (vóór CSS/modulepreload-fix) | Perf 89 · A11y 100 · BP 100 · SEO 100 |
| CLS | 0 / 0,02 (mobiel) | 0 |

De resterende toegankelijkheidsmelding (desktop) is `target-size` op de verkeerslichten:
bewust op Apple-maat (12 px, klikdoel 20 px). Op touch-apparaten worden ze 24 px.

## Getest

Automatisch in Chromium (Playwright) tegen een server met dezelfde CSP/gzip als nginx:
vensters (slepen, resizen, zoomen, tegelen, minimaliseren/herstellen, sluiten, z-order,
viewport-resize), Dock, alle menu's met toetsenbord, Spotlight, Quick Look, Finder, Contact,
Instellingen (thema, accent, beweging), Terminal, Launchpad, contextmenu's, reduced motion,
toetsenbord-only gebruik, axe-core in donker/licht/mobiel en alle vijf accenten (0 schendingen),
Lighthouse desktop en mobiel, viewports 1920 / 1600 / 1280 / 1024 / 820 / 390.

**Niet getest:** Firefox en Safari (niet beschikbaar in de testomgeving), echte GPU-framerates,
echte schermlezers (VoiceOver/NVDA). Controleer die handmatig.

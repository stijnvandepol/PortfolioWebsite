# Ontwerp, UX & kwaliteit

Dit is een portfolio dat toevallig als macOS-desktop wordt gepresenteerd — niet andersom.
Prioriteit bij elke beslissing:

1. informatie toegankelijk · 2. navigatie eenvoudig · 3. leesbaarheid · 4. snelheid ·
5. visuele hiërarchie · 6. macOS-realisme · 7. extra interacties

Botst een macOS-effect met een hoger punt, dan wordt het effect aangepast of verwijderd.

## UX-review: wat er mis was en wat er is gedaan

| Bevinding (nulmeting) | Oplossing |
|---|---|
| Home toonde naam en CTA's, maar geen projecten, ervaring of skills; alleen scrollen bracht die naar boven | Home = echte portfolio-homepage: naam, rol, intro, specialisaties, vier CTA's, uitgelichte projecten, skills, ervaring in het kort |
| Navigatie: "Over mij · Ontwikkeling · Portfolio · Websites" — "Ontwikkeling" verborg ervaring, opleiding én skills; "Portfolio" vs "Websites" was verwarrend | Zijbalk met labels: **Home · Projecten · Ervaring · Skills · Opleiding · Contact · CV** |
| Contact en CV alleen als kleine toolbar-knoppen; Contact was een apart venster | Contact en CV zijn pagina's in de zijbalk en knoppen in de toolbar en op Home |
| Skills als percentagebalken (arbitrair) | Skill-groepen met concrete technieken (uit de eigen projecten en ervaring) |
| Projecten: alleen plaatje + Quick Look; live websites stonden op een andere pagina | Eén scanbare lijst (kaart: titel, ondertitel, tags, "Bekijk project") + projectpagina met kruimelpad, links en vorige/volgende |
| Ervaring als samengevoegd tijdlijn-blok | Aparte pagina: functie, organisatie, periode, duur, plaats, werkzaamheden, technologieën |
| Bureaubladicoon vereiste dubbelklik | Eén klik opent |
| Opstartscherm 1,1 s, content verscheen gefaseerd (reveal-animaties) | 0,65 s, één keer per sessie, elke toets/klik slaat over; content is direct zichtbaar |
| Venster 980×620 op elk scherm; smal venster = onleesbare iconen-zijbalk | Venster groeit mee op grote schermen en vult het scherm op laptops/tablets; smal venster → horizontale tabbalk mét labels |
| Geen crawlbare inhoud (lege `<body>` tot JS klaar was), geen OG/JSON-LD | Statische, semantische HTML met alle inhoud + title/description/canonical/OG/Twitter/JSON-LD, `robots.txt`, `sitemap.xml` |
| Geen weg terug als je alle vensters sloot; geen manier om de desktop te vermijden | Hint op leeg bureaublad ("Open Portfolio"); **Eenvoudige weergave** (gewone pagina) via zijbalk, S-menu, Help en Spotlight |
| Mobiel bouwde de pagina met JS | Mobiel = statische HTML (direct leesbaar), tabbalk, geen desktop-JS |

## Tweede ronde: warmer, meer macOS, sneller

Na de UX-ronde voelden Over mij en Ervaring te abstract. Uit het originele ontwerp zijn teruggehaald:
foto met zachte glow, functie als accentpil, e-mail en plaats onder de naam, de persoonlijke
over-mij-tekst direct onder de kop, koppen met accentstreep (en icoon bij Ervaring/Opleiding),
een tijdlijn met gloeiende punten, en kaarten met een zacht verloop die optillen bij hover.
Ervaring en Opleiding staan weer samen op één pagina (de zijbalklink "Opleiding" scrolt ernaartoe);
de navigatie, deep-links en de overige UX-verbeteringen zijn behouden.

- **Logo:** donkere midnight-tegel met een schuine serif-S (Playfair Display Italic, OFL) als vectorpad
  en een blauwe gloed; gebruikt in favicon, Dock, Over-venster en menubalk.
- **macOS-look:** eigen golvend behang (donker en licht, 12–16 KB WebP) en doorschijnender vensterchrome,
  zodat titel- en zijbalken het behang laten doorschemeren; leesvlakken blijven effen.
- **Dock met echte macOS-iconen** (Big Sur-set, zelfde bron als Finder/Terminal): Mail → Contact,
  Foto's → Projecten, Agenda → Ervaring & opleiding (met de datum van vandaag, zoals het echte Dock),
  GitHub met het Octocat-icoon. Volgorde zoals op een Mac: Finder, Launchpad, … Eigen tegels
  (S-logo, LinkedIn) staan op hetzelfde Big Sur-raster (vorm = 80,5 % van het canvas), zodat alles even groot oogt.
- **Sneller:** Finder, Terminal, Instellingen, Spotlight en Launchpad laden pas als ze nodig zijn
  (of stil na het openen van het portfolio). Tooltips hebben geen backdrop-filter meer.

## Liquid Glass (macOS Tahoe)

Gebaseerd op Apple's beschrijving van Liquid Glass (WWDC25, HIG Materials) en Tahoe: glas alleen
voor navigatie en bediening, nooit voor de leesinhoud.

- **Menubalk volledig doorzichtig**: alleen tekst met een zachte schaduw, zoals in Tahoe.
- **Zijbalk als zwevend glaspaneel** onder de verkeerslichten (Portfolio, Finder, Instellingen);
  vensters hebben rondere hoeken (20 px) en de zijbalk een concentrische radius (12 px).
- **Toolbarknoppen in zwevende glascapsules**; knoppen en segmented controls zijn capsules.
- **Lichtrand (specular)**: 1px verlooprand, helder linksboven, zwakker rechtsonder; in het Dock
  volgt de hoogste lichtplek de muis.
- **Breking (lensing) aan de rand van het Dock**: een SVG-verplaatsingskaart (afgeronde rechthoek met bol
  randprofiel) in `backdrop-filter`. Werkt alleen in Chromium; Safari en Firefox tonen gewoon helder glas.
- Menu's en popovers blijven wat dichter (94 %) omdat daar gelezen wordt.
- **Minder transparantie** zet het glas weer ondoorzichtig.
- **Performance**: tijdens slepen of resizen staat de blur onder dat venster uit (dat kostte ~50 % van de
  frames); Dock-hover en slepen lopen op 60 fps.

## Informatiearchitectuur

`Over mij · Projecten (+ projectpagina) · Ervaring (incl. opleiding) · Skills · Contact · CV`

Contact is een contactkaart (e-mail kopiëren/mailen, LinkedIn, GitHub, CV) — bewust geen formulier:
zonder backend kon dat alleen de mail-app van de bezoeker openen en werkte het vaak niet.

Elke pagina heeft een deelbare URL (`#projecten`, `#projecten/snackspot`, `#skills`, …) die in
zowel de desktop- als de eenvoudige weergave werkt. Metaforen worden alleen gebruikt waar ze
de inhoud helpen: Finder voor bestanden en projecten, Mail/Contacten voor contact, Instellingen
voor voorkeuren, Terminal als demonstratie. Alle informatie is óók zonder die apps bereikbaar.

**Progressive disclosure bij projecten:** kaart (titel, ondertitel, tags) → projectpagina
(beschrijving, technologieën, links) → optionele velden `role`, `result`, `details`, `links` in
`config.js` verschijnen automatisch zodra ze zijn ingevuld. Er is niets verzonnen.

## Weergaven

| Weergave | Wanneer | Techniek |
|---|---|---|
| **Desktop** | ≥ 769 px (standaard) | macOS-desktop, dynamisch opgebouwd |
| **Eenvoudig** | ≤ 768 px, of gekozen | statische HTML, normaal scrollen, tabbalk |
| **Zonder JavaScript / zoekmachines** | altijd | dezelfde statische HTML |

De statische HTML wordt gegenereerd uit `config.js` (`node scripts/generate-static.mjs`) en de
Docker-build doet dat automatisch, zodat inhoud nooit uit de pas loopt.

## Leesbaarheid

Contentpagina's: 15 px, regelhoogte ≥ 1,5–1,65, leesbreedte ≤ 72 tekens (~650 px), contrast ≥ 4,5:1
(accentkleuren worden per thema op WCAG berekend). Statische pagina: 16 px. Geen smalle appkolommen:
het portfolio-venster start op 1040 px en groeit tot 1280 px.

## Animatie en scroll

Alleen korte overgangen (80–400 ms) voor venstergedrag, navigatie en focus; geen gefaseerde
content-reveal, geen doorlopende animaties. Vensterinhoud scrolt op zichzelf (`overscroll-behavior:
contain`), de pagina niet; geen scroll-lock bij overlays; geen horizontale scroll.

## Design system (`assets/css/tokens.css`)

Alle componenten gebruiken tokens; geen losse `border-radius`/`box-shadow`/`transition`.

| Onderdeel | Tokens |
|---|---|
| Kleur | `--accent`, `--accent-fill` (vulling ≥ 4.5:1 met tekst), `--accent-text`, `--on-accent`; semantisch: `--text-*`, `--surface*`, `--hairline`, `--separator`, `--window-bg` |
| Materialen | `--material-chrome` < `--material-window` < `--material-popover` < `--material-overlay`, met `--edge` en `--specular` |
| Typografie | SF Pro via `-apple-system`; Inter (zelf gehost, alleen niet-Apple) met metrisch afgestemde fallback |
| Motion | `--dur-*`, `--ease-window`, `--ease-out`, `--ease-in` |
| Z-lagen | `--z-window` … `--z-tooltip` |
| Toegankelijkheid | `prefers-reduced-motion/-transparency/-contrast` + eigen schakelaars |

Glas alleen in de navigatielaag (menubalk, Dock, menu's, zijbalken, overlays); inhoud is effen.
Blauw (`#0A84FF`) is de standaard accentkleur.

## Onderzoek

Apple HIG (Windows, Menus, Menu bar, Dock menus, Sidebars, Materials, Typography, Motion,
Accessibility, Color), WWDC25 (Liquid Glass) en de SwiftUI-animatiedocumentatie; gecontroleerd met
de community-skill `valentinllpz/apple-human-interface-guidelines`. Pixelmaten voor menu's, Dock en
schaduwen publiceert Apple niet; die waarden zijn eigen keuzes. Geen SVG-lensing
(`backdrop-filter: url()`): alleen Chromium en duur.

## Metingen (Chromium, lokaal, met nginx-achtige CSP + gzip)

| | Begin | Na de eerste ronde | Na de UX-ronde |
|---|---|---|---|
| Desktop, overdracht (onverkleind, zonder gzip) | 739 KB | 309 KB | 497 KB¹ |
| Desktop, overdracht met gzip | — | 156 KB | 305 KB¹ |
| Mobiel, overdracht met gzip | — | 178 KB | 190 KB |
| Lighthouse desktop (Perf · A11y · BP · SEO) | — | 99 · 96 · 100 · 100 | **100** · 97 · 100 · 100 |
| Lighthouse mobiel (simulated 4G) | 72 | 89 | **98** · 100 · 100 · 100 |
| Mobiel eerste weergave (FCP) | 4,6 s | 2,8 s | **1,6 s** |
| Desktop: JS tot het venster zichtbaar is | — | — | 51 KB gzip, venster na ~0,3 s (lokaal) |
| CLS | 0 / 0,02 | 0 | 0–0,004 |

¹ De homepage toont nu direct drie uitgelichte projectafbeeldingen (die eerder pas na klikken laadden);
dat is bewust: projecten zijn de belangrijkste inhoud.

## Bruikbaarheidstests (uitgevoerd)

**30-secondentest** (desktop 1440×900, laptop 1280×720, tablet 1024×768, mobiel 390×844):
alle zeven vragen — wie, wat, technische richting, projecten, ervaring, contact, CV — worden in
de eerste viewport beantwoord, zonder klik (7/7 op elk formaat).

**Recruiter-flow** (zonder instructies, klikken geteld): project openen = 1 klik; details lezen,
"Bezoek website" zichtbaar; terug via kruimelpad, Esc of de terugknop; Ervaring, Skills, Opleiding,
Contact en CV = elk 1 klik; deelbare deep-links; Spotlight, Ga-menu en Finder leiden naar dezelfde pagina's.

**Overig:** zonder JavaScript (naam, alle 10 projecten, ervaring, skills, contact crawlbaar; één `h1`,
logische `h2`'s; JSON-LD Person + ItemList), eenvoudige weergave (aan/uit, onthouden), leeg bureaublad
(escape-route), opstart overslaan, scrollgedrag, kleine schermen, smal venster, reduced motion,
toetsenbord, axe-core op alle pagina's in donker/licht/mobiel (0 schendingen), Lighthouse.

**Niet getest:** Firefox en Safari (niet beschikbaar in de testomgeving), echte GPU-framerates,
echte schermlezers (VoiceOver/NVDA). Controleer die handmatig.

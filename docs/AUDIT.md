# Portfolio "macOS Desktop" — Expert Audit & Transformatieplan

> Multidisciplinaire review (Frontend, Staff, UX, Product Design, Accessibility, Performance, Architecture)
> Datum: 2026-06-15 · Scope: volledige `src/` codebase · Status vóór audit: v1 (single-window prototype)

---

## 1. Executive summary

Het portfolio is een **vanilla HTML/CSS/JS** applicatie (geen build-stap, geen framework) die via Nginx wordt geserveerd. Het presenteert zich als een macOS-desktop, maar is in werkelijkheid **één enkel Safari-achtig venster** met een menubar en een dock. De visuele basis is sterk (glass, dock-magnification op exacte `macos-web.app` waarden, boot-animatie, vibrancy), maar het **mist het fundament van een desktop-OS**: er is geen vensterbeheer, geen tweede venster, geen Finder/Terminal/Spotlight, geen filesystem, geen light-mode, en de "apps" in het dock zijn grotendeels dummies.

Daarnaast zijn er structurele zwaktes: één monolitisch `script.js` (673 regels, alle verantwoordelijkheden gemengd), **`innerHTML` met niet-ge-escapete interpolatie** (XSS-pad zodra content dynamisch wordt), geen state-laag, en accessibility die grotendeels ontbreekt (geen focus management, knoppen zonder labels, geen `prefers-reduced-motion`, klikbare `div`'s zonder rol/toetsenbordbediening).

**Conclusie:** de v1 is een mooie *façade*. Om het een geloofwaardig, premium visitekaartje te maken moet de illusie *diep* worden — echte vensters, echte apps, echte interactie — en moet de code naar een modulaire, herbruikbare, toegankelijke architectuur. Dit document beschrijft beide.

---

## 2. Kritieke problemen (P0)

| # | Probleem | Bewijs | Impact |
|---|----------|--------|--------|
| C1 | **Geen vensterbeheer** — slechts 1 hardcoded venster, geen z-order/focus/multi-window | `#main-window` is uniek in `index.html` | Kernbelofte "desktop" wordt niet waargemaakt |
| C2 | **XSS via `innerHTML`** met ongeëscapete data | `renderBlog/Portfolio/Timeline` interpoleren `item.*` direct | Onveilig zodra content uit externe bron/CMS/URL komt |
| C3 | **Dode/dummy interacties** — Finder, Terminal, Agenda, Settings, Mail, traffic-lights doen niets of openen niets | dock `data-dock="finder"` heeft geen handler; `tl-close/minimize/maximize` hebben geen JS | Recruiter klikt → niets gebeurt → geloofwaardigheid weg |
| C4 | **Accessibility-bodem** — geen focus-trap, klikbare `div`'s, geen toetsenbordpaden, geen reduced-motion | menu-items zijn `div`, lightbox niet focus-trapped, zware animaties altijd aan | Onbruikbaar met toetsenbord/screenreader; WCAG-fails |
| C5 | **Monolithische, niet-onderhoudbare JS** | 1 bestand, globale `var`, geen modules/state | Schaalt niet; elke nieuwe app vergroot de spaghetti |
| C6 | **Externe afhankelijkheid voor kern-UI** — dock/tab-iconen laden van `macos-web.app` & GitHub raw | `<img src="https://www.macos-web.app/...">` | Bij offline/down host: kapotte dock; privacy-lek; CLS |

---

## 3. Hoogste-impact verbeteringen (samengevat)

1. **Echte WindowManager** — meerdere vensters, focus/z-order, drag, resize (8 handles), minimize→dock, maximize/restore, snap (helften/kwarten via edge-drag), `⌘W`/`⌘M`.
2. **Echte apps** i.p.v. dummies: Portfolio (Safari), **Terminal** (interactief), **Finder** (fake filesystem + CV), **Instellingen** (light/dark/accent/wallpaper/reduced-motion), **Preview** (Quick Look).
3. **Spotlight** (`⌘Space`) — fuzzy zoeken over apps, pagina's, projecten en acties.
4. **Launchpad** (`F4`) — app-grid met blur-achtergrond.
5. **Light/Dark/Auto** thema via CSS custom properties + `prefers-color-scheme`, persistente voorkeur.
6. **Desktop-iconen** met selectie + dubbelklik-to-open + **Prullenmand**.
7. **Modulaire ES-module architectuur** + reactieve store + ge-escapete rendering (sluit C2).
8. **Accessibility-pass**: rollen, labels, focus-trap, toetsenbordnavigatie, `prefers-reduced-motion`.
9. **Self-hosted assets** — geen externe UI-iconen meer (sluit C6).

---

## 4. UX-verbeteringen

- **Discoverability:** v1 toont nergens dat dingen klikbaar zijn. → Hint-laag bij eerste bezoek ("Druk ⌘Space of dubbelklik een icoon"), dock-tooltips, en een onboarding-notificatie.
- **Frictie:** de enige navigatie is via tabs/menu. → Spotlight + Launchpad + desktop-iconen + dock geven 4 redundante, intuïtieve paden (macOS-conventie).
- **Feedback:** klikken zonder reactie (C3). → Elke actie geeft visuele feedback (dock-bounce, window-open scale, genie-minimize, notificatie).
- **Leerbaarheid:** sneltoetsen waren onzichtbaar. → `⌘Space`, `F4`, `⌘W`, `⌘M`, `⌘,`, `Esc` werken én staan in de menu's met hun symbolen.
- **Gebruikersflow recruiter:** boot → desktop → "Over Mij" opent automatisch → dock nodigt uit → CV downloadbaar in Finder → contact via Mail/Terminal `contact`.

---

## 5. UI / Visual design-verbeteringen

- **Typografie:** consistente type-scale via tokens (`--text-xs … --text-3xl`), `-apple-system` stack behouden, betere line-heights.
- **Diepte:** vensters krijgen echte focus-states (gefocust = sterke schaduw + heldere rand; onscherp = vlakker + gedimde traffic-lights, zoals echte macOS).
- **Light mode:** volledige tweede thema-set; vibrancy/glass werkt in beide.
- **Consistentie:** alle radii/spacing/kleuren via tokens; geen magic numbers in componenten.
- **Iconografie:** self-hosted SVG/inline icon-set i.p.v. externe webp's.

---

## 6. Architectuurverbeteringen

**Van:** `index.html` (462) + `style.css` (797) + `script.js` (673, monoliet) + `config.js`.

**Naar:** modulaire ES-modules met heldere lagen:

```
src/assets/js/
  main.js                 # bootstrap/compositie
  data/config.js          # content (export)
  core/
    store.js              # reactieve pub/sub state
    dom.js                # el(), escapeHtml(), focus-trap, helpers
    shortcuts.js          # globale keymap
    theme.js              # light/dark/auto + accent + reduced-motion
  os/
    windowManager.js      # vensters: create/focus/drag/resize/snap/min/max
    dock.js               # magnification + running state + launch
    menubar.js            # dynamische app-menu's + control center + klok
    spotlight.js          # ⌘Space zoeken
    launchpad.js          # app-grid
    desktop.js            # wallpaper, icons, selectie, prullenmand
    notifications.js      # notification center
    contextmenu.js        # herbruikbaar rechtsklik-menu
  apps/
    registry.js           # app-definities (id, naam, icoon, factory)
    portfolio.js          # Safari-achtige content (Over Mij/Ontwikkeling/…)
    terminal.js           # interactieve shell
    finder.js             # fake filesystem + CV
    settings.js           # voorkeuren
    preview.js            # Quick Look afbeeldingen
```

Principes: **single responsibility** per module, **lage coupling** via de store + events, **herbruikbare** window-chrome (één `createWindow`), **geen prop drilling** (store i.p.v. doorgeven).

---

## 7. Performanceverbeteringen

- **Geen layout thrash in dock:** transform/scale i.p.v. width/height-animatie waar mogelijk; rAF-gedreven (al aanwezig, behouden + opgeschoond).
- **`content-visibility`/lazy:** afbeeldingen `loading="lazy"` (behouden) + `decoding="async"`; zware blur-lagen alleen op gefocuste vensters.
- **Reduced motion:** schakelt drift/spin/blur-animaties uit (perf + a11y).
- **Self-hosted iconen:** elimineert 12+ externe requests en CLS.
- **Event-delegation** i.p.v. N listeners; rAF-throttle op resize/drag.

---

## 8. Accessibilityverbeteringen (WCAG 2.2 AA-gericht)

- Semantiek: menu's/dock/iconen als `button`/`[role=…]` met `aria-label`.
- Focus management: focus-trap in Spotlight/Launchpad/Preview; focus terug naar opener bij sluiten.
- Toetsenbord: volledige bediening (Tab/Enter/Esc/pijlen), zichtbare focus-ring.
- `prefers-reduced-motion`: alle niet-essentiële animaties uit.
- Contrast: tekstkleuren getoetst; light-mode met voldoende ratio.
- Screenreader: live-region voor notificaties; `aria-hidden` op puur decoratieve lagen.

---

## 9. Securityverbeteringen

- **`escapeHtml()`** op alle dynamische interpolatie (sluit C2).
- `rel="noopener noreferrer"` op alle `target=_blank`/`window.open`.
- Geen externe UI-assets (minder supply-chain/privacy-oppervlak).
- `Content-Security-Policy` aanbevolen in Nginx (zie §13).

---

## 10. Nieuwe aanbevolen features

Geïmplementeerd in deze ronde: **WindowManager, Terminal, Finder, Instellingen, Spotlight, Launchpad, desktop-iconen, prullenmand, light/dark, notificaties, control center.**

Verdere aanraders (roadmap): Mission Control (exposé), echte window-snapping previews, Notitie-app met markdown, Agenda met echte datum, "Sleep/Wake" lock-screen, widgets-paneel, en een mini-Safari die de echte site in een iframe toont.

---

## 11–12. Concrete code & refactors

Zie de daadwerkelijke implementatie in `src/assets/js/**` (modules) en `src/assets/css/**`. Kernpatronen:

- `escapeHtml` + `el()` builder vervangen rauwe `innerHTML`-strings.
- `createWindow(app)` levert herbruikbare chrome; apps leveren alleen content + menu's.
- `store.subscribe(...)` voor reactieve UI (thema, actief venster, running apps).

## 13. Prioriteitenlijst (impact-gesorteerd)

1. WindowManager + echte apps (C1, C3) — **done**
2. Modulaire architectuur + ge-escapete rendering (C5, C2) — **done**
3. Spotlight/Launchpad/desktop-iconen (UX) — **done**
4. Light/Dark + tokens (UI) — **done**
5. Accessibility-pass (C4) — **done**
6. Self-hosted assets (C6) — **deels** (inline SVG-iconenset)
7. Nginx CSP + caching headers — **aanbevolen** (config hieronder)
8. Mission Control / widgets / lock-screen — **roadmap**

### Aanbevolen `nginx.conf` hardening (roadmap)
```nginx
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'" always;
add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
location ~* \.(css|js|png|svg|webp|woff2)$ { expires 30d; add_header Cache-Control "public, immutable"; }
```

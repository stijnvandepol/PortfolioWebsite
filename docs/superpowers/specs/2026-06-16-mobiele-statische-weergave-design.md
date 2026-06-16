# Ontwerp: aparte statische mobiele weergave (geen macOS)

> Status: goedgekeurd ontwerp · Datum: 2026-06-16
> Scope: nieuwe mobiele weergave naast de bestaande macOS-desktop. Desktop blijft ongewijzigd.

## 1. Doel

Mobiele bezoekers (≤768px) krijgen géén macOS-desktop maar een **schone, statische, goed
leesbare één-pagina-portfolio**. De macOS-illusie is gebouwd voor muis/hover/vensters en voelt op
touch rommelig — precies de oorspronkelijke klacht. Op desktop blijft de volledige OS-ervaring.

## 2. Beslissingen (door eigenaar bevestigd)

- **Breakpoint:** ≤ 768px → statische mobiele weergave; > 768px → macOS-desktop.
- **Geen escape-hatch:** mobiel is altijd statisch; geen "probeer toch de OS"-link.
- **Notice:** een balk bovenaan: "💻 Voor de volledige interactieve macOS-ervaring, open op desktop."
- **Eén bron van waarheid:** content komt uit `data/config.js` (zelfde data als desktop), veilig
  ge-escaped via de bestaande `el()`/`escapeHtml`-helpers.

## 3. Aanpak

Bij boot beslist `main.js` op basis van `window.matchMedia('(max-width: 768px)')`:
- **Mobiel:** boot de OS **niet** (geen windowManager/dock/menubar/desktop draait). Zet een
  `mobile-mode`-class op `<html>` (verbergt boot-scherm + `.desktop` en zet scrollen aan via CSS) en
  render de statische pagina. De OS-laag wordt niet uitgevoerd (modules worden via de huidige
  statische imports nog wel meegeladen; een dynamic-import-optimalisatie kan later).
- **Desktop:** huidige `boot()` ongewijzigd.

> De keuze valt bij het laden. Bij live resizen over de grens wisselt de weergave pas na herladen —
> bewuste, eenvoudige keuze (geen reload-lussen).

## 4. Opbouw mobiele pagina (boven → onder)

1. **Notice-balk** (sticky boven): desktop-aanbeveling.
2. **Hero:** foto (`portret.png`), naam, rol, contact (mail/locatie), 2 knoppen die naar secties
   scrollen (Projecten / CV).
3. **Over mij:** about-tekst.
4. **Projecten:** kaarten uit `CONFIG.projects` (afbeelding, titel, tags).
5. **Ontwikkeling / CV:** opleiding, ervaring, vaardigheden (`CONFIG.opleiding/ervaring/vaardigheden`).
6. **Blog/links:** `CONFIG.blog` (externe links).
7. **Contact/social:** GitHub, LinkedIn, Instagram (uit `CONFIG.profile`).

Stijl: schoon, ruime witruimte, sterke typografie, respecteert light/dark via bestaande tokens.
Géén dock/menubar/vensters. Mobiel-first, één kolom.

## 5. Betrokken bestanden

- `src/assets/js/os/mobile.js` — **nieuw**. `initMobile(root)` rendert de statische pagina uit CONFIG.
- `src/assets/js/main.js` — boot-gating (mobiel vs desktop).
- `src/assets/css/mobile.css` — **nieuw**. Styling voor `.m-*` mobiele componenten.
- `src/index.html` — `mobile.css` linken; `mobile-mode` verbergt boot/desktop.

## 6. Succescriteria

1. ≤768px: geen dock/menubar/vensters; een leesbare verticale portfolio met alle content.
2. Notice-balk zichtbaar met desktop-aanbeveling.
3. >768px: macOS-ervaring exact als nu (geen regressie).
4. Light/dark werkt in beide.
5. Geen console-fouten; geen horizontale overflow op 390px.

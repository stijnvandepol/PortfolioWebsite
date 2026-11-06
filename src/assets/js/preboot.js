// Draait synchroon vóór de eerste paint (klassiek script, CSP-vriendelijk).
// Bepaalt de weergave:
//   is-simple  → gewone, snelle portfolio-pagina (mobiel, of gekozen via "eenvoudige weergave")
//   is-desktop → interactieve macOS-desktop
// Zonder JavaScript krijgt <html> geen klasse en blijft de statische pagina zichtbaar.
(function () {
  var r = document.documentElement;
  // Taal (zelfde regel als core/i18n.js): bewaarde keuze, anders de eerste nl- of en-taal van de browser.
  try {
    var lang = null;
    try { lang = JSON.parse(localStorage.getItem('svdp.prefs') || '{}').lang; } catch (e) { /* opslag geblokkeerd */ }
    if (lang !== 'nl' && lang !== 'en') {
      lang = 'en';
      var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
      for (var i = 0; i < list.length; i++) { var base = String(list[i]).toLowerCase().split('-')[0]; if (base === 'nl' || base === 'en') { lang = base; break; } }
    }
    r.lang = lang;
  } catch (e) { /* blijft nl */ }
  try {
    var narrow = window.matchMedia('(max-width: 768px)').matches;
    var chosen = null;
    try { chosen = localStorage.getItem('svdp.view'); } catch (e) { /* opslag geblokkeerd */ }
    if (/[?&]view=simple\b/.test(location.search)) chosen = 'simple';
    var simple = narrow || chosen === 'simple';
    r.classList.add(simple ? 'is-simple' : 'is-desktop');
    if (simple) return;
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var prefs = {};
    try { prefs = JSON.parse(localStorage.getItem('svdp.prefs') || '{}'); } catch (e) { /* kapotte JSON */ }
    var booted = false;
    try { booted = !!localStorage.getItem('svdp.booted'); } catch (e) { /* opslag geblokkeerd */ }
    // Opstartscherm alleen bij het allereerste bezoek (onthouden), nooit bij diepe links.
    if (reduce || prefs.reducedMotion === true || booted || location.hash.length > 1) r.classList.add('no-boot');
  } catch (e) { r.classList.add('is-desktop'); }
})();

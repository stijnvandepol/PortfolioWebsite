// Draait synchroon vóór de eerste paint (klassiek script, CSP-vriendelijk):
// bepaalt of het opstartscherm getoond wordt en of dit de mobiele weergave is.
(function () {
  var r = document.documentElement;
  try {
    if (window.matchMedia('(max-width: 768px)').matches) r.classList.add('is-mobile');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var prefs = JSON.parse(localStorage.getItem('svdp.prefs') || '{}');
    if (reduce || prefs.reducedMotion === true || sessionStorage.getItem('svdp.booted')) r.classList.add('no-boot');
  } catch (e) { /* opslag geblokkeerd: gewoon booten */ }
})();

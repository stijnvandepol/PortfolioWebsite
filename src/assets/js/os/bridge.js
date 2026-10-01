// ============================================================
// os/bridge.js — late-bound OS-API
// Voorkomt circulaire imports tussen apps en het OS.
// main.js vult deze in tijdens bootstrap.
// ============================================================
export const os = {
  open: (_appId, _opts) => {},        // open een (nieuw) venster / navigeer een singleton
  activate: (_appId) => {},           // Dock-klik: focus bestaand venster, anders openen
  focusWindow: (_winId) => {},        // breng venster naar voren (herstelt uit het Dock)
  closeApp: (_appId) => {},           // sluit alle vensters van een app
  openExternal: (_url) => {},         // veilige externe link (https/mailto/tel)
  openFile: (_url) => {},             // bestand van deze site (bv. CV) in nieuw tabblad
  notify: (_opts) => {},              // notificatie tonen
  setTheme: (_t) => {},               // 'light' | 'dark' | 'auto'
  toggleSpotlight: () => {},
  toggleLaunchpad: () => {},
  listApps: () => [],                 // [{id,title}]
  preview: (_opts) => {},             // Quick Look afbeelding
};

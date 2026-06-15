// ============================================================
// os/bridge.js — late-bound OS-API
// Voorkomt circulaire imports tussen apps en het OS.
// main.js vult deze in tijdens bootstrap.
// ============================================================
export const os = {
  open: (_appId, _opts) => {},        // open/focus een app op id
  openExternal: (_url) => {},         // veilige externe link
  notify: (_opts) => {},              // notificatie tonen
  setTheme: (_t) => {},               // 'light' | 'dark' | 'auto'
  toggleSpotlight: () => {},
  toggleLaunchpad: () => {},
  listApps: () => [],                 // [{id,title}]
  preview: (_opts) => {},             // Quick Look afbeelding
};

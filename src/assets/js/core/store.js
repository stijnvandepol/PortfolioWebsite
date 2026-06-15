// ============================================================
// core/store.js — minimale reactieve state-container
// Pub/sub i.p.v. prop drilling of globale vars.
// ============================================================

export function createStore(initial = {}) {
  let state = { ...initial };
  const subscribers = new Set();
  const keyed = new Map(); // key -> Set<fn>

  function notify(changedKeys) {
    subscribers.forEach((fn) => fn(state));
    changedKeys.forEach((key) => {
      const set = keyed.get(key);
      if (set) set.forEach((fn) => fn(state[key], state));
    });
  }

  return {
    get: (key) => (key ? state[key] : state),
    set(patch) {
      const changed = [];
      for (const [k, v] of Object.entries(patch)) {
        if (state[k] !== v) {
          state[k] = v;
          changed.push(k);
        }
      }
      if (changed.length) notify(changed);
    },
    /** Abonneer op elke wijziging. */
    subscribe(fn) {
      subscribers.add(fn);
      return () => subscribers.delete(fn);
    },
    /** Abonneer op één key. */
    on(key, fn) {
      if (!keyed.has(key)) keyed.set(key, new Set());
      keyed.get(key).add(fn);
      return () => keyed.get(key)?.delete(fn);
    },
  };
}

// Globale OS-state.
export const store = createStore({
  theme: 'dark',        // 'light' | 'dark' | 'auto'
  accent: 'green',
  reducedMotion: false,
  activeWindowId: null, // id van het gefocuste venster
  windows: [],          // [{ id, appId, title, minimized }]
  runningApps: [],      // [appId]
  booted: false,
});

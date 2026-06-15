// ============================================================
// core/dom.js — kleine, veilige DOM-helpers
// Vervangt rauwe innerHTML-strings door veilige builders.
// ============================================================

/** Escape user/content data before it ever touches innerHTML (sluit XSS-pad C2). */
export function escapeHtml(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Tagged template die alle ${...} interpolaties automatisch escapet. Gebruik h.raw(...) voor vertrouwde markup. */
export function h(strings, ...values) {
  return strings.reduce((out, str, i) => {
    if (i === 0) return str;
    const v = values[i - 1];
    const safe = v && v.__raw ? v.value : escapeHtml(v);
    return out + safe + str;
  }, '');
}
h.raw = (value) => ({ __raw: true, value: String(value) });

/** Beknopte element-factory. */
export function el(tag, props = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, val] of Object.entries(props)) {
    if (val == null || val === false) continue;
    if (key === 'class') node.className = val;
    else if (key === 'dataset') Object.assign(node.dataset, val);
    else if (key === 'style' && typeof val === 'object') Object.assign(node.style, val);
    else if (key === 'html') node.innerHTML = val; // alleen voor vertrouwde, samengestelde markup
    else if (key === 'text') node.textContent = val;
    else if (key.startsWith('on') && typeof val === 'function') {
      node.addEventListener(key.slice(2).toLowerCase(), val);
    } else if (key in node && key !== 'list') {
      try { node[key] = val; } catch { node.setAttribute(key, val); }
    } else {
      node.setAttribute(key, val);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.append(child.nodeType ? child : document.createTextNode(child));
  }
  return node;
}

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/** addEventListener met cleanup-functie. */
export function on(target, type, handler, opts) {
  target.addEventListener(type, handler, opts);
  return () => target.removeEventListener(type, handler, opts);
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Houd focus binnen een container (modals: Spotlight, Launchpad, Preview).
 * Retourneert een release()-functie die focus terugzet naar de opener.
 */
export function trapFocus(container, { initial } = {}) {
  const opener = document.activeElement;
  const selector =
    'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusables = () => qsa(selector, container).filter((n) => n.offsetParent !== null);

  function onKey(e) {
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  container.addEventListener('keydown', onKey);
  (initial || focusables()[0] || container).focus?.({ preventScroll: true });

  return () => {
    container.removeEventListener('keydown', onKey);
    if (opener && typeof opener.focus === 'function') opener.focus({ preventScroll: true });
  };
}

/** rAF-gethrottelde wrapper voor high-frequency handlers (drag/resize/mousemove). */
export function rafThrottle(fn) {
  let scheduled = false;
  let lastArgs;
  return function (...args) {
    lastArgs = args;
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      fn.apply(this, lastArgs);
    });
  };
}

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

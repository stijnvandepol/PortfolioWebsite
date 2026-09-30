// ============================================================
// os/glass.js — breking (lensing) aan de rand van het Dock-glas
//
// Liquid Glass buigt licht aan de randen. Op het web kan dat alleen in
// Chromium (SVG-filter in backdrop-filter). Safari/Firefox houden het
// gewone glas uit glass.css. We bouwen één verplaatsingskaart voor de
// rustmaat van het Dock (afgeronde rechthoek, bol profiel in de rand);
// tijdens de magnificatie rekt die mee (preserveAspectRatio="none").
// ============================================================
import { prefersReducedMotion } from '../core/dom.js';

const NS = 'http://www.w3.org/2000/svg';
const isChromium = () => !!navigator.userAgentData?.brands?.some((b) => /Chromium/.test(b.brand));

/** RGB-kaart: R/G = verschuiving in x/y (128 = geen), alleen binnen de rand (bezel). */
function displacementMap(W, H, radius, bezel) {
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(W, H);
  const d = img.data;
  const hw = W / 2, hh = H / 2, r = Math.min(radius, hw, hh);
  const sdf = (x, y) => {
    const qx = Math.abs(x) - hw + r, qy = Math.abs(y) - hh + r;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const i = (py * W + px) * 4;
      const x = px - hw + 0.5, y = py - hh + 0.5;
      const dist = -sdf(x, y);
      let vx = 0, vy = 0;
      if (dist >= 0 && dist < bezel) {
        // normaal via gradiënt van de afstandsfunctie
        const gx = sdf(x + 0.5, y) - sdf(x - 0.5, y), gy = sdf(x, y + 0.5) - sdf(x, y - 0.5);
        const len = Math.hypot(gx, gy) || 1;
        const t = 1 - dist / bezel;          // 1 aan de rand → 0 binnenin
        const s = t * t * (3 - 2 * t);       // zacht, bol profiel
        vx = (gx / len) * s; vy = (gy / len) * s; // naar buiten wijzend: rand toont wat dichter bij het midden ligt (lens)
      }
      d[i] = Math.round(128 + vx * 127);
      d[i + 1] = Math.round(128 + vy * 127);
      d[i + 2] = 128; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c.toDataURL('image/png');
}

export function initDockGlass(dockEl) {
  if (!dockEl || !isChromium()) return;
  const host = dockEl.querySelector('.dock-el');
  if (!host) return;
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  document.body.append(svg);

  let lastKey = '';
  const build = () => {
    const rect = host.getBoundingClientRect();
    const W = Math.round(rect.width), H = Math.round(rect.height);
    if (W < 40 || H < 20) return;
    const key = `${W}x${H}`;
    if (key === lastKey) return;
    lastKey = key;
    svg.innerHTML = `<filter id="dock-lens" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
      <feImage href="${displacementMap(W, H, 26, 16)}" x="0" y="0" width="${W}" height="${H}" preserveAspectRatio="none" result="map"/>
      <feDisplacementMap in="SourceGraphic" in2="map" scale="34" xChannelSelector="R" yChannelSelector="G"/>
    </filter>`;
    host.style.setProperty('--dock-bf', 'blur(6px) url(#dock-lens) saturate(180%) brightness(1.06)');
  };
  build();
  // Alleen opnieuw bouwen als het Dock in rust van maat verandert (niet tijdens magnificatie).
  let t;
  new ResizeObserver(() => { clearTimeout(t); t = setTimeout(build, 250); }).observe(host);

  // Lichtrand volgt de muis (zoals de specular highlights van Liquid Glass).
  if (!prefersReducedMotion()) {
    host.addEventListener('pointermove', (e) => {
      const r = host.getBoundingClientRect();
      host.style.setProperty('--mx', `${Math.round(e.clientX - r.left)}px`);
    });
    host.addEventListener('pointerleave', () => host.style.removeProperty('--mx'));
  }
}

#!/usr/bin/env node
// ============================================================
// scripts/check-i18n.mjs: controleert de Engelse woordenboeken (src/assets/js/i18n/en-*.js).
//   - elke letterlijke t('…'), tc('ctx', '…') en tr('…') in de code heeft een vertaling
//   - geen sleutel staat in twee woordenboeken met een verschillende vertaling
// Sleutels die via een variabele worden opgevraagd (t(naam)) kan dit script niet zien.
// Gebruik: node scripts/check-i18n.mjs (faalt bij ontbrekende of botsende vertalingen)
// ============================================================
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dictDir = join(root, 'src/assets/js/i18n');
const dicts = {};
for (const f of readdirSync(dictDir).filter((f) => f.endsWith('.js'))) dicts[f] = (await import(pathToFileURL(join(dictDir, f)).href)).default;

const errors = [];
const all = {};
for (const [file, d] of Object.entries(dicts)) {
  for (const [k, v] of Object.entries(d)) {
    if (k in all && all[k].v !== v) errors.push(`botsing: '${k}' is '${all[k].v}' in ${all[k].file} en '${v}' in ${file}`);
    all[k] = { v, file };
  }
}

const files = [];
const walk = (dir) => readdirSync(dir).forEach((n) => { const p = join(dir, n); if (statSync(p).isDirectory()) walk(p); else if (/\.m?js$/.test(n)) files.push(p); });
walk(join(root, 'src/assets/js'));
files.push(join(root, 'scripts/generate-static.mjs'));

// Letterlijke string tussen enkele of dubbele quotes (twee groepen: één per soort quote).
const str = `(?:'((?:[^'\\\\]|\\\\.)*)'|"((?:[^"\\\\]|\\\\.)*)")`;
const unq = (s) => s.replace(/\\(['"])/g, '$1');
let count = 0;
for (const f of files) {
  if (f.startsWith(dictDir)) continue;
  const src = readFileSync(f, 'utf8').replace(/^\s*\/\/.*$/gm, ''); // commentaar overslaan
  const rel = f.slice(root.length + 1);
  for (const m of src.matchAll(new RegExp(`\\b(?:t|tr)\\(${str}`, 'g'))) {
    count++;
    const key = unq(m[1] ?? m[2]);
    if (!(key in all)) errors.push(`ontbreekt: '${key}' (${rel})`);
  }
  for (const m of src.matchAll(new RegExp(`\\btc\\(${str},\\s*${str}`, 'g'))) {
    count++;
    const ctx = unq(m[1] ?? m[2]), key = unq(m[3] ?? m[4]);
    if (!(`${ctx}|${key}` in all) && !(key in all)) errors.push(`ontbreekt: '${ctx}|${key}' (${rel})`);
  }
}

if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`i18n in orde: ${count} vertaalde teksten, ${Object.keys(all).length} sleutels`);

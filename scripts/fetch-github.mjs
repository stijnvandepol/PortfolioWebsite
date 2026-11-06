// ============================================================
// scripts/fetch-github.mjs: haalt de GitHub-contributions van het afgelopen jaar op
// en schrijft ze naar src/assets/data/github.json (de Skills-pagina tekent daar de grafiek uit).
//
// Met GITHUB_TOKEN (in de workflow): GitHub GraphQL API. Zonder token (lokaal):
// de publieke github-contributions-api. Privé-contributions tellen alleen mee als
// "Include private contributions" op het GitHub-profiel aan staat.
// Mislukt het ophalen, dan blijft het oude bestand staan en faalt de build niet.
// ============================================================
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'src/assets/data/github.json');
const { CONFIG } = await import(pathToFileURL(resolve(root, 'src/assets/js/data/config.js')).href);
const login = new URL(CONFIG.profile.github).pathname.split('/').filter(Boolean)[0];

const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function viaGraphQL(token) {
  const query = `query($login: String!) { user(login: $login) { contributionsCollection { contributionCalendar {
    totalContributions weeks { contributionDays { date contributionCount contributionLevel } } } } } }`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'portfolio-build' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  const cal = json?.data?.user?.contributionsCollection?.contributionCalendar;
  if (!res.ok || !cal) throw new Error(`GraphQL: ${res.status} ${JSON.stringify(json?.errors ?? '')}`);
  return {
    total: cal.totalContributions,
    days: cal.weeks.flatMap((w) => w.contributionDays).map((d) => ({ date: d.date, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 })),
  };
}

async function viaPublicApi() {
  const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${login}?y=last`);
  if (!res.ok) throw new Error(`publieke API: ${res.status}`);
  const json = await res.json();
  return { total: json.total.lastYear, days: json.contributions.map((d) => ({ date: d.date, count: d.count, level: d.level })) };
}

try {
  const token = process.env.GITHUB_TOKEN;
  let data;
  try { data = token ? await viaGraphQL(token) : await viaPublicApi(); }
  catch (err) { if (!token) throw err; console.warn(`${err.message}, val terug op de publieke API`); data = await viaPublicApi(); }
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify({ login, updated: new Date().toISOString().slice(0, 10), ...data }) + '\n');
  console.log(`GitHub-contributions van ${login} opgehaald: ${data.total} in het afgelopen jaar (${data.days.length} dagen)`);
} catch (err) {
  console.warn(`GitHub-contributions niet opgehaald (${err.message}); bestaand bestand blijft staan.`);
}

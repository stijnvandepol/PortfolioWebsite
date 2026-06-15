// ============================================================
// apps/terminal.js — interactieve shell
// ============================================================
import { el, escapeHtml } from '../core/dom.js';
import { CONFIG } from '../data/config.js';
import { APP_ICONS } from './icons.js';
import { os } from '../os/bridge.js';

const FS = {
  'about.txt': () => `${CONFIG.profile.name}\n${CONFIG.profile.role}\n${CONFIG.profile.location}`,
  'contact.txt': () => `email:    ${CONFIG.profile.email}\ngithub:   ${CONFIG.profile.github}\nlinkedin: ${CONFIG.profile.linkedin}`,
  'cv.pdf': () => '(binair) — open de Finder om het cv te bekijken/downloaden.',
};

export function createTerminalApp() {
  return {
    id: 'terminal',
    title: 'Terminal — stijn@portfolio',
    icon: APP_ICONS.terminal,
    width: 680, height: 440, minWidth: 380, minHeight: 240,
    singleton: false,
    mount({ titlebar, body }) {
      titlebar.append(el('span', { class: 'win-title', text: 'stijn — -zsh' }));
      body.classList.add('term-body');

      const out = el('div', { class: 'term-out' });
      const prompt = () => el('span', { class: 'term-prompt', html: '<span class="tp-user">stijn@portfolio</span>:<span class="tp-path">~</span>$&nbsp;' });
      const input = el('input', { class: 'term-input', type: 'text', autocomplete: 'off', autocapitalize: 'off', spellcheck: false, 'aria-label': 'Terminal invoer' });
      const line = el('div', { class: 'term-line' }, [prompt(), input]);
      body.append(out, line);
      body.addEventListener('click', () => input.focus());

      const history = [];
      let hIdx = -1;

      function print(text, cls) { out.append(el('div', { class: `term-row ${cls || ''}`, html: text })); body.scrollTop = body.scrollHeight; }
      function printPrompt(cmd) { out.append(el('div', { class: 'term-row' }, [prompt(), el('span', { text: cmd })])); }

      const commands = {
        help: () => print([
          'Beschikbare commando\'s:',
          '  about        korte bio', '  whoami       wie ben ik', '  projects     portfolio-projecten',
          '  skills       vaardigheden', '  experience   werkervaring', '  education    opleiding',
          '  contact      contactgegevens', '  social       sociale links', '  ls           bestanden',
          '  cat <file>   toon bestand', '  open <app>   open een app (finder, portfolio, settings)',
          '  theme <t>    light|dark|auto', '  neofetch     systeeminfo', '  clear        leeg scherm', '  help         deze lijst',
        ].map(escapeHtml).join('<br>')),
        about: () => print(escapeHtml(FS['about.txt']()).replace(/\n/g, '<br>')),
        whoami: () => print('stijn'),
        projects: () => print(CONFIG.projects.map((p) => `• <span class="t-accent">${escapeHtml(p.title)}</span> — ${escapeHtml(p.tags)}`).join('<br>')),
        skills: () => print(CONFIG.vaardigheden.map((s) => {
          const filled = Math.round(s.value / 5);
          return `${escapeHtml(s.name).padEnd(20)} <span class="t-accent">${'█'.repeat(filled)}</span>${'░'.repeat(20 - filled)} ${s.value}%`;
        }).join('<br>')),
        experience: () => print(CONFIG.ervaring.map((e) => `<span class="t-accent">${escapeHtml(e.title)}</span><br>  ${escapeHtml(e.date)}`).join('<br>')),
        education: () => print(CONFIG.opleiding.map((e) => `<span class="t-accent">${escapeHtml(e.title)}</span><br>  ${escapeHtml(e.date)}`).join('<br>')),
        contact: () => print(escapeHtml(FS['contact.txt']()).replace(/\n/g, '<br>')),
        social: () => { print('GitHub · LinkedIn · Instagram — links geopend.'); os.openExternal(CONFIG.profile.github); },
        ls: () => print(Object.keys(FS).map((f) => `<span class="t-file">${escapeHtml(f)}</span>`).join('&nbsp;&nbsp;')),
        cat: (arg) => { if (!arg) return print('cat: ontbrekend bestand', 'term-err'); const f = FS[arg]; if (!f) return print(`cat: ${escapeHtml(arg)}: bestaat niet`, 'term-err'); print(escapeHtml(f()).replace(/\n/g, '<br>')); },
        open: (arg) => { const apps = os.listApps().map((a) => a.id); if (!arg) return print('open: geef een app, bv. open finder', 'term-err'); if (!apps.includes(arg)) return print(`open: onbekende app '${escapeHtml(arg)}'`, 'term-err'); os.open(arg); print(`'${escapeHtml(arg)}' geopend.`); },
        theme: (arg) => { if (!['light', 'dark', 'auto'].includes(arg)) return print('theme: gebruik light|dark|auto', 'term-err'); os.setTheme(arg); print(`thema → ${arg}`); },
        clear: () => { out.replaceChildren(); },
        echo: (...a) => print(escapeHtml(a.join(' '))),
        date: () => print(escapeHtml(new Date().toString())),
        sudo: () => print('stijn is niet in het sudoers-bestand. Dit incident wordt gerapporteerd. 🙂', 'term-err'),
        neofetch: () => print(neofetch(), 'term-fetch'),
      };
      commands['--help'] = commands.help;

      function run(raw) {
        const cmd = raw.trim();
        printPrompt(cmd);
        if (!cmd) return;
        history.unshift(cmd); hIdx = -1;
        const [name, ...args] = cmd.split(/\s+/);
        const fn = commands[name.toLowerCase()];
        if (fn) fn(...args);
        else print(`zsh: command not found: ${escapeHtml(name)} — typ <span class="t-accent">help</span>`, 'term-err');
      }

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { run(input.value); input.value = ''; }
        else if (e.key === 'ArrowUp') { if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } e.preventDefault(); }
        else if (e.key === 'ArrowDown') { if (hIdx > 0) { hIdx--; input.value = history[hIdx]; } else { hIdx = -1; input.value = ''; } e.preventDefault(); }
        else if (e.key === 'l' && (e.ctrlKey)) { commands.clear(); e.preventDefault(); }
      });

      print('Welkom bij <span class="t-accent">portfolio-os</span> — typ <span class="t-accent">help</span> voor commando\'s.', 'term-welcome');
      commands.neofetch();
      setTimeout(() => input.focus(), 50);

      return { onFocus: () => input.focus() };
    },
  };
}

function neofetch() {
  const logo = ['   ____', '  / __/_  __', ' _\\ \\/ |/ /', '/___/|___/'].map(escapeHtml);
  const info = [
    '<span class="t-accent">stijn</span>@portfolio',
    '-----------------',
    `<span class="t-accent">OS</span>: Portfolio OS 5.0`,
    `<span class="t-accent">Host</span>: stijnvandepol.nl`,
    `<span class="t-accent">Shell</span>: zsh`,
    `<span class="t-accent">Role</span>: ${escapeHtml(CONFIG.profile.role)}`,
    `<span class="t-accent">Uptime</span>: always learning`,
  ];
  let rows = '';
  for (let i = 0; i < Math.max(logo.length, info.length); i++) {
    rows += `<span class="t-accent" style="display:inline-block;width:11ch">${logo[i] || ''}</span>${info[i] || ''}<br>`;
  }
  return rows;
}

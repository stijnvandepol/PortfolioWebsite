// ============================================================
// data/config.js — content (single source of truth)
// Pas hieronder je gegevens aan; de UI rendert automatisch.
// ============================================================

export const CONFIG = {
  profile: {
    name: 'Stijn van de Pol',
    role: 'Student IT Infrastructure & Cybersecurity',
    email: 'Stijnvdpol@outlook.com',
    location: 'Landhorst, Noord-Brabant',
    github: 'https://github.com/stijnvandepol',
    linkedin: 'https://www.linkedin.com/in/stijnvandepol/',
    instagram: 'https://www.instagram.com/stijnvdpol/',
    cv: './assets/files/cv.pdf',
  },

  opleiding: [
    { title: 'Fontys Hogeschool – HBO-ICT', date: '2023 — 2027', text: 'Profiel Infrastructure → specialisatie Cybersecurity.' },
    { title: 'Koning Willem I College – MBO4 ICT-beheer', date: '2020 — 2023', text: 'IT-beheer, netwerk en support.' },
  ],

  ervaring: [
    { title: 'Projectstage – Verweijen ICT', date: 'sep. 2025 — jan. 2026 · 5 mnd · Mill', text: 'Onderzoek naar AI en low-code in het Microsoft Power Platform; adviesrapport voor een nieuwe dienst gepresenteerd. Automatiseringen uitgerold met Power Automate, Power Apps en Copilot Studio.' },
    { title: 'Teamleider – Jumbo', date: 'feb. 2025 — heden · Mill', text: 'Aansturen van de vulploeg en eindverantwoordelijk voor de winkel.' },
    { title: 'Stagiair IT – Vanboxtel', date: 'feb. 2023 — jun. 2023 · 5 mnd · Boekel', text: 'Firewalls en switches geconfigureerd en vervangen bij klanten op locatie. Netwerkontwerp opgesteld en bestaande klantomgevingen bijgewerkt en beveiligd.' },
    { title: 'Stagiair IT – Verweijen ICT', date: 'sep. 2021 — jan. 2022 · 5 mnd · Mill', text: 'Werkplekken, access points en telefonie geconfigureerd en op locatie uitgeleverd bij klanten.' },
  ],

  vaardigheden: [
    { name: 'Netwerkengineering', value: 60 },
    { name: 'Scripting',          value: 75 },
    { name: 'Security',           value: 50 },
    { name: 'Cloud engineering',  value: 50 },
  ],

  softskills: ['Communicatie', 'Teamleiding', 'Samenwerken', 'Zelfstandigheid', 'Plannen'],

  portfolioCategories: [
    { id: 'all',            label: 'All' },
    { id: 'infrastructuur', label: 'Infrastructuur' },
    { id: 'applicaties',    label: 'Applicaties' },
    { id: 'cybersecurity',  label: 'Cybersecurity' },
  ],

  projects: [
    { title: 'OTAP Omgeving', category: 'infrastructuur', image: './assets/images/project-1.png', tags: 'GitHub Workflows · Cloudflared · Databases · Containerisatie',
      text: 'Een volledige OTAP-straat voor eigen projecten: gescheiden ontwikkel-, test-, acceptatie- en productieomgevingen met geautomatiseerde deployments via GitHub Workflows, veilig ontsloten via Cloudflared.' },
    { title: 'Hybride IT-Infrastructuur', category: 'infrastructuur', image: './assets/images/project-2.png', tags: 'Azure · Intune · On-Prem Services · Windows · Linux',
      text: 'Een hybride omgeving waarin Azure en on-premises servers samenwerken: apparaatbeheer met Intune en cloud-identiteit, gecombineerd met Windows- en Linux-services op eigen hardware.' },
    { title: 'Containerized Full-Stack Applicatie', category: 'applicaties', image: './assets/images/project-3.png', tags: 'Backend · Frontend · API · Database · Containerisatie',
      text: 'Zelf ontwikkelde full-stack webapplicatie — frontend, API en database — volledig gecontaineriseerd opgezet met gescheiden services.' },
    { title: 'Monitoring & Inzicht', category: 'applicaties', image: './assets/images/project-4.png', tags: 'Beszel · Checkmk · Dashboards · Alerts',
      text: 'Centrale monitoring van alle systemen in mijn homelab met Beszel en Checkmk: realtime dashboards en alerts om problemen te zien vóórdat ze uitval veroorzaken.' },
    { title: 'Virtualisatie & Containerisatie', category: 'infrastructuur', image: './assets/images/project-5.png', tags: 'Proxmox · VMs · LXC Containers · Docker · Scripting · Backups',
      text: 'Proxmox als fundament van mijn homelab: virtuele machines en LXC-containers, aangevuld met Docker, beheerscripts en geautomatiseerde backups.' },
    { title: 'Microsoft Power Platform', category: 'applicaties', image: './assets/images/project-7.png', tags: 'Power Automate · Power Apps · Copilot Studio · AI Agents',
      text: 'Automatiseringsoplossingen gebouwd tijdens mijn stage: workflows met Power Automate, apps met Power Apps en AI-agents via Copilot Studio.' },
    { title: 'Procesautomatisering & AI', category: 'applicaties', image: './assets/images/project-8.png', tags: 'Low-Code / No-Code · n8n · AI Agents · MCP · API Integraties',
      text: 'Werkprocessen geautomatiseerd met n8n en AI-agents: van e-mailverwerking tot API-integraties, onderling gekoppeld via MCP.' },
  ],

  blog: [
    { title: 'Bunk Hosting', image: './assets/images/blog-3.jpg', url: 'https://bunkhosting.nl', category: 'Project', date: '2026', datetime: '2026-06-01', status: 'online', text: 'Een full-stack platform voor een Nederlandse VPS-hostingprovider: van het klantportaal en live serverstatistieken tot de backend-automatisering die servers provisioned en beheert. Gebouwd met security en hardening als uitgangspunt. Front-end met Next.js, TypeScript en Tailwind CSS, een eigen API en uitgeserveerd via Cloudflare.' },
    { title: 'SnackSpot', image: './assets/images/blog-1.jpg', url: 'https://snackspot.online', category: 'Project', date: '2026', datetime: '2026-03-01', status: 'online', text: 'Een mobile-first webapp voor het ontdekken en reviewen van lokale verborgen eetplekken. Met community feed, foto-uploads, structured ratings, nearby discovery en een admin panel voor moderatie.' },
    { title: 'TankNu', image: './assets/images/blog-2.jpg', url: 'https://tanknu.nl', category: 'Project', date: '2025', datetime: '2025-11-01', status: 'offline', text: 'Een web-app die brandstofprijzen rondom jouw locatie ophaalt via de publieke API. Geen eigen database: de browser doet het verzoek en toont realtime het goedkoopste tankstation, met directe navigatie via Google Maps.' },
  ],
};

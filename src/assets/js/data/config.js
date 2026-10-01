// ============================================================
// data/config.js — content (single source of truth)
//
// Pas hieronder je gegevens aan; de UI rendert automatisch. Het statische
// HTML-gedeelte in index.html (voor Google, mobiel en "eenvoudige weergave")
// wordt hieruit gegenereerd:  node scripts/generate-static.mjs
// (de Docker-build doet dat automatisch).
//
// Projecten kennen optionele velden voor een uitgebreidere projectpagina.
// Ze worden alleen getoond als ze zijn ingevuld:
//   role:    'Wat was jouw rol'
//   result:  'Belangrijkste resultaat'
//   details: [{ title: 'Architectuur', text: '…' }, { title: 'Uitdagingen', text: '…' }]
//   links:   [{ label: 'GitHub', url: 'https://…' }]
// `thumb` (optioneel): kleinere afbeelding voor kaarten; `image` wordt op de projectpagina gebruikt.
// ============================================================

export const CONFIG = {
  site: {
    url: 'https://stijnvandepol.nl/',
    title: 'Stijn van de Pol — Student IT Infrastructure & Cybersecurity | Portfolio',
    description: 'Portfolio van Stijn van de Pol, HBO-ICT-student Infrastructuur & Cybersecurity: projecten, ervaring, skills, cv en contact.',
    image: 'https://stijnvandepol.nl/assets/images/og-image.jpg',
  },

  profile: {
    name: 'Stijn van de Pol',
    role: 'Student IT Infrastructure & Cybersecurity',
    intro: 'Student HBO-ICT aan Fontys met een specialisatie in Infrastructuur & Cybersecurity. Ik wil begrijpen hoe systemen werken, hoe ik ze kan verbeteren en beveiligen — en bouw en test dat in mijn eigen homelab.',
    email: 'Stijnvdpol@outlook.com',
    location: 'Landhorst, Noord-Brabant',
    github: 'https://github.com/stijnvandepol',
    linkedin: 'https://www.linkedin.com/in/stijnvandepol/',
    instagram: 'https://www.instagram.com/stijnvdpol/',
    cv: './assets/files/cv.pdf',
    cvName: 'CV-Stijn-van-de-Pol.pdf',
  },

  about: [
    'Ik ben Stijn van de Pol, student HBO-ICT aan Fontys met de specialisatie Infrastructuur & Cybersecurity. Mijn interesse gaat verder dan techniek: ik wil begrijpen hoe systemen werken, hoe ik ze kan verbeteren en waarom een oplossing werkt.',
    'In mijn homelab experimenteer ik met nieuwe tools en configuraties. Wat mij motiveert is dat IT nooit af is — er valt altijd iets te verbeteren, te beveiligen of slimmer te maken.',
  ],

  // Specialisaties (icon = naam uit apps/icons.js)
  focus: [
    { icon: 'network', title: 'Netwerk & Infrastructuur', text: 'Netwerken ontwerpen, segmenteren en beheren. Ervaring met firewalls, monitoring en logging voor een veilige en stabiele omgeving.' },
    { icon: 'bolt', title: 'Automation', text: 'PowerShell & Python scripting, Infrastructure as Code en CI/CD-pijplijnen. Aangevuld met low-code automatisering en AI.' },
    { icon: 'shield', title: 'Security', text: 'Hardening-best practices toepassen, pentests/kwetsbaarheidsscans uitvoeren en loganalyse.' },
    { icon: 'cloud', title: 'Cloud & Development', text: 'Applicaties en oplossingen ontwikkelen. Ervaring met Azure & Cloudflare, gecombineerd met programmeerkennis.' },
  ],

  experience: [
    { role: 'Projectstage', org: 'Verweijen ICT', period: 'sep. 2025 – jan. 2026', duration: '5 mnd', location: 'Mill',
      text: 'Onderzoek naar AI en low-code in het Microsoft Power Platform; adviesrapport voor een nieuwe dienst gepresenteerd. Automatiseringen uitgerold met Power Automate, Power Apps en Copilot Studio.',
      tags: ['Power Automate', 'Power Apps', 'Copilot Studio', 'AI'] },
    { role: 'Teamleider', org: 'Jumbo', period: 'feb. 2025 – heden', duration: '', location: 'Mill',
      text: 'Aansturen van de vulploeg en eindverantwoordelijk voor de winkel.',
      tags: ['Leidinggeven', 'Verantwoordelijkheid'] },
    { role: 'Stagiair IT', org: 'Vanboxtel', period: 'feb. 2023 – jun. 2023', duration: '5 mnd', location: 'Boekel',
      text: 'Firewalls en switches geconfigureerd en vervangen bij klanten op locatie. Netwerkontwerp opgesteld en bestaande klantomgevingen bijgewerkt en beveiligd.',
      tags: ['Firewalls', 'Switches', 'Netwerkontwerp'] },
    { role: 'Stagiair IT', org: 'Verweijen ICT', period: 'sep. 2021 – jan. 2022', duration: '5 mnd', location: 'Mill',
      text: 'Werkplekken, access points en telefonie geconfigureerd en op locatie uitgeleverd bij klanten.',
      tags: ['Werkplekken', 'Access points', 'Telefonie'] },
  ],

  education: [
    { title: 'HBO-ICT', org: 'Fontys Hogeschool', period: '2023 – 2027', text: 'Profiel Infrastructure → specialisatie Cybersecurity.' },
    { title: 'MBO4 ICT-beheer', org: 'Koning Willem I College', period: '2020 – 2023', text: 'IT-beheer, netwerk en support.' },
  ],

  // Geen percentages: die zijn arbitrair. Categorieën met concrete technieken.
  skills: [
    { category: 'Infrastructuur & netwerk', icon: 'network', items: ['Netwerken', 'Firewalls', 'Switches', 'Proxmox', 'Docker', 'Linux', 'Windows', 'Monitoring (Beszel, Checkmk)'] },
    { category: 'Cloud', icon: 'cloud', items: ['Azure', 'Intune', 'Cloudflare'] },
    { category: 'Development & automation', icon: 'bolt', items: ['PowerShell', 'Python', 'Infrastructure as Code', 'CI/CD (GitHub Workflows)', 'Next.js', 'TypeScript', 'Tailwind CSS'] },
    { category: 'Low-code & AI', icon: 'chart', items: ['Power Automate', 'Power Apps', 'Copilot Studio', 'n8n', 'AI-agents', 'MCP'] },
    { category: 'Security', icon: 'shield', items: ['Hardening', 'Pentests & kwetsbaarheidsscans', 'Loganalyse'] },
  ],

  softskills: ['Communicatie', 'Teamleiding', 'Samenwerken', 'Zelfstandigheid', 'Plannen'],

  projectCategories: [
    { id: 'all', label: 'Alles' },
    { id: 'websites', label: 'Websites' },
    { id: 'infrastructuur', label: 'Infrastructuur' },
    { id: 'applicaties', label: 'Applicaties' },
    { id: 'cybersecurity', label: 'Cybersecurity' },   // wordt verborgen zolang er geen projecten in staan
  ],

  // kind: 'web' = live website (heeft url/status) · 'lab' = homelab/opdracht
  projects: [
    { id: 'bunk-hosting', kind: 'web', category: 'websites', featured: true, title: 'Bunk Hosting', subtitle: 'Hostingplatform voor een Nederlandse VPS-provider',
      image: './assets/images/blog-3.webp', thumb: './assets/images/blog-3-thumb.webp', url: 'https://bunkhosting.nl', status: 'online', date: '2026', datetime: '2026-06-01',
      tags: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Eigen API', 'Cloudflare', 'Security'],
      text: 'Een full-stack platform voor een Nederlandse VPS-hostingprovider: van het klantportaal en live serverstatistieken tot de backend-automatisering die servers provisioned en beheert. Gebouwd met security en hardening als uitgangspunt. Front-end met Next.js, TypeScript en Tailwind CSS, een eigen API en uitgeserveerd via Cloudflare.' },
    { id: 'snackspot', kind: 'web', category: 'websites', featured: true, title: 'SnackSpot', subtitle: 'Ontdek en review verborgen eetplekken',
      image: './assets/images/blog-1.webp', thumb: './assets/images/blog-1-thumb.webp', url: 'https://snackspot.online', status: 'online', date: '2026', datetime: '2026-03-01',
      tags: ['Mobile-first webapp', 'Community feed', 'Foto-uploads', 'Admin panel'],
      text: 'Een mobile-first webapp voor het ontdekken en reviewen van lokale verborgen eetplekken. Met community feed, foto-uploads, structured ratings, nearby discovery en een admin panel voor moderatie.' },
    { id: 'tanknu', kind: 'web', category: 'websites', title: 'TankNu', subtitle: 'Het goedkoopste tankstation in de buurt',
      image: './assets/images/blog-2.webp', thumb: './assets/images/blog-2-thumb.webp', status: 'offline', date: '2025', datetime: '2025-11-01',
      tags: ['Publieke API', 'Geolocatie', 'Google Maps'],
      text: 'Een web-app die brandstofprijzen rondom jouw locatie ophaalt via de publieke API. Geen eigen database: de browser doet het verzoek en toont realtime het goedkoopste tankstation, met directe navigatie via Google Maps.' },

    { id: 'otap-omgeving', kind: 'lab', category: 'infrastructuur', featured: true, title: 'OTAP Omgeving', subtitle: 'Gescheiden ontwikkel-, test-, acceptatie- en productieomgeving',
      image: './assets/images/project-1.webp', tags: ['GitHub Workflows', 'Cloudflared', 'Databases', 'Containerisatie'],
      text: 'Een volledige OTAP-straat voor eigen projecten: gescheiden ontwikkel-, test-, acceptatie- en productieomgevingen met geautomatiseerde deployments via GitHub Workflows, veilig ontsloten via Cloudflared.' },
    { id: 'hybride-it-infrastructuur', kind: 'lab', category: 'infrastructuur', title: 'Hybride IT-Infrastructuur', subtitle: 'Azure en on-premises servers die samenwerken',
      image: './assets/images/project-2.webp', tags: ['Azure', 'Intune', 'On-Prem Services', 'Windows', 'Linux'],
      text: 'Een hybride omgeving waarin Azure en on-premises servers samenwerken: apparaatbeheer met Intune en cloud-identiteit, gecombineerd met Windows- en Linux-services op eigen hardware.' },
    { id: 'containerized-full-stack', kind: 'lab', category: 'applicaties', title: 'Containerized Full-Stack Applicatie', subtitle: 'Frontend, API en database in aparte containers',
      image: './assets/images/project-3.webp', tags: ['Backend', 'Frontend', 'API', 'Database', 'Containerisatie'],
      text: 'Zelf ontwikkelde full-stack webapplicatie — frontend, API en database — volledig gecontaineriseerd opgezet met gescheiden services.' },
    { id: 'monitoring-inzicht', kind: 'lab', category: 'applicaties', title: 'Monitoring & Inzicht', subtitle: 'Realtime dashboards en alerts voor het homelab',
      image: './assets/images/project-4.webp', tags: ['Beszel', 'Checkmk', 'Dashboards', 'Alerts'],
      text: 'Centrale monitoring van alle systemen in mijn homelab met Beszel en Checkmk: realtime dashboards en alerts om problemen te zien vóórdat ze uitval veroorzaken.' },
    { id: 'virtualisatie-containerisatie', kind: 'lab', category: 'infrastructuur', title: 'Virtualisatie & Containerisatie', subtitle: 'Proxmox als fundament van het homelab',
      image: './assets/images/project-5.webp', tags: ['Proxmox', 'VMs', 'LXC Containers', 'Docker', 'Scripting', 'Backups'],
      text: 'Proxmox als fundament van mijn homelab: virtuele machines en LXC-containers, aangevuld met Docker, beheerscripts en geautomatiseerde backups.' },
    { id: 'power-platform', kind: 'lab', category: 'applicaties', title: 'Microsoft Power Platform', subtitle: 'Automatiseringen uit mijn stage',
      image: './assets/images/project-7.webp', tags: ['Power Automate', 'Power Apps', 'Copilot Studio', 'AI-agents'],
      text: 'Automatiseringsoplossingen gebouwd tijdens mijn stage: workflows met Power Automate, apps met Power Apps en AI-agents via Copilot Studio.' },
    { id: 'procesautomatisering-ai', kind: 'lab', category: 'applicaties', title: 'Procesautomatisering & AI', subtitle: 'Workflows en AI-agents met n8n',
      image: './assets/images/project-8.webp', tags: ['Low-code / No-code', 'n8n', 'AI-agents', 'MCP', 'API-integraties'],
      text: 'Werkprocessen geautomatiseerd met n8n en AI-agents: van e-mailverwerking tot API-integraties, onderling gekoppeld via MCP.' },
  ],
};

/** Hulpfuncties (ook door het generatiescript gebruikt) */
export const projectById = (id) => CONFIG.projects.find((p) => p.id === id);
export const categoryLabel = (id) => (CONFIG.projectCategories.find((c) => c.id === id) || {}).label || id;

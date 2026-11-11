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

import { localize } from '../core/i18n.js';

// Teksten die per taal verschillen staan als { nl, en }; CONFIG hieronder is al vertaald.
export const CONTENT = {
  site: {
    url: 'https://stijnvandepol.nl/',
    title: { nl: 'Stijn van de Pol | Student IT Infrastructure & Cybersecurity', en: 'Stijn van de Pol | IT Infrastructure & Cybersecurity student' },
    description: { nl: 'Portfolio van Stijn van de Pol, HBO-ICT-student Infrastructuur & Cybersecurity: projecten, ervaring, skills, cv en contact.', en: 'Portfolio of Stijn van de Pol, ICT student in Infrastructure & Cybersecurity: projects, experience, skills, CV and contact.' },
    image: 'https://stijnvandepol.nl/assets/images/og-image.jpg',
  },

  profile: {
    name: 'Stijn van de Pol',
    role: { nl: 'Student IT Infrastructure & Cybersecurity', en: 'IT Infrastructure & Cybersecurity student' },
    intro: { nl: 'Student HBO-ICT aan Fontys met een specialisatie in Infrastructuur & Cybersecurity. Ik wil begrijpen hoe systemen werken en hoe ik ze kan verbeteren en beveiligen. Dat bouw en test ik in mijn eigen homelab.', en: 'ICT student at Fontys, specializing in Infrastructure & Cybersecurity. I want to understand how systems work and how to improve and secure them. I build and test that in my own homelab.' },
    email: 'Stijnvdpol@outlook.com',
    location: 'Landhorst, Noord-Brabant',
    github: 'https://github.com/stijnvandepol',
    linkedin: 'https://www.linkedin.com/in/stijnvandepol/',
    instagram: 'https://www.instagram.com/stijnvdpol/',
    cv: './assets/files/cv.pdf',
    cvName: 'CV-Stijn-van-de-Pol.pdf',
  },

  about: [
    { nl: 'Ik ben Stijn van de Pol, student HBO-ICT aan Fontys met de specialisatie Infrastructuur & Cybersecurity. Ik wil niet alleen weten hoe ik iets instel, maar ook waarom het werkt en hoe het beter of veiliger kan.', en: 'I\'m Stijn van de Pol, an ICT student at Fontys specializing in Infrastructure & Cybersecurity. I don\'t just want to know how to set something up, but also why it works and how it can be better or more secure.' },
    { nl: 'In mijn homelab probeer ik nieuwe tools en configuraties uit. Wat mij motiveert is dat IT nooit af is: er valt altijd iets te verbeteren, te beveiligen of slimmer te maken.', en: 'In my homelab I try out new tools and configurations. What motivates me is that IT is never finished: there is always something to improve, secure or make smarter.' },
  ],

  // Specialisaties (icon = naam uit apps/icons.js)
  focus: [
    { icon: 'network', title: { nl: 'Netwerk & Infrastructuur', en: 'Networking & Infrastructure' }, text: { nl: 'Netwerken ontwerpen, segmenteren en beheren, met firewalls, monitoring en logging.', en: 'Designing, segmenting and managing networks, with firewalls, monitoring and logging.' } },
    { icon: 'bolt', title: 'Automation', text: { nl: 'Scripts in PowerShell en Python, Infrastructure as Code en CI/CD-pipelines. Daarnaast low-code automatisering en AI-agents.', en: 'Scripts in PowerShell and Python, Infrastructure as Code and CI/CD pipelines. Plus low-code automation and AI agents.' } },
    { icon: 'shield', title: 'Security', text: { nl: 'Systemen hardenen, kwetsbaarheidsscans en pentests uitvoeren en logs analyseren.', en: 'Hardening systems, running vulnerability scans and pentests, and analyzing logs.' } },
    { icon: 'cloud', title: 'Cloud & Development', text: { nl: 'Webapps bouwen met Next.js en TypeScript en ze online zetten met Docker en Cloudflare. Daarnaast werk ik met Azure.', en: 'Building web apps with Next.js and TypeScript and putting them online with Docker and Cloudflare. I also work with Azure.' } },
  ],

  experience: [
    { role: { nl: 'Projectstage', en: 'Project internship' }, org: 'Verweijen ICT', period: { nl: 'sep. 2025 - jan. 2026', en: 'Sep 2025 - Jan 2026' }, duration: { nl: '5 mnd', en: '5 months' }, location: 'Mill',
      text: { nl: 'Onderzoek naar AI en low-code in het Microsoft Power Platform; adviesrapport voor een nieuwe dienst gepresenteerd. Automatiseringen uitgerold met Power Automate, Power Apps en Copilot Studio.', en: 'Research into AI and low-code in the Microsoft Power Platform, ending in an advisory report for a new service that I presented. Rolled out automations with Power Automate, Power Apps and Copilot Studio.' },
      tags: ['Power Automate', 'Power Apps', 'Copilot Studio', 'AI'] },
    { role: { nl: 'Teamleider', en: 'Team leader' }, org: 'Jumbo', period: { nl: 'feb. 2025 - heden', en: 'Feb 2025 - present' }, duration: '', location: 'Mill',
      text: { nl: 'Aansturen van de vulploeg en eindverantwoordelijk voor de winkel.', en: 'Leading the stocking team and responsible for the store as a whole.' },
      tags: [{ nl: 'Leidinggeven', en: 'Leadership' }, { nl: 'Verantwoordelijkheid', en: 'Responsibility' }] },
    { role: { nl: 'Stagiair IT', en: 'IT intern' }, org: 'Vanboxtel', period: { nl: 'feb. 2023 - jun. 2023', en: 'Feb 2023 - Jun 2023' }, duration: { nl: '5 mnd', en: '5 months' }, location: 'Boekel',
      text: { nl: 'Firewalls en switches geconfigureerd en vervangen bij klanten op locatie. Netwerkontwerp opgesteld en bestaande klantomgevingen bijgewerkt en beveiligd.', en: 'Configured and replaced firewalls and switches at customer sites. Drew up a network design and updated and secured existing customer environments.' },
      tags: ['Firewalls', 'Switches', { nl: 'Netwerkontwerp', en: 'Network design' }] },
    { role: { nl: 'Stagiair IT', en: 'IT intern' }, org: 'Verweijen ICT', period: { nl: 'sep. 2021 - jan. 2022', en: 'Sep 2021 - Jan 2022' }, duration: { nl: '5 mnd', en: '5 months' }, location: 'Mill',
      text: { nl: 'Werkplekken, access points en telefonie geconfigureerd en op locatie uitgeleverd bij klanten.', en: 'Configured workstations, access points and telephony and delivered them on site at customers.' },
      tags: [{ nl: 'Werkplekken', en: 'Workstations' }, 'Access points', { nl: 'Telefonie', en: 'Telephony' }] },
  ],

  education: [
    { title: { nl: 'HBO-ICT', en: 'Bachelor of ICT' }, org: 'Fontys Hogeschool', period: '2023 - 2027', text: { nl: 'Profiel Infrastructure → specialisatie Cybersecurity.', en: 'Infrastructure profile → Cybersecurity specialization.' } },
    { title: { nl: 'MBO4 ICT-beheer', en: 'IT Management (MBO level 4)' }, org: 'Koning Willem I College', period: '2020 - 2023', text: { nl: 'IT-beheer, netwerk en support.', en: 'IT management, networking and support.' } },
  ],

  // Geen percentages: die zijn arbitrair. Categorieën met concrete technieken.
  skills: [
    { category: 'Infrastructure & networking', icon: 'network', items: ['Networking', 'Firewalls', 'Switches', 'Proxmox', 'Docker', 'Linux', 'Windows', 'Monitoring'] },
    { category: 'Cloud', icon: 'cloud', items: ['Azure', 'Intune', 'Cloudflare'] },
    { category: 'Development & automation', icon: 'bolt', items: ['PowerShell', 'Python', 'Infrastructure as Code', 'CI/CD', 'Next.js', 'TypeScript', 'Tailwind CSS', 'AI-driven development', 'Reverse engineering'] },
    { category: 'Low-code & AI', icon: 'chart', items: ['Power Automate', 'Power Apps', 'Copilot Studio', 'n8n', 'AI agents', 'MCP', 'Claude Code', 'AI integrations'] },
    { category: 'Security', icon: 'shield', items: ['Hardening', 'Pentesting & vulnerability scanning', 'Log analysis'] },
  ],

  softskills: ['Communication', 'Team leadership', 'Collaboration', 'Independence', 'Planning'],

  projectCategories: [
    { id: 'all', label: { nl: 'Alles', en: 'All' } },
    { id: 'websites', label: 'Websites' },
    { id: 'infrastructuur', label: { nl: 'Infrastructuur', en: 'Infrastructure' } },
    { id: 'applicaties', label: { nl: 'Applicaties', en: 'Applications' } },
    { id: 'cybersecurity', label: 'Cybersecurity' },   // wordt verborgen zolang er geen projecten in staan
  ],

  // kind: 'web' = live website (heeft url/status) · 'app' = iOS-app · 'lab' = homelab/opdracht
  projects: [
    { id: 'dashwise', kind: 'app', category: 'applicaties', featured: true, title: 'Dashwise', subtitle: { nl: 'Live motordata van je auto op je iPhone', en: 'Live engine data from your car on your iPhone' },
      image: './assets/images/blog-5.webp', thumb: './assets/images/blog-5-thumb.webp', url: 'https://getdashwise.nl', status: 'online', date: '2026', datetime: '2026-10-01',
      tags: ['Swift 6', 'SwiftUI', 'CoreBluetooth', 'OBD-II / ELM327'],
      text: { nl: 'Een native iPhone-app die live motordata uitleest via een ELM327 OBD-II-adapter over Bluetooth of wifi. Met live dashboard, foutcodes, rittenlogboek en rondetijden, volledig privé op het toestel.', en: 'A native iPhone app that reads live engine data through an ELM327 OBD-II adapter over Bluetooth or Wi-Fi. With a live dashboard, fault codes, a trip log and lap times, fully private on the device.' } },
    { id: 'superscout', kind: 'web', category: 'websites', featured: true, title: 'SuperScout', subtitle: { nl: 'Alle supermarktaanbiedingen op één plek', en: 'Every supermarket deal in one place' },
      image: './assets/images/blog-4.webp', thumb: './assets/images/blog-4-thumb.webp', url: 'https://superscout.nl', status: 'online', date: '2026', datetime: '2026-07-01',
      tags: ['Next.js', 'TypeScript', 'Web scraping', 'SQLite', 'Docker'],
      text: { nl: 'Een webapp die de weekaanbiedingen van tien Nederlandse supermarkten in één doorzoekbare lijst zet. Met zoeken, filters per winkel en categorie en een boodschappenlijstje, zonder account of tracking.', en: 'A web app that puts the weekly deals of ten Dutch supermarkets in one searchable list. With search, filters per store and category and a shopping list, without an account or tracking.' } },
    { id: 'bunk-hosting', kind: 'web', category: 'websites', featured: true, title: 'Bunk Hosting', subtitle: { nl: 'Hostingplatform voor een Nederlandse VPS-provider', en: 'Hosting platform for a Dutch VPS provider' },
      image: './assets/images/blog-3.webp', thumb: './assets/images/blog-3-thumb.webp', url: 'https://bunkhosting.nl', status: 'online', date: '2026', datetime: '2026-06-01',
      tags: ['Next.js', 'TypeScript', 'Tailwind CSS', { nl: 'Eigen API', en: 'Custom API' }, 'Cloudflare', 'Security'],
      text: { nl: 'Een full-stack platform voor een Nederlandse VPS-hostingprovider: het klantportaal, live serverstatistieken en de backend-automatisering die servers aanmaakt en beheert. Security en hardening zaten er vanaf het begin in. Gebouwd met Next.js, TypeScript en Tailwind CSS, met een eigen API achter Cloudflare. Gebouwd samen met mijn teamgenoot Julian Loontjens.', en: 'A full-stack platform for a Dutch VPS hosting provider: the customer portal, live server statistics and the backend automation that creates and manages servers. Security and hardening were part of it from the start. Built with Next.js, TypeScript and Tailwind CSS, with a custom API behind Cloudflare. Built together with my teammate Julian Loontjens.' },
      links: [{ label: { nl: 'Julian Loontjens (teamgenoot)', en: 'Julian Loontjens (teammate)' }, url: 'https://julianloontjens.nl/' }] },
    { id: 'snackspot', kind: 'web', category: 'websites', featured: true, title: 'SnackSpot', subtitle: { nl: 'Ontdek en review verborgen eetplekken', en: 'Discover and review hidden food spots' },
      image: './assets/images/blog-1.webp', thumb: './assets/images/blog-1-thumb.webp', url: 'https://snackspot.online', status: 'online', date: '2026', datetime: '2026-03-01',
      tags: ['Mobile-first webapp', 'Community feed', { nl: 'Foto-uploads', en: 'Photo uploads' }, 'Admin panel'],
      text: { nl: 'Een mobile-first webapp om verborgen eetplekken in de buurt te ontdekken en te reviewen. Met een community feed, foto-uploads, beoordelingen per onderdeel, plekken in de buurt en een admin panel voor moderatie.', en: 'A mobile-first web app for discovering and reviewing hidden food spots nearby. With a community feed, photo uploads, ratings per aspect, nearby spots and an admin panel for moderation.' } },
    { id: 'tanknu', kind: 'web', category: 'websites', title: 'TankNu', subtitle: { nl: 'Het goedkoopste tankstation in de buurt', en: 'The cheapest gas station nearby' },
      image: './assets/images/blog-2.webp', thumb: './assets/images/blog-2-thumb.webp', status: 'offline', date: '2025', datetime: '2025-11-01',
      tags: [{ nl: 'Publieke API', en: 'Public API' }, { nl: 'Geolocatie', en: 'Geolocation' }, 'Google Maps'],
      text: { nl: 'Een web-app die brandstofprijzen rondom jouw locatie ophaalt via de publieke API. Geen eigen database: de browser doet het verzoek en toont realtime het goedkoopste tankstation, met directe navigatie via Google Maps.', en: 'A web app that fetches fuel prices around your location through the public API. No database of its own: the browser makes the request and shows the cheapest gas station in real time, with direct navigation through Google Maps.' } },

    { id: 'otap-omgeving', kind: 'lab', category: 'infrastructuur', featured: true, title: { nl: 'OTAP Omgeving', en: 'DTAP Environment' }, subtitle: { nl: 'Gescheiden ontwikkel-, test-, acceptatie- en productieomgeving', en: 'Separate development, test, acceptance and production environments' },
      image: './assets/images/project-1.webp', tags: ['GitHub Workflows', 'Cloudflared', 'Databases', { nl: 'Containerisatie', en: 'Containerization' }],
      text: { nl: 'Een volledige OTAP-straat voor eigen projecten: gescheiden ontwikkel-, test-, acceptatie- en productieomgevingen met geautomatiseerde deployments via GitHub Workflows, veilig ontsloten via Cloudflared.', en: 'A complete DTAP pipeline for my own projects: separate development, test, acceptance and production environments with automated deployments through GitHub Workflows, exposed securely through Cloudflared.' } },
    { id: 'hybride-it-infrastructuur', kind: 'lab', category: 'infrastructuur', title: { nl: 'Hybride IT-Infrastructuur', en: 'Hybrid IT Infrastructure' }, subtitle: { nl: 'Azure en on-premises servers die samenwerken', en: 'Azure and on-premises servers working together' },
      image: './assets/images/project-2.webp', tags: ['Azure', 'Intune', 'On-Prem Services', 'Windows', 'Linux'],
      text: { nl: 'Een hybride omgeving waarin Azure en on-premises servers samenwerken: apparaatbeheer met Intune en cloud-identiteit, gecombineerd met Windows- en Linux-services op eigen hardware.', en: 'A hybrid environment where Azure and on-premises servers work together: device management with Intune and cloud identity, combined with Windows and Linux services on my own hardware.' } },
    { id: 'containerized-full-stack', kind: 'lab', category: 'applicaties', title: { nl: 'Containerized Full-Stack Applicatie', en: 'Containerized Full-Stack Application' }, subtitle: { nl: 'Frontend, API en database in aparte containers', en: 'Frontend, API and database in separate containers' },
      image: './assets/images/project-3.webp', tags: ['Backend', 'Frontend', 'API', 'Database', { nl: 'Containerisatie', en: 'Containerization' }],
      text: { nl: 'Een full-stack webapplicatie die ik zelf heb gebouwd. Frontend, API en database draaien elk in een eigen container.', en: 'A full-stack web application I built myself. Frontend, API and database each run in their own container.' } },
    { id: 'monitoring-inzicht', kind: 'lab', category: 'applicaties', title: { nl: 'Monitoring & Inzicht', en: 'Monitoring & Insight' }, subtitle: { nl: 'Realtime dashboards en alerts voor het homelab', en: 'Real-time dashboards and alerts for the homelab' },
      image: './assets/images/project-4.webp', tags: ['Beszel', 'Checkmk', 'Dashboards', 'Alerts'],
      text: { nl: 'Alle systemen in mijn homelab op één plek gemonitord met Beszel en Checkmk: realtime dashboards en alerts, zodat ik problemen zie voordat er iets uitvalt.', en: 'All systems in my homelab monitored in one place with Beszel and Checkmk: real-time dashboards and alerts, so I see problems before anything goes down.' } },
    { id: 'virtualisatie-containerisatie', kind: 'lab', category: 'infrastructuur', title: { nl: 'Virtualisatie & Containerisatie', en: 'Virtualization & Containerization' }, subtitle: { nl: 'Proxmox als basis van het homelab', en: 'Proxmox as the base of the homelab' },
      image: './assets/images/project-5.webp', tags: ['Proxmox', 'VMs', 'LXC Containers', 'Docker', 'Scripting', 'Backups'],
      text: { nl: 'Proxmox is de basis van mijn homelab: virtuele machines en LXC-containers, met daarnaast Docker, beheerscripts en automatische backups.', en: 'Proxmox is the base of my homelab: virtual machines and LXC containers, plus Docker, management scripts and automatic backups.' } },
    { id: 'power-platform', kind: 'lab', category: 'applicaties', title: 'Microsoft Power Platform', subtitle: { nl: 'Automatiseringen uit mijn stage', en: 'Automations from my internship' },
      image: './assets/images/project-7.webp', tags: ['Power Automate', 'Power Apps', 'Copilot Studio', { nl: 'AI-agents', en: 'AI agents' }],
      text: { nl: 'Automatiseringen die ik tijdens mijn stage heb gebouwd: workflows met Power Automate, apps met Power Apps en AI-agents met Copilot Studio.', en: 'Automations I built during my internship: workflows with Power Automate, apps with Power Apps and AI agents with Copilot Studio.' } },
    { id: 'procesautomatisering-ai', kind: 'lab', category: 'applicaties', title: { nl: 'Procesautomatisering & AI', en: 'Process Automation & AI' }, subtitle: { nl: 'Workflows en AI-agents met n8n', en: 'Workflows and AI agents with n8n' },
      image: './assets/images/project-8.webp', tags: ['Low-code / No-code', 'n8n', { nl: 'AI-agents', en: 'AI agents' }, 'MCP', { nl: 'API-integraties', en: 'API integrations' }],
      text: { nl: 'Werkprocessen geautomatiseerd met n8n en AI-agents: van e-mailverwerking tot API-integraties, onderling gekoppeld via MCP.', en: 'Work processes automated with n8n and AI agents: from email handling to API integrations, linked together through MCP.' } },
  ],
};

export const CONFIG = localize(CONTENT);

/** Hulpfuncties (ook door het generatiescript gebruikt) */
export const projectById = (id) => CONFIG.projects.find((p) => p.id === id);
export const categoryLabel = (id) => (CONFIG.projectCategories.find((c) => c.id === id) || {}).label || id;

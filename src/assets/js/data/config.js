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
    { title: 'Projectstage – Verweijen ICT', date: 'sep. 2025 — jan. 2026 · 5 mnd · Mill', text: 'Onderzoek naar de inzet van AI en low-code via het Microsoft Power Platform voor automatiseringsoplossingen.' },
    { title: 'Teamleider – Jumbo', date: 'feb. 2025 — heden · Mill', text: 'Sinds 2020 werkzaam binnen deze vestiging. Doorgegroeid naar teamleider, met focus op aansturing, opleiding en procesverbetering.' },
    { title: 'IT Engineer (stage) – Vanboxtel', date: 'feb. 2023 — jun. 2023 · 5 mnd · Boekel', text: 'Firewalls, updates, MFA, werkplek-inrichting en on-site support.' },
    { title: 'IT Engineer (stage) – Verweijen ICT', date: 'sep. 2021 — jan. 2022 · 5 mnd · Mill', text: 'Hardware registreren/installeren, MFA instellen en on-site support.' },
  ],

  vaardigheden: [
    { name: 'Netwerkengineering', value: 60 },
    { name: 'Scripting',          value: 75 },
    { name: 'Security',           value: 50 },
    { name: 'Cloud engineering',  value: 50 },
  ],

  portfolioCategories: [
    { id: 'all',            label: 'All' },
    { id: 'infrastructuur', label: 'Infrastructuur' },
    { id: 'applicaties',    label: 'Applicaties' },
    { id: 'cybersecurity',  label: 'Cybersecurity' },
  ],

  projects: [
    { title: 'OTAP Omgeving', category: 'infrastructuur', image: './assets/images/project-1.png', tags: 'GitHub Workflows · Cloudflared · Databases · Containerisatie' },
    { title: 'Hybride IT-Infrastructuur', category: 'infrastructuur', image: './assets/images/project-2.png', tags: 'Azure · Intune · On-Prem Services · Windows · Linux' },
    { title: 'Containerized Full-Stack Applicatie', category: 'applicaties', image: './assets/images/project-3.png', tags: 'Backend · Frontend · API · Database · Containerisatie' },
    { title: 'Monitoring & Inzicht', category: 'applicaties', image: './assets/images/project-4.png', tags: 'Beszel · Checkmk · Dashboards · Alerts' },
    { title: 'Virtualisatie & Containerisatie', category: 'infrastructuur', image: './assets/images/project-5.png', tags: 'Proxmox · VMs · LXC Containers · Docker · Scripting · Backups' },
    { title: 'Microsoft Power Platform', category: 'applicaties', image: './assets/images/project-7.png', tags: 'Power Automate · Power Apps · Copilot Studio · AI Agents' },
    { title: 'Procesautomatisering & AI', category: 'applicaties', image: './assets/images/project-8.png', tags: 'Low-Code / No-Code · n8n · AI Agents · MCP · API Integraties' },
  ],

  blog: [
    { title: 'SnackSpot', image: './assets/images/blog-1.jpg', url: 'https://snackspot.online', category: 'Project', date: '2026', datetime: '2026-03-01', status: 'online', text: 'Een mobile-first webapp voor het ontdekken en reviewen van lokale verborgen eetplekken. Met community feed, foto-uploads, structured ratings, nearby discovery en een admin panel voor moderatie.' },
    { title: 'TankNu', image: './assets/images/blog-2.jpg', url: 'https://tanknu.nl', category: 'Project', date: '2025', datetime: '2025-11-01', status: 'offline', text: 'Een web-app die brandstofprijzen rondom jouw locatie ophaalt via de publieke API. Geen eigen database: de browser doet het verzoek en toont realtime het goedkoopste tankstation, met directe navigatie via Google Maps.' },
  ],
};

import type { ExperienceItem, Project, SkillGroup, Socials } from './schemas';

// Only facts confirmed by the owner. Missing information stays missing and is hidden in the UI.

export const SITE = {
  name: 'Ruthramoorthy S B',
  role: 'B.Tech AI & Data Science student · Co-founder of Unitaryx',
  intro:
    'I build across IoT hardware, machine learning and software products. I study Artificial Intelligence and Data Science, and I co-founded Unitaryx, a student startup where I lead a team of ten.',
  institution: 'M. Kumarasamy College of Engineering',
  graduation: '2029',
  typingWords: ['Web Development', 'UI/UX Design', 'Machine Learning', 'IoT Solutions'],
  interests: ['Embedded systems', 'AI / ML', 'Product design'],
} as const;

export const SOCIALS: Socials = {
  email: 'ruthram667@gmail.com',
  phone: '+91 93639 31903',
  github: 'https://github.com/ruthram667-tech',
  linkedin: 'https://www.linkedin.com/in/ruthra-moorthy-51a0383a7',
  whatsapp: 'https://wa.me/919363931903',
  instagram: 'https://instagram.com/mr_ruth_07',
};

export const PROJECTS: Project[] = [
  {
    slug: 'buffex',
    title: 'Buffex',
    category: 'IoT + ML',
    summary: 'A smart predictive inventory and autonomous replenishment system.',
    tags: ['IoT', 'Machine Learning'],
    featured: true,
    org: 'Unitaryx',
    sections: { overview: 'Buffex is a smart predictive inventory and autonomous replenishment system built at Unitaryx, combining IoT hardware with machine learning.' },
    sortOrder: 1,
  },
  {
    slug: 'neervahini',
    title: 'Neervahini',
    category: 'IoT',
    summary: 'An IoT water quality monitoring system, also known as AquaSight AI.',
    tags: ['IoT', 'Water quality'],
    featured: true,
    org: 'Unitaryx',
    sections: { overview: 'Neervahini (AquaSight AI) is an IoT water quality monitoring system built at Unitaryx.' },
    sortOrder: 2,
  },
  {
    slug: 'taskassist',
    title: 'TaskAssist',
    category: 'Web app',
    summary: 'A browser-based, privacy-first productivity app that works offline, with voice and call alerts.',
    tags: ['Offline-first', 'Voice', 'Privacy'],
    featured: true,
    sections: { overview: 'TaskAssist is a browser-based, privacy-first productivity app. It is offline-first and supports voice input and call alerts.' },
    sortOrder: 3,
  },
  {
    slug: 'hydronix',
    title: 'Hydronix',
    category: 'Data',
    summary: 'A real-time water quality analytics dashboard that combines IoT sensing data with a visual dashboard.',
    tags: ['IoT', 'Pandas', 'Visualization', 'Data'],
    featured: false,
    sections: { overview: 'An IoT-based monitoring experience for water purity detection and analytics, combining sensing data with a visual dashboard.' },
    sortOrder: 4,
  },
  {
    slug: 'ai-live-coach',
    title: 'AI Live Coach',
    category: 'AI',
    summary: 'An educational platform with voice-synchronized learning built on browser-native speech APIs.',
    tags: ['Web Speech API', 'React', 'UX', 'Machine Learning'],
    featured: false,
    sections: { overview: 'An educational platform with voice-synchronized learning experiences built using browser-native speech APIs.' },
    sortOrder: 5,
  },
  {
    slug: 'engineering-calculator-suite',
    title: 'Engineering Calculator Suite',
    category: 'Tooling',
    summary: 'A practical utility set for technical calculations, designed with clarity and usability in mind.',
    tags: ['Python', 'UI', 'Logic', 'Tooling'],
    featured: false,
    sections: { overview: 'A practical utility set for technical calculations, designed with clarity and usability in mind.' },
    sortOrder: 6,
  },
  {
    slug: 'newflex',
    title: 'Newflex',
    category: 'Showcase',
    summary: 'A design-heavy technical portfolio showcasing modern web aesthetics, 3D motion, glassmorphism and responsive UI systems.',
    tags: ['React', 'Three.js', 'Glass UI', 'Motion'],
    featured: false,
    sections: { overview: 'A design-heavy technical portfolio built to showcase modern web aesthetics, 3D motion, glassmorphism and responsive UI systems.' },
    sortOrder: 7,
  },
];

export const EXPERIENCE: ExperienceItem[] = [
  {
    kind: 'venture',
    title: 'Co-founder',
    org: 'Unitaryx',
    description: 'Co-founded a student startup and lead a team of ten, working across IoT hardware, machine learning and software product development.',
  },
  {
    kind: 'education',
    title: 'B.Tech, Artificial Intelligence and Data Science',
    org: 'M. Kumarasamy College of Engineering',
    period: 'Graduating 2029',
  },
];

export const SKILLS: SkillGroup[] = [
  { group: 'Languages', skills: ['Python', 'C++'] },
  { group: 'AI and data', skills: ['Machine Learning', 'Pandas'] },
  { group: 'Web', skills: ['React', 'Three.js', 'Web Speech API', 'UX'] },
  { group: 'Hardware', skills: ['IoT', 'Embedded systems'] },
];

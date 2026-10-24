/** Public portfolio copy. Keep dates and role names aligned with the supplied resume. */
export const PROFILE = {
  name: 'Tanawitch Saentree',
  title: 'Senior Product Designer',
  introduction: 'I design software for insurance, banking and healthcare, from research and workflow design to working interfaces. At Allianz Technology, I design tools for people who configure and review AI document processing.',
  location: 'Bangkok, Thailand',
  availability: 'Open to relocation',
  email: 'tanawitch.saentree@gmail.com',
  linkedIn: 'https://linkedin.com/in/tanawitch-saentree',
  github: 'https://github.com/tanawitchsaentree',
} as const

export const SELECTED_WORK = [
  {
    company: 'Allianz Technology',
    title: 'Sorting the post at an insurer',
    role: 'Senior Designer · sole designer',
    period: '2025–present',
    description: "Each office files insurance documents its own way. I designed the tool where a team builds its filing system, turns it into the AI's prompt and tests it before it goes live.",
    href: '/projects/allianz/',
    protected: true,
  },
  {
    company: 'Allianz Technology',
    title: 'The life of a cargo claim',
    role: 'Senior Designer',
    period: '2026–present',
    description: 'Following one damaged shipment through a claims system I designed and prototyped, from the first phone call to closing.',
    href: '/projects/claims/',
    protected: true,
  },
  {
    company: 'Invitrace Health',
    title: 'One ward screen, many hospitals',
    role: 'Lead Product Designer',
    period: '2024–2025',
    description: "Every hospital wanted its own look, and the buttons drifted apart. I led a design system that keeps one set of components and moves each hospital's differences into a theme.",
    href: '/projects/invitrace/',
    protected: true,
  },
  {
    company: 'Vitae',
    title: 'Scoring a day against your own last two weeks',
    role: 'Lead Product Designer',
    period: '2025',
    description: "We dropped a health score that read like a diagnosis. I redesigned it to compare each day with the person's own last two weeks.",
    href: '/projects/vitae/',
    protected: false,
  },
  {
    company: 'Robowealth · LH Bank',
    title: 'When a fund order really happens',
    role: 'Senior UX/UI Designer',
    period: '2020',
    description: "The money leaves the account today, but the fund is priced after the cutoff. I designed LH Bank's purchase flow so every screen says when the order really happens.",
    href: '/projects/profita/',
    protected: false,
  },
  {
    company: 'Stellareat',
    title: 'Starting from the bottle in the fridge',
    role: 'Product Designer · Contract',
    period: '2024',
    description: 'A recipe app that starts from what\'s left in the fridge. One tester\'s search for "random fridge things" set the direction.',
    href: '/projects/stellareat/',
    protected: false,
  },
  {
    company: 'Tim Hortons',
    title: 'A POS for the orders I remember',
    role: 'Independent designer',
    period: 'Personal concept',
    description: 'After two years behind the counter, I built a POS around the orders I took most and the changes people made at the last second.',
    href: '/projects/tims/',
    protected: false,
  },
] as const

export const PERSONAL_PROJECT = {
  title: 'Manabi',
  description: 'My independent school-search product for families in Thailand, from the parent experience to school data, admin tools, and launch.',
  details: 'Inside the project',
  url: 'https://manabischools.com',
} as const

export const BREWCODEX_PROJECT = {
  title: 'Brewcodex',
  description: "A deck builder for MTG players who don't want to spend money on a deck that doesn't fit them. It builds one around what you like and what you already own, then explains why it works.",
  details: 'Inside the project',
  url: 'https://brewcodex.app',
} as const

export const TOOLS = [
  { name: 'Human Tone', description: 'Editing guidance for clearer, more natural writing.', href: 'https://github.com/tanawitchsaentree/Human-tone' },
  { name: 'Kiln', description: 'A toolkit for creating design systems with AI coding tools.', href: 'https://github.com/tanawitchsaentree/Kiln' },
] as const

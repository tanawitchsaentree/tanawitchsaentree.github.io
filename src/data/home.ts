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
    title: 'Property assessor reports kept getting filed under Vehicle',
    role: 'Senior Designer · sole designer',
    period: '2025–present',
    description: "One invented week at an insurer, following the person who sets up the AI's filing tree and the person who opens the sorted post.",
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
    title: 'A clinic asks for its own look',
    role: 'Lead Product Designer',
    period: '2024–2025',
    description: 'A specialty clinic sends a list of requests, and each answer shows what a hospital can change in the Invitrace design system and what stays the same everywhere.',
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
  tag: 'Two-sided marketplace',
  description: 'My independent school-search product for Thai and expat families in Thailand, from the parent experience to school data, admin tools, and launch.',
  details: 'Inside the project',
  url: 'https://manabischools.com',
} as const

export const BREWCODEX_PROJECT = {
  title: 'Brewcodex',
  tag: 'Recommendation engine',
  description: "A deck builder for MTG players who don't want to spend money on a deck that doesn't fit them. It builds one around what you like and what you already own, then explains why it works.",
  details: 'Inside the project',
  url: 'https://brewcodex.app',
} as const

export const BRICKFORGE_PROJECT = {
  title: 'Brick-forge',
  tag: 'Procedural 3D engine',
  description: 'For when you run out of ideas for your pile of bricks. It makes new versions of real LEGO designs, a house a stud longer or a car a stud wider, with step-by-step instructions.',
  details: 'Inside the project',
  url: 'https://brick-forge.pages.dev',
  linkLabel: 'Open Brick-forge',
} as const

export const TOOLS = [
  { name: 'Human Tone', kind: 'Claude Code skill · MCP server', description: 'Makes AI writing read like a person wrote it. A linter checks each draft before it goes out, in any language. It learns your own words and stops flagging them.', href: 'https://github.com/tanawitchsaentree/Human-tone' },
] as const

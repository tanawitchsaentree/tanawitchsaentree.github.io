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
    title: 'AI document workflows',
    role: 'Senior Designer',
    period: '2025–present',
    description: 'Brought rule configuration and document review into connected workflows, giving business teams a place to inspect changes and operators the information to handle unresolved cases.',
    href: '/projects/allianz/',
    protected: true,
  },
  {
    company: 'Invitrace Health',
    title: 'A design system for hospital software',
    role: 'Lead Product Designer',
    period: '2024–2025',
    description: 'Led a shared design system so designers and engineers could adapt the clinical interface for each hospital while keeping common components together.',
    href: '/projects/invitrace/',
    protected: true,
  },
  {
    company: 'Robowealth · LH Bank',
    title: 'Profita: mutual fund investing',
    role: 'Senior UX/UI Designer',
    period: '2020',
    description: 'Organised fund details, payment choices and order review into a purchase flow the product team could work through from selection to confirmation.',
    href: '/projects/profita/',
    protected: false,
  },
  {
    company: 'Stellareat',
    title: 'Meal planning from ingredients at home',
    role: 'Product Designer · Contract',
    period: '2024',
    description: 'Connected ingredients, meal suggestions and saved recipes in a prototype for the team to explore how people choose what to cook.',
    href: '/projects/stellareat/',
    protected: false,
  },
] as const

export const PERSONAL_PROJECT = {
  title: 'Manabi',
  description: 'My independent school-search product for families in Thailand, from the parent experience to school data, admin tools, and launch.',
  details: 'Inside the project',
  url: 'https://manabischools.com',
} as const

export const TOOLS = [
  { name: 'Human Tone', description: 'Editing guidance for clearer, more natural writing.', href: 'https://github.com/tanawitchsaentree/Human-tone' },
  { name: 'Kiln', description: 'A toolkit for creating design systems with AI coding tools.', href: 'https://github.com/tanawitchsaentree/Kiln' },
] as const

'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { DIAL_PROJECT } from './dialData'

const SECTIONS: ProjectSection[] = [
  { label: 'Where the look comes from', body: "The reference is a row of white household appliances from the Dieter Rams era, among them a radio tuner, a clock and a calculator. Two rules came with it. Dial must not look like a replica of an old device, and it never borrows a brand's name or logo. Orange appears once per card, on the part you touch. The other accent is a quiet frosted resin on caps, lamps, latched keys and chips, lit from behind by the value it holds." },
  { label: 'Who picked what', body: "I chose the device card the rest of the system follows, and the dial mark is mine. For about four in five components, the agent picked between three or more rendered candidates, under a setting I chose. Each pick is logged with its reason for me to review." },
  { label: 'Complaints that became checks', body: "I said the spacing was awful and that dropdowns snapped open with no motion. My working copy of Kiln now checks that every change on screen moves, and it measures the gap between a control and what it controls. I said the focus looked like a black box drawn around the whole fader. It now also checks that the focus ring sits on the part that moves. The public release of Kiln doesn't have these checks yet. In the time picker, white digits showed over the drawn numbers. Dial now has a check for that, and it failed on the bug before the fix went in. The checks also caught a bug I hadn't seen. An onboarding tour vanished with no exit motion, because its wrapper removed it before it could slide away." },
  { label: 'What it can’t do yet', body: "I haven't reviewed the newest components. Sub-agents made them, and apart from a page or two, only the automatic checks have looked at them. The full verification still fails in places. Some dark-theme text is below the 4.5:1 contrast it should meet, and many docs pages are over the 1.5 MB page budget. No one has tested Thai input methods or screen readers, or looked at forced colours and right-to-left text by eye. It isn't on npm and nobody else uses it. The charts, rich text editor and data grid are small native versions, and each chapter says what they leave out." },
]

interface DialModalProps {
  open: boolean
  onClose: () => void
}

export function DialModal({ open, onClose }: DialModalProps) {
  return (
    <ProjectModal
      open={open}
      onClose={onClose}
      id="dial-modal"
      name="Dial"
      title="A home appliance’s face, drawn on a screen"
      intro="Dial is a design system for apps that run things at home, like the heating, the lamps, the washer and the music. Each card behaves like one small appliance, with a warm-white matte body, one display that says the state and one orange control you turn or press. I directed it and built it with Claude Code, using Kiln."
      sections={SECTIONS}
      technical="Dial ships as two packages. dial-tokens holds the design tokens in three tiers. They build to CSS, SCSS, JSON and ESM, and also to Tailwind, Figma, Swift, Kotlin and Dart, which no app has used yet. dial-react holds the components and bundles the tokens, which makes it the only install a React app needs. Each structural decision is recorded with its reason and the options it beat. Each complaint is recorded with the step that produced it, and in most cases with the check that now catches it. The code is MIT licensed and on GitHub at tanawitchsaentree/Dial-design-system."
      url={DIAL_PROJECT.repoUrl}
      linkLabel={DIAL_PROJECT.linkLabel}
      coverRatio={1280 / 800}
      cover={
        <Image
          src="/images/dial-cover.webp"
          alt="A Dial tuner card. A display reads 88.6 MHz above an orange tuning knob, FM and AM keys, a speaker grille and a volume fader."
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 640px"
          className={styles.cover}
        />
      }
    />
  )
}

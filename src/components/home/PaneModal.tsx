'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { PANE_PROJECT, PANE_STATS as P } from './paneData'

const SECTIONS: ProjectSection[] = [
  { label: 'Measuring the glass at the pixel', body: `The contrast of glass depends on what sits behind it, and a formula from the token values can only guess. Pane renders every glass surface over real photos and reads the colour under each letter after the blur. Each letter has to pass at its worst pixel. The latest run made ${P.checks} text checks across the light and dark themes. ${P.passed} passed, and the other ${P.excepted} are listed in an exceptions register with their measured values.` },
  { label: 'A direction I dropped', body: 'My first glass was a grey tint over the scene. It washed the photos out into flat grey panels. Pane now keeps the glass almost clear and dims the photo behind it. The amount comes from measuring the brightest part of each photo under the pane.' },
  { label: 'How it was made', body: 'I built Pane with Kiln, which has no style of its own. I put reference images in the project and answered one question at a time, starting with the platform. Any choice I could judge by eye, like a colour or a component variant, appeared as two to four rendered options in a lab page before I picked. Each pick went into a decisions file with the reason and the options I turned down. The next session reads that file and carries on from where the last one stopped.' },
  { label: 'Gates I test by breaking them', body: 'I test each gate by planting a bug and checking that it turns red. A lint step fails any hardcoded colour or pixel value in component code. A component counts as done only after it passes axe and keyboard tests and has its docs page.' },
  { label: 'Where it stands', body: `Pane is still in progress and isn't public yet. It has ${P.components} components and ${P.tokens} tokens, plus a docs book with foundations, component pages, patterns and the full token reference. Next, each component page gets usage guidance, do and don't examples, a measured style spec and accessibility notes, starting with Button.` },
]

interface PaneModalProps {
  open: boolean
  onClose: () => void
}

export function PaneModal({ open, onClose }: PaneModalProps) {
  return (
    <ProjectModal
      open={open}
      onClose={onClose}
      id="pane-modal"
      name="Pane"
      title="Keeping text readable on clear glass over real photos"
      intro="Pane is a design system of clear glass panes floating over real photos, the look of visionOS in a browser. Glass makes contrast hard, because the text sits on whatever happens to be behind it. I'm building Pane with Kiln, my Claude Code skill for design systems, and holding it to WCAG contrast at every pixel it can measure."
      sections={SECTIONS}
      technical="Pane ships as two packages, pane-tokens in CSS, JS, SCSS and JSON, and pane-react, with a docs site built on Vite and React. The contrast evidence comes from Playwright scripts that render each surface and read its pixels. Pane is private for now. Kiln, the skill it's built with, is public on GitHub."
      url={PANE_PROJECT.kilnUrl}
      linkLabel="Kiln on GitHub"
      cover={
        <Image
          src="/images/pane-cover.webp"
          alt=""
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 640px"
          className={styles.cover}
        />
      }
    />
  )
}

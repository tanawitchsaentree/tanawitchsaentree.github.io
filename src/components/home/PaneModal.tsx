'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { PANE_PROJECT, PANE_STATS as P } from './paneData'

const SECTIONS: ProjectSection[] = [
  { label: 'The rules came first', body: "Before any component I wrote a short set of rules, and everything was held to them. The photo is part of the design. Glass lets the scene show through. Readability over a photo depends on the photo, which means every value comes from measuring real pixels. A formula can only guess. Each pane has one loud action, and a reader never has to choose between two equal ones. Pages meant for reading, like the docs, stay plain, because a photo only competes with the words. Glass is a mood and never carries meaning. When someone turns on reduced transparency or high contrast, the glass becomes solid surfaces and everything still works." },
  { label: 'Calls that changed the design', body: "I picked the look from four rendered options. They were a visionOS-style grey glass, a milk frost, a smoked glass and a layered one. My first working version then laid a grey tint over the photo to keep the text readable, and it turned every photo into a flat grey panel. I rejected it. Pane now keeps the glass almost clear and darkens the photo behind it a little. Later I asked for thinner glass than the safest setting allowed. I kept it thin and wrote down exactly where a few words fall a little short. I also made the docs plain. They first wore the glass look and were hard to read, and glass now appears only on the demos." },
  { label: 'Turning no into a check', body: "I looked at the first Banner and called it AI slop. It was a pattern library's notification with glass painted on top. The fault was in how we worked, because every component started from what other libraries do. Now each one starts from the reasons in those rules. The system proposes three options, I pick one, and only then is code written. A check blocks component code until that step is done. Each complaint I made went the same way. It changed the step that produced the problem and added a check that catches it. The same mistake can't come back quietly. Claude Code did much of the building. I set the direction, chose between options and said no." },
  { label: 'What it can’t do yet', body: "A web page can’t see the photo behind a pane. The app has to tell Pane how bright its background is, and if it says the wrong thing, text becomes hard to read. I’ve only measured in Chrome, not Safari or Firefox. I haven’t tested with screen readers or real users. Ten of the early components came before the new process and are waiting to be redesigned. Pane isn’t on npm yet, and nobody else uses it. My own app, Brick-forge, runs on it, and its 3D scene is why Pane is getting an option to turn the blur off." },
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
      title="Making text readable on glass over a photo"
      intro={`Pane is a design system for glass-style interfaces, like the floating windows in visionOS, built for the web. I directed it and built it with Claude Code, using Kiln, a design-system plugin I made. It is live, with ${P.components} components and a docs site you can open. The hard part of glass is that the text sits on whatever photo is behind it, and Pane is built around keeping the words readable.`}
      sections={SECTIONS}
      technical={`Pane ships as two packages. pane-tokens holds ${P.tokens} tokens in three tiers (primitive, semantic and component), built to CSS, JSON, ESM and SCSS. pane-react holds ${P.components} components and bundles the tokens. One import of pane-react/all.css is enough. Behaviour for Select, Slider, Checkbox, Radio and Switch comes from Radix and the look is Pane's. The tokens are built by my own script, which enforces the three tiers and catches name collisions. The docs site is built on Vite and React, and the contrast evidence comes from Playwright scripts that render each surface and read its pixels. The docs run on Cloudflare Pages and the code is on GitHub at tanawitchsaentree/pane-design-system. Kiln is public at github.com/tanawitchsaentree/Kiln.`}
      url={PANE_PROJECT.docsUrl}
      linkLabel="Open the Pane docs"
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

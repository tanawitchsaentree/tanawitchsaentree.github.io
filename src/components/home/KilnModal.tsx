'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { KILN_PROJECT } from './kilnData'

const SECTIONS: ProjectSection[] = [
  { label: 'Borrow from somewhere real', body: "Before Kiln writes a single token, the system has to name a real tradition from outside web design and say what it borrows from it. Pane started from a Bauhaus curtain wall. The same decision also sets how strongly the system speaks on six scales. Everything after that, the tokens, the components, the docs, comes from that choice." },
  { label: 'Numbers, not opinions', body: "A design system makes claims about contrast, spacing, shape and density. Kiln attaches a script to each one. The answer is a number you can run and read. Spacing is measured in a real browser." },
  { label: 'Whoever proposes does not judge', body: "When the system needs options for something that defines its identity, one role generates candidates that are really different from each other, and a different role judges them. I review what it picked. It stops the part that wrote an idea from grading its own homework." },
  { label: 'What it has made', body: "Pane is the first design system built from start to finish with Kiln, and it is also where Kiln got corrected. Every time I rejected something, the fix went into the step that produced it, plus a check to catch it next time. The Pane entry tells that story, and my brick builder, Brick-forge, now runs on Pane." },
  { label: 'What it can’t do yet', body: "Kiln guides Claude Code and does not replace judgement. I still choose the look, say no to bad work and read the results. It has only built my own projects, two of them to date. Version 2.0 is on GitHub now." },
]

interface KilnModalProps {
  open: boolean
  onClose: () => void
}

export function KilnModal({ open, onClose }: KilnModalProps) {
  return (
    <ProjectModal
      open={open}
      onClose={onClose}
      id="kiln-modal"
      name="Kiln"
      title="Design systems that don’t all look the same"
      intro="Ask an AI for a design system and you tend to get the same one every time. A warm off-white page, a neutral sans-serif, a tidy spacing scale and one bright accent. Kiln is a plugin I made for Claude Code that tries to stop that. It makes each system declare where its look comes from before anything gets built, and it backs what it says about the result with checks you can run."
      sections={SECTIONS}
      technical="Kiln is a Claude Code plugin made of skills, agents and hooks. A small state machine saves each phase to disk. After a context reset the work can pick up where it stopped. A hook blocks writing a token or component file before the approval step. Four bundled sub-skills handle docs generation, spacing measurement, form shapes and candidate generation. Install it with npx github:tanawitchsaentree/Kiln."
      url={KILN_PROJECT.url}
      linkLabel={KILN_PROJECT.linkLabel}
      coverRatio={1400 / 724}
      cover={
        <Image
          src="/images/kiln-cover.webp"
          alt="Kiln: from ideas to design systems, on demand. Glass tiles labelled input, analyze, generate, refine and design system ride a conveyor into a steel kiln."
          fill
          loading="lazy"
          sizes="(max-width: 640px) 100vw, 640px"
          className={styles.cover}
        />
      }
    />
  )
}

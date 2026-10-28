'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { BRICKFORGE_PROJECT } from '@/data/home'

const SECTIONS: ProjectSection[] = [
  {
    label: 'It starts from a designer’s model',
    body: "Every result says where it came from, like “From Apple Tree House, 1 stud longer”. The engine keeps the designer’s parts, copies a middle section and rebuilds only the seams. It learns from about 545 official LEGO designs, and every result is still the designer’s model with a change made to it. A My pieces switch shows how many parts you would still need to buy for each design.",
    figure: { src: '/images/brickforge-studio.webp', alt: 'Three house designs in the Brick-forge studio, each labelled with the official set it came from, how it was changed and how much of it is held together.', caption: 'Three houses from three official sets (LDraw Official Model Repository, CC BY 2.0). Each card shows what it was changed from and how much of it is held together.', width: 1000, height: 726 },
  },
  {
    label: 'Why it edits real designs',
    body: "The first version built models from nothing, and I called the results bad. Real designs use tricks a simple grid can’t describe, like studs on the sides, half-stud offsets and wheels on pins. Only about half of a real car’s parts sit on the plain grid, and for a rocket it is about one in eight. Editing a real model keeps those tricks.",
    figure: { src: '/images/brickforge-edits.webp', alt: 'Four pairs of LEGO models. Each pair shows an official model on the left and a stretched version on the right.', caption: 'Official model on the left, stretched version on the right. In this run the cottage keeps 243 of its 312 parts.', width: 900, height: 512 },
  },
  {
    label: 'Knowing what holds together',
    body: "The hardest problem is telling which parts connect. Real models are full of exact placements where nothing obviously touches, and a 285-part fan model I imported showed every part as loose for exactly that reason. A stud pushed into another part now counts as connected, because solid parts can’t overlap. On the real designs I test on, nearly every part now counts as connected to the rest of the model. Each new design shows how much of it is held together, and turns amber when that drops.",
  },
  {
    label: 'Instructions that follow the designer',
    body: "Official and imported models keep the designer’s own step order, split into small steps. Progress is saved and the booklet prints. It can also read a LEGO instruction PDF and match the parts it draws to the parts list.",
    figure: { src: '/images/brickforge-steps.webp', alt: 'The step view of a small cottage at step 43 of 84, listing two parts for the step and showing the model on a green baseplate.', caption: 'Step 43 of 84 for the windmill on a small cottage, in the designer’s order.', width: 1100, height: 726 },
  },
  {
    label: 'Calls I made',
    body: "Blended designs looked messier than before when I saw them, and they were removed. A missing part gets made to measure, which was my rule. Every part needs a reason, and plates must not stack on repeat. Claude Code did the building and made some calls of its own. One was scoring the engine on whether its designs are as good as the designer’s.",
  },
  {
    label: 'Where it falls short',
    body: "It is not at designer level. I test it by rebuilding eight real designs from their outline and comparing them with the originals, and the rebuilds are still rougher. For Technic it fills shapes with Technic parts. Real Technic is an open frame of beams and pins, which needs a different method I haven’t built yet. Small smooth models like F1 cars are the weakest. There are no automated tests. This is an independent fan project with no connection to the LEGO Group, and I also tested on a paid design by another fan builder, and it is not on the public site.",
    figure: { src: '/images/brickforge-benchmark.webp', alt: 'Eight pairs of LEGO models. The designer’s model is on the left of each pair and the engine’s rebuild from the outline alone is on the right.', caption: 'Designer’s model on the left, the engine’s rebuild from the outline alone on the right.', width: 1200, height: 335 },
  },
]

interface BrickForgeModalProps {
  open: boolean
  onClose: () => void
}

export function BrickForgeModal({ open, onClose }: BrickForgeModalProps) {
  return (
    <ProjectModal
      open={open}
      onClose={onClose}
      id="brickforge-modal"
      name="Brick-forge"
      title="A brick builder that edits real LEGO designs"
      intro="My kids and I build with LEGO. We have a pile of bricks, and sometimes none of us can think of what to make. The fun is in building on and on, especially after a new box set, when we finish the model from the instructions and then play with it. Brick-forge is for the moments we run out of ideas. It takes a real LEGO design and makes a new version of it, like a house a stud longer or a car a stud wider, with building steps. I directed it and built it with Claude Code."
      sections={SECTIONS}
      technical="React, Three.js through React Three Fiber and TypeScript. On the corpus, the connection check registers 97.8% of parts as connected. Rebuilding eight official designs from their outline reaches about 0.38 on my own benchmark, where the original designer scores 1.0. Parts come from the LDraw library (CC BY 4.0) and the official models from the LDraw Official Model Repository (CC BY 2.0). The library is about 620 MB, which is too big to ship. The live site serves it from Cloudflare R2 through a small function and loads a pre-parsed pack of the most used parts first. The code is at github.com/tanawitchsaentree/brick-forge, which holds only the first version. LEGO is a trademark of the LEGO Group, which doesn’t sponsor or endorse this project."
      url={BRICKFORGE_PROJECT.url}
      linkLabel={BRICKFORGE_PROJECT.linkLabel}
      cover={
        <Image
          src="/images/brickforge-cover.webp"
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

'use client'

import Image from 'next/image'
import { ProjectModal, type ProjectSection } from './ProjectModal'
import styles from './ProjectModal.module.css'
import { BRICKFORGE_PROJECT } from '@/data/home'

const SECTIONS: ProjectSection[] = [
  { label: 'Pick what to build', body: 'Choose a race car, a city car, a house, a robot, a rocket or one of nine dinosaurs, and it offers six designs per click. The dinosaurs are built like LEGO Creator sets, with rigid sections on ball joints and legs posed by inverse kinematics.' },
  { label: 'Every design has to stand', body: "The engine checks stud clutch, overhangs and the torque on each ball joint. A design that wouldn't stand never reaches the screen." },
  { label: 'Instructions planned from the structure', body: "The instructions come from the model itself, split into sub-assemblies and chapters, with each part's place marked. Progress is saved, and the booklet prints." },
  { label: 'Built from what you own', body: 'Enter the pieces you own and it generates designs from those, plus a shopping list for anything missing.' },
  { label: 'It keeps learning', body: 'An evolutionary cookbook runs in a background worker. It builds and scores new body plans, keeps the better ones and remembers them offline.' },
  { label: 'Where it stands', body: 'Brick-forge is early, and the public repository starts with a single commit. It runs locally for now. The full LDraw part library is 600 MB and has to be downloaded separately, and without it the app falls back to a small built-in set of parts.' },
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
      title="A brick builder that designs the model for you"
      intro="Brick-forge is a 3D builder where you pick what to make and the engine designs it from real parts. I designed and built it myself."
      sections={SECTIONS}
      technical="React, Three.js through React Three Fiber, and TypeScript, about 10,000 lines. Parts come from the LDraw library (CC BY 4.0), and build scripts generate the catalogue, thumbnails and a geometry pack. LEGO is a trademark of the LEGO Group, which doesn't sponsor or endorse this project."
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

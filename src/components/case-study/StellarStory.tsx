'use client'
import { useState } from 'react'
import { StellarScreen2 } from '@/demos/stellar/ui/StellarScreen2'
import { StellarScreen3 } from '@/demos/stellar/ui/StellarScreen3'
import { HowItWorks, StorySection, StoryShell, shellStyles, useAnnounce } from './StoryShell'
import s from './StellarStory.module.css'

function StellarSections() {
  const announce = useAnnounce()
  const [resetKey, setResetKey] = useState(0)
  return (
    <>
      <StorySection id="stellar-snap" title="Snap the bottle"
        text="Take a photo of the ingredient and ask what to make with it."
        aside={<div className={shellStyles.controls}>
          <button type="button" className={s.again} onClick={() => { setResetKey(k => k + 1); announce('Chat cleared. Tap the camera to take the photo again.') }}>Start over</button>
          <HowItWorks id="stellar-how-snap">
            <p>This chat is scripted so you can try it on this page.</p>
          </HowItWorks>
        </div>}>
        <div className={s.phone}><div><StellarScreen2 announce={announce} resetKey={resetKey} /></div></div>
      </StorySection>

      <StorySection id="stellar-pick" flip title="Pick what you have"
        text="Tap what's in the fridge and press Feed me. The recipe uses what you picked and lists what you'd still need to buy."
        aside={<HowItWorks id="stellar-how-pick">
          <p>Each sample recipe lists its ingredients. Feed me chooses the recipe that uses the most of your picks, and if two tie it takes the one with less to buy.</p>
          <p>Anything in the recipe you didn&apos;t pick is marked to buy.</p>
        </HowItWorks>}>
        <div className={s.phone}><div><StellarScreen3 announce={announce} /></div></div>
      </StorySection>
    </>
  )
}

export function StellarStory() {
  return (
    <StoryShell company="Stellareat" period="2024" title="Starting from the bottle in the fridge"
      intro={'Most people open a recipe app with half a fridge and one bottle they bought for a single dish. During testing, one person scrolled past six generated recipes and then searched "random fridge things" by hand. After that we designed for the three things already wilting in her drawer.'}
      details={[['Role', 'Product Designer'], ['Scope', 'Meal discovery prototype']]}
      limits="We tested whether people picked a recipe. We didn't follow anyone into the kitchen.">
      <StellarSections />
    </StoryShell>
  )
}

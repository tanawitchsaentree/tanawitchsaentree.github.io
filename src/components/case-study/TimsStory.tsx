'use client'
import { TimsOrderDemo } from '@/demos/tims/TimsOrderSlip'
import { HowItWorks, StorySection, StoryShell, useAnnounce } from './StoryShell'

function TimsSections() {
  const announce = useAnnounce()
  return (
    <StorySection id="tims-order" stacked title="Try an order"
      text="Two XL coffees, one black, one triple-triple. Then the customer changes one to iced. Presets handle the usual combinations, and the ticket stays in view while you fix it."
      aside={<HowItWorks id="tims-how-order">
        <p>Pick XL in the size bar, choose Black in the row of presets above the drinks and tap Original Blend. Then choose Triple-Triple and tap it again.</p>
        <p>To make the black one iced, press Edit on its line and switch it to Iced. Remove and Undo work too.</p>
        <p>The POS runs in an iframe and posts its ticket and tap count to this page with postMessage. The slip checks itself against that ticket.</p>
      </HowItWorks>}>
      <TimsOrderDemo announce={announce} />
    </StorySection>
  )
}

export function TimsStory() {
  return (
    <StoryShell company="Tim Hortons" period="Personal concept" title="A POS for the orders I remember"
      intro="After two years behind the counter, I built a POS concept around the orders I took most and the changes people made at the last second."
      details={[['Role', 'Independent designer'], ['Scope', 'Counter ordering prototype']]}
      limits="A personal project, tested against orders I remember from the counter.">
      <TimsSections />
    </StoryShell>
  )
}

'use client'
import { useState } from 'react'
import { VitaeScoreCard, VitaeScorePhone } from '@/demos/vitae/Reframe/VitaeScore'
import { everyoneScore, personalCheck, type Missing, type ScoreMode } from '@/demos/vitae/Reframe/scoreModel'
import { HowItWorks, Segmented, StorySection, StoryShell, ToggleButton, shellStyles, useAnnounce } from './StoryShell'
import s from './VitaeStory.module.css'

const MODES = [['everyone', 'One score for everyone'], ['personal', 'Against your last 14 days']] as const

function VitaeSections() {
  const announce = useAnnounce()
  const [mode, setMode] = useState<ScoreMode>('everyone')
  const [missing, setMissing] = useState<Missing>(null)

  const describe = (m: ScoreMode, gap: Missing) => {
    if (m === 'everyone') { const a = everyoneScore(gap); return `${a.score} out of 100, ${a.band}.` }
    const p = personalCheck(gap)
    return `On track for you, ${p.used} of ${p.total} readings today.`
  }
  const changeMode = (m: ScoreMode) => { setMode(m); announce(describe(m, missing)) }
  const toggleSleep = () => {
    const next: Missing = missing ? null : 'sleep'
    setMissing(next)
    announce(next
      ? `Sleep removed. The everyone score now reads ${describe('everyone', next)} The personal score reads 3 of 4 readings today.`
      : `Sleep is back. ${describe(mode, next)}`)
  }

  return (
    <>
      <StorySection id="vitae-two-answers" title="Same night, two answers"
        text="Five hours of sleep scores badly on a scale made for everyone. For someone who always sleeps five hours, it was an ordinary night."
        aside={<div className={shellStyles.controls}>
          <Segmented label="Scoring rule" options={MODES} value={mode} onChange={changeMode} />
          <HowItWorks id="vitae-how-score">
            <p>The everyone score divides each reading by a fixed target and averages the four. In this demo the targets are 8 hours of sleep, 10,000 steps, 2 litres of water and a resting heart rate of 60.</p>
            <p>The personal score compares each reading with the same person&apos;s average over their last 14 days. Here a reading within 10% of that average counts as usual.</p>
            <p>The tick on each bar moves between the target and the person&apos;s usual. The readings are sample values made for this page.</p>
          </HowItWorks>
        </div>}>
        <div data-demo="vitae" className={s.surface}>
          <VitaeScorePhone mode={mode} missing={missing} />
        </div>
      </StorySection>

      <StorySection id="vitae-missing" flip title="When a reading is missing"
        text="If the watch didn't record sleep, the score doesn't fill the gap. It says it's working from three readings out of four."
        aside={<div className={shellStyles.controls}>
          <ToggleButton pressed={missing === 'sleep'} onClick={toggleSleep}>The watch missed last night&apos;s sleep</ToggleButton>
          <HowItWorks id="vitae-how-missing">
            <p>The personal score is worked out from the readings it has, and the screen says how many that was.</p>
            <p>The everyone score in this demo fills a missing night with 7 hours and shows the result as if it were measured. That lifts it from 61 to 68.</p>
          </HowItWorks>
        </div>}>
        <div data-demo="vitae" className={s.pair}>
          <VitaeScoreCard mode="everyone" missing={missing} title="One score for everyone" />
          <VitaeScoreCard mode="personal" missing={missing} title="Against your last 14 days" />
        </div>
      </StorySection>
    </>
  )
}

export function VitaeStory() {
  return (
    <StoryShell company="Vitae" period="2025" title="Scoring a day against your own last two weeks"
      intro="Our first version gave everyone the same health score out of 100. Product loved it, and we built it. Then we dropped it. A number like that sounds like a diagnosis, and a confident 78 can tell someone who is getting sick that they're fine. I redesigned the score to compare each day with that person's own last two weeks."
      details={[['Role', 'Lead Product Designer']]}
      limits="The score isn't clinically validated.">
      <VitaeSections />
    </StoryShell>
  )
}

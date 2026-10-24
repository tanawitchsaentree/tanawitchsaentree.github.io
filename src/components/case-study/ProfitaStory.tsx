'use client'
import { useRef, useState } from 'react'
import { ProfitaPhoneScreen, type ScreenName } from '@/demos/profita/ProfitaPhoneScreen'
import { CutoffClock, NEXT_DAY, TODAY, clock, isAfter } from '@/demos/profita/ProfitaCutoff'
import { HowItWorks, StorySection, StoryShell, shellStyles, useAnnounce } from './StoryShell'
import s from './ProfitaStory.module.css'

const STRIP: { screen: ScreenName; caption: string }[] = [
  { screen: 'fund', caption: 'Fund list' },
  { screen: 'funddetail', caption: 'Fund details' },
  { screen: 'buyamount', caption: 'Amount' },
  { screen: 'portfolio', caption: 'Portfolio' },
]

// The phones here are pictures of the screens. Their buttons would do nothing, so keep them out of the tab order.
// `inert` also hides them from screen readers, so each phone has a text summary beside it that follows the clock.
const inert = (el: HTMLElement | null) => { el?.setAttribute('inert', '') }

const AWARD = <>In 2023 LH Bank received Highly Commended for Best App for Customer Experience at the Retail Banker International Asia Trailblazer Awards. <a href="https://hs.meed.com/hubfs/MEED/MEED%20Events/Special%20Reports/RBI/RBI%20Special%20Report%202023-1.pdf#page=14" target="_blank" rel="noopener noreferrer">Award report, page 14 (PDF) ↗</a></>

function ProfitaSections() {
  const announce = useAnnounce()
  const [minutes, setMinutes] = useState(14 * 60 + 50)
  const wasAfter = useRef(isAfter(minutes))
  const after = isAfter(minutes)
  const effective = after ? NEXT_DAY : TODAY

  const change = (m: number) => {
    setMinutes(m)
    const nowAfter = isAfter(m)
    if (nowAfter !== wasAfter.current) {
      wasAfter.current = nowAfter
      announce(nowAfter ? 'After the cutoff. The effective date moves to Monday 2 November.' : 'Before the cutoff. The effective date is today, Friday 30 October.')
    }
  }

  return (
    <>
      <StorySection id="profita-cutoff" title="Before the cutoff, or after"
        text="Send the order before the cutoff and it counts for today. Send it after and it moves to the next business day. The confirm screen shows both dates before you agree."
        aside={<div className={shellStyles.controls}>
          <CutoffClock minutes={minutes} onChange={change} />
          <HowItWorks id="profita-how-cutoff">
            <p>Orders sent before the cutoff are priced at the end of that business day. Orders sent after it wait for the next one, so a Friday evening order is priced on Monday.</p>
            <p>The money leaves the account when you confirm, on either side of the cutoff.</p>
            <p>The 15:30 cutoff here is a sample. Each fund sets its own, and the fund details screen lists it.</p>
          </HowItWorks>
        </div>}>
        <div className={s.phone} data-demo="profita" ref={inert}><div><ProfitaPhoneScreen screen="confirm" cutoff={{ time: clock(minutes), cutoff: '15:30', after, today: TODAY, nextDay: NEXT_DAY }} /></div></div>
        <p className={shellStyles.srOnly}>Confirm screen. Order sent at {clock(minutes)}, {after ? 'after' : 'before'} the 15:30 cutoff. Transaction date {TODAY}. Effective date {effective}.</p>
      </StorySection>

      <StorySection id="profita-receipt" flip title="A receipt that doesn't overpromise"
        text="The receipt says the order was received. The price comes later, and the receipt says that too."
        aside={<HowItWorks id="profita-how-receipt">
          <p>The transaction date is when the order was sent. The effective date is when the fund prices it, and the units stay empty until then.</p>
          <p>This receipt follows the time set on the clock above.</p>
        </HowItWorks>}>
        <div className={s.phone} data-demo="profita" ref={inert}><div><ProfitaPhoneScreen screen="ordersuccess" receiptDates={{ transaction: TODAY, effective, time: clock(minutes) }} /></div></div>
        <p className={shellStyles.srOnly}>Receipt. Order received. Transaction date {TODAY} at {clock(minutes)}. Effective date {effective}. Units are shown after pricing.</p>
      </StorySection>

      <section className={s.strip} aria-labelledby="profita-strip-title">
        <h2 id="profita-strip-title">Other screens in the purchase flow</h2>
        <div className={s.stripRow}>
          {STRIP.map(item => <figure key={item.screen}><div className={s.mini} data-demo="profita" ref={inert} aria-hidden="true"><div><ProfitaPhoneScreen screen={item.screen} /></div></div><figcaption>{item.caption}<span className={shellStyles.srOnly}> screen (picture)</span></figcaption></figure>)}
        </div>
      </section>
    </>
  )
}

export function ProfitaStory() {
  return (
    <StoryShell company="Robowealth · LH Bank" period="2020" title="When a fund order really happens"
      intro="In 2020 I designed how LH Bank customers buy mutual funds in the Profita app. The money leaves the account today, but the fund is priced after the cutoff, often on the next business day. So every screen in the purchase flow had to be clear about when the order really happens."
      details={[['Role', 'Senior UX/UI Designer'], ['Recognition', AWARD]]}
      limits="Screens recreated for this portfolio with sample data.">
      <ProfitaSections />
    </StoryShell>
  )
}

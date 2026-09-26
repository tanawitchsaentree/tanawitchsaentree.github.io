'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ProfitaPhoneScreen, type PurchaseAccount, type PurchaseDemoProps, type ScreenName } from '@/demos/profita/ProfitaPhoneScreen'
import styles from './ProfitaCase.module.css'
import { ProjectHero } from '@/components/case-study/ProjectHero'

const steps: { title: string; text: string; screen: ScreenName }[] = [
  { title: 'Browse funds', text: 'The fund list groups options by category. Each row shows the fund name, risk level, and past performance.', screen: 'fund' },
  { title: 'Read the details', text: 'Trading information sits in its own tab. This example shows minimum purchase amounts, order cutoffs, and fees.', screen: 'funddetail' },
  { title: 'Enter an amount', text: 'Use the keypad or choose a preset amount. The minimum purchase and payment account stay visible.', screen: 'buyamount' },
  { title: 'Review the order', text: 'Check the fund, payment account, amount, and dates before confirming the purchase.', screen: 'confirm' },
]
const overview: { title: string; text: string; screen: ScreenName }[] = [
  { title: 'Home', text: 'Fund highlights and recommendations sit alongside an entry to Robo Advisor.', screen: 'feed' },
  { title: 'Robo Advisor', text: 'Investments are grouped into plans, with a current value for each one.', screen: 'robo' },
  { title: 'Portfolio', text: 'The overview brings together total value, gains and losses, and individual holdings.', screen: 'portfolio' },
]
const supporting: { title: string; text: string; screen: ScreenName }[] = [
  { title: 'Order received', text: 'The receipt separates submission from processing and keeps the order details together.', screen: 'ordersuccess' },
  { title: 'Switch funds', text: 'Enter the amount to switch in baht or units, or choose a proportion of the holding.', screen: 'switchfund' },
  { title: 'Savings account', text: 'View the account balance and transaction history.', screen: 'savings' },
  { title: 'Payment account', text: 'Choose the account to use for a purchase.', screen: 'buyaccount' },
]
function Phone({ screen, purchase }: { screen: ScreenName; purchase?: PurchaseDemoProps }) {
  return <div className={styles.phone}><div><ProfitaPhoneScreen screen={screen} purchase={purchase} /></div></div>
}

const SAMPLE_ACCOUNT: PurchaseAccount = { name: 'Savings account', number: '221-1-12345-1', balance: 40000 }

export function ProfitaClient() {
  const [purchaseScreen, setPurchaseScreen] = useState<ScreenName>('fund')
  const [amount, setAmount] = useState('5000')
  const [account, setAccount] = useState<PurchaseAccount>(SAMPLE_ACCOUNT)
  const step = steps.findIndex(item => item.screen === purchaseScreen)
  const purchase: PurchaseDemoProps = {
    amount,
    account,
    onAmountChange: setAmount,
    onNavigate: setPurchaseScreen,
    onAccountChange: setAccount,
  }
  return (
    <main className={styles.page} data-demo="profita">
      <nav className={styles.nav} aria-label="Project navigation"><Link href="/">← Portfolio</Link><span>Profita · LH Bank</span><a href="#purchase">Purchase screens</a></nav>
      <ProjectHero company="Profita · LH Bank" period="2020" title="Browsing and buying mutual funds"
        intro="I designed Profita’s purchase flow at Robowealth for LH Bank, bringing fund details, payment choices, and order review into a sequence the product team could work through with customers."
        details={[["Role", "Senior UX/UI Designer"], ["Company", "Robowealth"], ["Scope", "Fund discovery and purchase"]]} />
      <section className={styles.section} aria-labelledby="overview-title">
        <div className={styles.sectionHead}><h2 id="overview-title">Finding your way around</h2><p>Fund browsing, Robo Advisor plans, and portfolio tracking each have a place in the navigation.</p></div>
        <p className={styles.note}>Screens recreated for this portfolio with sample data and edited interface text. The purchase walkthrough below is connected; the overview and supporting screens remain individual examples.</p>
        <div className={styles.overview}>{overview.map(item => <figure key={item.screen}><Phone screen={item.screen} /><figcaption><h3>{item.title}</h3><p>{item.text}</p></figcaption></figure>)}</div>
      </section>
      <section id="purchase" className={styles.section} aria-labelledby="purchase-title">
        <div className={styles.sectionHead}><h2 id="purchase-title">From a fund to an order</h2><p>Choose a step to see the fund information, amount, and order review.</p></div>
        <div className={styles.walkthrough}>
          <div className={styles.steps}>{steps.map((item, i) => <button type="button" key={item.screen} aria-pressed={step === i} aria-controls="purchase-example" onClick={() => setPurchaseScreen(item.screen)} className={step === i ? styles.active : undefined}><span className={styles.number}>0{i + 1}</span><span><strong>{item.title}</strong><span>{item.text}</span></span></button>)}</div>
          <figure id="purchase-example" className={styles.example} aria-label={step >= 0 ? steps[step].title : 'Sample order received'}><Phone screen={purchaseScreen} purchase={purchase} /><figcaption>{step >= 0 ? `${step + 1} / ${steps.length} · ${steps[step].title}` : 'Sample order received · pending processing'}</figcaption></figure>
        </div>
      </section>
      <section className={styles.section} aria-labelledby="accounts-title">
        <div className={styles.sectionHead}><h2 id="accounts-title">Orders and accounts</h2><p>The supporting screens cover receipts and payment accounts.</p></div>
        <div className={styles.supporting}>{supporting.map(item => <figure key={item.screen}><Phone screen={item.screen} /><figcaption><h3>{item.title}</h3><p>{item.text}</p></figcaption></figure>)}</div>
      </section>
      <footer className={styles.footer}><h2>Project notes</h2><p>My contribution was in 2020. Profita continued to develop after that. In 2023, LH Bank received Highly Commended for Best App for Customer Experience at the Retail Banker International Asia Trailblazer Awards.</p><a href="https://hs.meed.com/hubfs/MEED/MEED%20Events/Special%20Reports/RBI/RBI%20Special%20Report%202023-1.pdf#page=14" target="_blank" rel="noopener noreferrer">Read the award report · page 14 (PDF) ↗</a><Link className={styles.back} href="/">← Back to portfolio</Link></footer>
    </main>
  )
}

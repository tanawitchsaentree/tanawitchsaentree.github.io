'use client'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { StellarScreen1 } from '@/demos/stellar/ui/StellarScreen1'
import { StellarScreen2 } from '@/demos/stellar/ui/StellarScreen2'
import { StellarScreen3 } from '@/demos/stellar/ui/StellarScreen3'
import { ClaimsSkeleton } from '@/demos/claims/ClaimsSkeleton'
import { TimsiPadMockup } from '@/demos/tims/TimsiPadMockup'
import { VitaeAppScreen } from '@/demos/vitae/Reframe/VitaeAppScreen'
import s from './CompactStories.module.css'
import { ProjectHero } from './ProjectHero'

function Story({ company, period, contribution, scope, title, intro, children }: { company:string; period:string; contribution:string; scope:string; title:string; intro:string; children:ReactNode }) {
 return <main className={s.story}><Link href="/">← Portfolio</Link><ProjectHero company={company} period={period} title={title} intro={intro} details={[["Role", contribution], ["Scope", scope]]} />{children}<footer><Link href="/">← Back to selected work</Link></footer></main>
}
export function StellarStory() {
 return <Story company="Stellareat" period="2024" contribution="Product Designer" scope="Meal discovery prototype" title="Meal ideas from ingredients at home" intro="I designed a cooking app for Stellareat that connects ingredients, meal suggestions, and saved recipes. The prototype gave the team a way to explore how someone moves from checking the fridge to choosing dinner.">
 <section><h2>Choosing what to cook</h2><p>People can describe what they have, browse ideas, or select ingredients. I kept these routes together so they could change approach without starting over.</p><p className={s.note}>Three independent sample screens. The first two replay scripted suggestions; the ingredient picker starts paused and can be used directly.</p><div className={s.gallery}>
 {[{ Screen:StellarScreen1,caption:'Describe ingredients and review a suggestion.' },{Screen:StellarScreen2,caption:'Explore meal ideas.'},{Screen:StellarScreen3,caption:'Select ingredients for a recipe.'}].map(({Screen,caption})=><figure key={caption}><div className={s.phone}><div><Screen /></div></div><figcaption>{caption}</figcaption></figure>)}
 </div></section><section><h2>What still needs testing</h2><p>The prototype explores choosing a meal. It does not establish whether people cook the recipes, keep their pantry updated, or waste less food.</p></section></Story>
}
export function ClaimsStory() {
 return <Story company="Commercial insurance" period="Workflow design" contribution="Design lead" scope="Claims workflows and working prototypes" title="Reviewing a claims workflow together" intro="I lead design on a commercial claims platform and build working interfaces for the team to review. These examples make the rules behind a claim visible alongside the actions a handler can take.">
 <p className={s.note}>Recreated workflow with sample data.</p><ClaimsSkeleton />
 <section><h2>From prototype to implementation</h2><p>I use the working flow to review states and acceptance criteria with the team. Production integration, automated tests, and security review remain engineering work beyond this example.</p></section></Story>
}
export function TimsStory() {
 return <Story company="Tim Hortons" period="Personal concept" contribution="Independent designer" scope="Counter ordering prototype" title="A POS for the orders I remember" intro="After two years behind the counter, I built a POS concept around common orders and last-minute changes. Presets handle familiar combinations while the ticket stays visible, letting me try the flow against situations I remembered from work.">
 <section><h2>Try an order</h2><p>Add a double-double, change a drink, or build an order for several people. The prototype keeps the ticket beside the controls.</p><div className={s.wide}><TimsiPadMockup /></div><a href="/demos/tims-pos.html" target="_blank" rel="noopener noreferrer">Open the terminal in a full window ↗</a></section>
 <section><h2>Scope of the exercise</h2><p>I used remembered customer situations to walk through the design. This was an independent concept, not a Tim Hortons commission or a study with recruited customers. It does not demonstrate faster service in a working store.</p></section></Story>
}
export function VitaeStory() {
 return <Story company="Vitae" period="2025" contribution="Lead Product Designer" scope="Daily health signals" title="Putting daily readings in context" intro="I worked with product, clinical, and engineering colleagues on how Vitae explains daily health signals. A view based on someone’s recent readings gave the team a concrete way to review what a score means and what it leaves out.">
 <section className={s.single}><div><h2>Show the basis for the score</h2><p>I designed the summary around a personal baseline, with the individual inputs available underneath. The example shows how someone can move from the daily number to the readings behind it.</p><p className={s.note}>Scripted interface example with sample readings. The score is not a validated measure of health.</p></div><figure><VitaeAppScreen /></figure></section>
 <section><h2>Questions the interface cannot settle</h2><p>The scoring method, missing readings, and changes in someone’s usual pattern need separate validation. A personal baseline alone does not establish accuracy or clinical safety.</p></section></Story>
}

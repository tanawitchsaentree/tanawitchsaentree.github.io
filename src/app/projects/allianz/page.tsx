import Link from 'next/link'
import { UniverseHero } from '@/components/universe/UniverseHero'
import { SubCaseGimmick } from '@/components/allianz/SubCaseInteractive'
import { SubCaseShell } from '@/components/allianz/SubCaseShell'
import { getUniverseSubCases } from '@/lib/universes'

export const dynamic = 'force-static'

export default function AllianzPage() {
  const subCases = getUniverseSubCases('allianz')
  return (
    <>
      <UniverseHero />
      <nav aria-label="Document workflows" className="px-6 md:px-12 lg:px-20 xl:px-[7.5rem] pb-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-[var(--fg-muted)]">
        {subCases.map(sc => <a key={sc.slug} href={`#${sc.slug}`} className="underline underline-offset-4">{sc.title}</a>)}
      </nav>
      <main id="main-content">
        <p className="px-6 md:px-12 lg:px-20 xl:px-[7.5rem] pb-8 text-xs leading-relaxed text-[var(--fg-muted)]">Interactive examples with sample documents and predefined results.</p>
        {subCases.map((sc, i) => (
          <section key={sc.slug} id={sc.slug} className="scroll-mt-8">
            <SubCaseShell slug={sc.slug} index={i} title={sc.title} tags={sc.tags} sections={sc.sections}>
              <SubCaseGimmick slug={sc.slug} />
            </SubCaseShell>
          </section>
        ))}
      </main>
      <footer className="px-6 md:px-12 lg:px-20 xl:px-[7.5rem] py-12 md:py-16">
        <div className="max-w-[72rem] mx-auto">
          <Link href="/" className="inline-block mt-8 text-sm underline underline-offset-4">← Back to portfolio</Link>
        </div>
      </footer>
    </>
  )
}

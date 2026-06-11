import { UniverseHero } from '@/components/universe/UniverseHero'
import { UniverseClient } from '@/components/universe/UniverseClient'
import { SubCaseGimmick } from '@/components/allianz/SubCaseInteractive'
import { SubCaseShell } from '@/components/allianz/SubCaseShell'
import { DiagramVault } from '@/components/allianz/DiagramVault'
import { getUniverseSubCases } from '@/lib/universes'
import { DecodeText } from '@/components/ui/DecodeText'
import { cn } from '@/lib/cn'

export const dynamic = 'force-static'

export default function AllianzPage() {
  const subCases = getUniverseSubCases('allianz')

  return (
    <>
      <UniverseHero />

      <UniverseClient subCases={subCases} />

      <main id="main-content">
        {subCases.map((sc, i) => (
          <div key={sc.slug} id={sc.slug}>
            <SubCaseShell
              slug={sc.slug}
              index={i}
              title={sc.title}
              tags={sc.tags}
              sections={sc.sections}
            >
              <SubCaseGimmick slug={sc.slug} />
            </SubCaseShell>
          </div>
        ))}
      </main>

      <DiagramVault />

      <ClosingSection />

      {/* Footer nav */}
      <footer
        className={cn(
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'py-16 md:py-24',
          'border-t border-[var(--border)]'
        )}
      >
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase',
            'text-[var(--fg-muted)] opacity-60'
          )}
        >
          Allianz Technology · 2024–2025
        </p>
      </footer>
    </>
  )
}


const PRINCIPLES = [
  {
    name: 'Lock the contract, not the look',
    body: 'What scales across operators, configurators, and hospitals is clarity about what changes and what doesn\'t. Visual flexibility is fine. Behavioral inconsistency is not. The confidence gate, the review card structure, the fallback queue SLA — those are the contract. The color of a confidence badge is not.',
  },
  {
    name: 'Fallback before happy path',
    body: 'I designed the review card, the fallback queue, and the "confidently wrong" failure mode before I touched the standard classification flow. The AI is wrong more often than the people commissioning it expect. Design the unhappy path first, or you\'ll design it never.',
  },
  {
    name: 'Uncertainty is a UI state, not an error state',
    body: 'An error asks you to fix something. Uncertainty asks you to decide something. The entire confidence gate rests on this distinction. Treating low confidence as an error produces a blame loop — operators look for who broke it. Treating it as a handoff state produces a decision loop — operators own the call.',
  },
  {
    name: 'Governance is a UI, not a doc',
    body: 'If the approval workflow needs a wiki to explain it, the design failed. The draft → test → approve → publish sequence has to be self-evident from the interface. A prompt is a policy document. It should behave like one — with states, reviewers, and a publish moment — not like a config file someone edits and hopes for the best.',
  },
  {
    name: 'Design systems are now read by AI agents',
    body: 'The prompt layer is a machine-readable contract. Every classification rule, every confidence threshold, every fallback condition — the AI reads all of it. The design system has to be legible to the model, not just the human configurator. If a prompt is ambiguous to a person, it\'s ambiguous to the model. That ambiguity is a bug, not a feature request.',
  },
] as const

const UNRESOLVED = [
  {
    heading: 'Confidence thresholds are still static',
    body: 'Every document type — claim, invoice, legal notice — uses the same review threshold. A misrouted legal notice has different downstream consequences than a misrouted supplier invoice. The threshold should adapt to document type, historical accuracy rates, and downstream cost of error. It doesn\'t, because that calibration requires historical volume per category that didn\'t exist when we shipped. The system works. It\'s wrong for everyone in slightly different ways.',
  },
  {
    heading: 'Prompt versioning has no A/B layer',
    body: 'Configurators iterate sequentially — publish v3, observe, publish v4. There\'s no way to run two competing prompt strategies against the same document type simultaneously and compare outcomes. When two configurators have different opinions about how a document type should be classified, the only resolution path is "try one, wait, try the other." That\'s slow, and it means the person who publishes second wins regardless of whether their prompt is better.',
  },
  {
    heading: 'The confidently wrong failure mode is still undetected',
    body: 'The fallback system catches uncertainty the AI knows about — low confidence, unrecognized document type. It does not catch the AI being confidently wrong. A document classified at 0.92 to the wrong category routes straight through all three layers without triggering any review. That\'s the harder problem. Solving it requires either post-hoc accuracy auditing (expensive, slow) or a fundamentally different approach to how the model communicates its own reliability. I don\'t have a clean answer for it yet.',
  },
] as const

function ClosingSection() {
  return (
    <section
      id="closing"
      aria-labelledby="closing-heading"
      className={cn(
        'border-t border-[var(--border)]',
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-24 md:py-32'
      )}
    >
      {/* Section eyebrow */}
      <p className={cn(
        'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-4',
        'text-[var(--accent-text)]'
      )}>
        Bringing it together
      </p>

      <h2
        id="closing-heading"
        className={cn(
          'font-display font-normal',
          'text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.1] tracking-[-0.02em]',
          'text-[var(--fg)] mb-4 max-w-[32ch]'
        )}
      >
        <DecodeText text="Three layers. One system." />
        <br />
        <em className="not-italic text-[var(--fg-muted)]">Fix one, the other two still break.</em>
      </h2>

      <p className={cn(
        'text-[var(--type-base)] leading-[1.7] tracking-[-0.011em]',
        'text-[var(--fg-muted)] max-w-[60ch] mb-16'
      )}>
        The document classification surface, the prompt management layer, and the fallback queue weren&apos;t three separate problems. A better confidence gate still needs correct prompts behind it. Correct prompts still need a fallback when the AI is wrong. Designing any one layer in isolation produces something that holds until the adjacent layer fails — which it does.
      </p>

      {/* System overview diagram */}
      <div className={cn(
        'relative w-full max-w-[80rem] mb-20',
        'rounded-[var(--radius-xl)] overflow-hidden',
        'border border-[var(--border)]',
        'bg-[var(--bg-elevated)]'
      )}
        style={{ aspectRatio: '3/2' }}
        data-cursor="diagram"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/projects/allianz/screen-system-overview.svg"
          alt="System overview — three interdependent layers"
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Principles */}
      <div className="mb-20 max-w-[80rem]">
        <p className={cn(
          'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-10',
          'text-[var(--fg-subtle)]'
        )}>
          Transferable principles
        </p>

        <dl className="flex flex-col divide-y divide-[var(--border)]">
          {PRINCIPLES.map((p, i) => (
            <div
              key={p.name}
              className={cn(
                'grid md:grid-cols-[1fr_2fr] gap-6 md:gap-16',
                'py-8 md:py-10'
              )}
            >
              <dt className="flex items-start gap-4">
                <span className={cn(
                  'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                  'text-[var(--fg-subtle)] flex-shrink-0 mt-[3px]'
                )}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className={cn(
                  'font-display font-normal italic',
                  'text-[var(--type-xl)] leading-[1.1] tracking-[-0.02em]',
                  'text-[var(--fg)]'
                )}>
                  {p.name}
                </span>
              </dt>
              <dd className={cn(
                'text-[var(--type-base)] leading-[1.75] tracking-[-0.011em]',
                'text-[var(--fg-muted)]'
              )}>
                {p.body}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* What's still unresolved */}
      <div className="max-w-[80rem]">
        <p className={cn(
          'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-10',
          'text-[var(--fg-subtle)]'
        )}>
          What&apos;s still unresolved
        </p>

        <div className="grid md:grid-cols-3 gap-10">
          {UNRESOLVED.map(item => (
            <div key={item.heading} className="border-t border-[var(--border)] pt-6">
              <p className={cn(
                'font-display font-normal',
                'text-[var(--type-lg)] leading-[1.2] tracking-[-0.018em]',
                'text-[var(--fg)] mb-4'
              )}>
                {item.heading}
              </p>
              <p className={cn(
                'text-[var(--type-sm)] leading-[1.75] tracking-[-0.008em]',
                'text-[var(--fg-muted)]'
              )}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


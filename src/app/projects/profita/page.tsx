import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { UniverseClient } from '@/components/universe/UniverseClient'
import { getUniverseSubCases } from '@/lib/universes'
import { cn } from '@/lib/cn'

export const dynamic = 'force-static'

// ─── Universe nav (glass switcher) ──────────────────────────────
// Shows Allianz · Profita · Invitrace — Profita is active.
// Same glass blur pattern as Allianz sub-case switcher, reused at
// page level to navigate between universe routes.
function UniverseNav() {
  const universes = [
    { label: 'Allianz', href: '/projects/allianz' },
    { label: 'Profita', href: '/projects/profita' },
    { label: 'Invitrace', href: '/projects/invitrace' },
  ] as const

  return (
    <nav
      aria-label="Universe navigation"
      className={cn(
        'inline-flex gap-1 p-1',
        'rounded-full border border-[color-mix(in_oklab,var(--border)_80%,transparent)]',
        'bg-[color-mix(in_oklab,var(--bg)_60%,transparent)]',
        '[backdrop-filter:blur(20px)_saturate(1.4)]',
        '[-webkit-backdrop-filter:blur(20px)_saturate(1.4)]',
        'shadow-[var(--shadow-card)]'
      )}
    >
      {universes.map(u => {
        const isActive = u.label === 'Profita'
        return (
          <Link
            key={u.label}
            href={u.href}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'px-4 py-2 rounded-full no-underline',
              'font-mono text-[var(--type-xs)] uppercase tracking-widest',
              'transition-all duration-[240ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]',
              isActive
                ? 'bg-[var(--bg-elevated)] text-[var(--fg)] shadow-[var(--shadow-sm)]'
                : 'text-[var(--fg-muted)] hover:text-[var(--fg)]'
            )}
          >
            {u.label}
          </Link>
        )
      })}
    </nav>
  )
}

// ─── Screen placeholder ─────────────────────────────────────────
function ScreenPlaceholder({ label }: { label: string }) {
  return (
    <div
      className={cn(
        'w-full max-w-[80rem]',
        'border border-[var(--border)]',
        'rounded-[var(--radius-xl)]',
        'flex items-center justify-center',
        'bg-[var(--bg-elevated)]'
      )}
      style={{ aspectRatio: '16/9' }}
      aria-label={label}
      role="img"
    >
      <p
        className={cn(
          'font-display italic',
          'text-[var(--type-base)] text-[var(--fg-muted)]',
          'opacity-50 text-center px-6'
        )}
      >
        {label}
      </p>
    </div>
  )
}

// ─── Pull quote ─────────────────────────────────────────────────
function PullQuote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      className={cn(
        'font-display italic font-normal',
        'text-[clamp(1.25rem,2.5vw,1.875rem)] leading-[1.35] tracking-[-0.02em]',
        'text-[var(--fg)]',
        'max-w-[28ch]',
        'border-l-2 border-[var(--accent)] pl-6',
        'm-0'
      )}
    >
      {children}
    </blockquote>
  )
}

// ─── Body copy wrapper ──────────────────────────────────────────
function BodyCopy({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={cn(
        'max-w-[65ch]',
        '[&_p]:text-[var(--type-base)] [&_p]:leading-[1.75] [&_p]:tracking-[-0.011em]',
        '[&_p]:text-[var(--fg-muted)]',
        '[&_p+p]:mt-[var(--space-8)]'
      )}
    >
      {children}
    </div>
  )
}

// ─── Award badge ────────────────────────────────────────────────
function AwardBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1.5',
        'border border-[var(--border)]',
        'rounded-full',
        'font-mono text-[var(--type-xs)] tracking-wide uppercase',
        'text-[var(--fg-muted)]',
        'bg-[var(--bg-elevated)]'
      )}
    >
      {children}
    </span>
  )
}

// ─── Page ───────────────────────────────────────────────────────
export default function ProfitaPage() {
  const subCases = getUniverseSubCases('profita')

  return (
    <>
      {/* ── Block 1: Universe Hero ─────────────────────────────── */}
      <header
        className={cn(
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'pt-24 pb-16 md:pt-32 md:pb-20'
        )}
      >
        {/* Back link */}
        <Link
          href="/"
          className={cn(
            'inline-flex items-center gap-2 mb-10',
            'font-mono text-[var(--type-xs)] tracking-widest uppercase',
            'text-[var(--fg-muted)] hover:text-[var(--fg)]',
            'no-underline transition-colors duration-[var(--duration-fast)]'
          )}
        >
          <span aria-hidden="true">←</span>
          <span>Back to work</span>
        </Link>

        {/* Brand label eyebrow */}
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-4',
            'text-[var(--accent-text)]'
          )}
        >
          FINTECH · CONSUMER UX
        </p>

        {/* Headline */}
        <h1
          className={cn(
            'font-display font-normal',
            'text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] tracking-[-0.04em]',
            'text-[var(--fg)]',
            'max-w-[22ch] mb-6'
          )}
        >
          Profita
        </h1>

        {/* Pull line */}
        <p
          className={cn(
            'font-display italic font-normal',
            'text-[clamp(1.25rem,2.5vw,2rem)] leading-[1.35] tracking-[-0.02em]',
            'text-[var(--fg-muted)]',
            'max-w-[36ch] mb-10'
          )}
        >
          Designing financial confidence for users who started with anxiety.
        </p>

        {/* Meta strip */}
        <dl
          className={cn(
            'flex flex-wrap gap-x-8 gap-y-3 mb-8',
            'font-mono text-[var(--type-xs)] tracking-widest uppercase'
          )}
        >
          {[
            ['Role', 'Senior UX/UI Designer'],
            ['Year', '2020'],
            ['Client', 'Robowealth × LH Bank'],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-[var(--fg-muted)] opacity-60">{label}</dt>
              <dd className="text-[var(--fg)]">{value}</dd>
            </div>
          ))}
        </dl>

        {/* Award badges */}
        <div className="flex flex-wrap gap-3">
          <AwardBadge>Best App for Customer Experience 2023</AwardBadge>
          <AwardBadge>Retail Banker International Asia Trailblazer Awards</AwardBadge>
        </div>
      </header>

      {/* ── Glass universe switcher (sticky) ──────────────────── */}
      <div
        className={cn(
          'sticky top-6 z-30',
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'pointer-events-none mb-[-1.5rem]'
        )}
      >
        <div className="inline-block pointer-events-auto">
          <UniverseNav />
        </div>
      </div>

      {/* ── Sub-case scroll nav (same glass switcher as Allianz) ── */}
      <div
        className={cn(
          'sticky top-[4.5rem] z-20',
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'pointer-events-none mt-3'
        )}
      >
        <div className="inline-block pointer-events-auto">
          <UniverseClient subCases={subCases} />
        </div>
      </div>

      {/* ── Block 2: Cover image placeholder ──────────────────── */}
      <section
        className={cn(
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'pt-[var(--space-16)] pb-[var(--space-32)]'
        )}
      >
        <ScreenPlaceholder label="[ Profita app cover — TBD ]" />
      </section>

      {/* ── Blocks 3–5: Sub-cases ─────────────────────────────── */}
      <main id="main-content">
        {subCases.map(sc => (
          <div key={sc.slug} id={sc.slug}>
            <SubCaseSection subCase={sc} />
          </div>
        ))}
      </main>

      {/* ── Block 6: Closer ───────────────────────────────────── */}
      <section
        className={cn(
          'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
          'py-[var(--space-32)]',
          'border-t border-[var(--border)]'
        )}
      >
        <p
          className={cn(
            'font-display italic font-normal',
            'text-[clamp(1.25rem,2.5vw,1.875rem)] leading-[1.35] tracking-[-0.02em]',
            'text-[var(--fg-muted)]',
            'max-w-[52ch]'
          )}
        >
          {/* TODO Nat: does this closer feel honest to your experience? */}
          &ldquo;Profita taught me that finance UX isn&apos;t about making complexity simple.
          It&apos;s about making complexity optional.&rdquo;
        </p>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
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
          Robowealth × LH Bank · 2020
        </p>
      </footer>
    </>
  )
}

// ─── Sub-case section (server) ──────────────────────────────────
async function SubCaseSection({
  subCase,
}: {
  subCase: ReturnType<typeof getUniverseSubCases>[number]
}) {
  // Map sub-case slugs to their placeholder labels
  const PLACEHOLDER_SCREENS: Record<string, [string, string]> = {
    'behavioral-insight': [
      '[ Screen A: Before — transactional dashboard ]',
      '[ Screen B: After — supportive dashboard ]',
    ],
    'data-viz-pivot': [
      '[ Screen A: Dense original dashboard ]',
      '[ Screen B: Progressive disclosure version ]',
    ],
    'stakeholder-negotiation': [
      '[ Screen A: Layered disclaimer pattern ]',
      '[ Screen B: Confirm-before-act screen ]',
    ],
  }

  // Map order to eyebrow fraction label
  const EYEBROW: Record<number, string> = {
    1: '01 / 03',
    2: '02 / 03',
    3: '03 / 03',
  }

  const screens = PLACEHOLDER_SCREENS[subCase.slug] ?? []
  const eyebrow = EYEBROW[subCase.order] ?? `0${subCase.order} / 03`

  return (
    <article
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-[var(--space-32)]',
        'border-b border-[var(--border)] last:border-b-0'
      )}
    >
      {/* Case header — eyebrow + title + pull quote */}
      <div className="mb-[var(--space-12)] max-w-[80rem]">
        <p
          className={cn(
            'font-mono text-[var(--type-xs)] tracking-widest uppercase mb-3',
            'text-[var(--accent-text)]'
          )}
        >
          {eyebrow} · {subCase.tags.slice(0, 1).join('')}
        </p>

        <h2
          className={cn(
            'font-display font-normal',
            'text-[clamp(1.75rem,4vw,3rem)] leading-[1.05] tracking-[-0.032em]',
            'text-[var(--fg)] mb-[var(--space-16)]'
          )}
        >
          {subCase.title}
        </h2>

        <PullQuote>{subCase.tagline}</PullQuote>
      </div>

      {/* Screen placeholders — 2-up grid */}
      {screens.length > 0 && (
        <div
          className={cn(
            'grid grid-cols-1 md:grid-cols-2 gap-6',
            'mb-[var(--space-16)] max-w-[80rem]'
          )}
        >
          {screens.map(label => (
            <ScreenPlaceholder key={label} label={label} />
          ))}
        </div>
      )}

      {/* MDX body */}
      <div
        className={cn(
          'max-w-[65ch]',
          '[&_h2]:font-display [&_h2]:font-normal [&_h2]:text-[var(--type-xl)]',
          '[&_h2]:leading-[1.2] [&_h2]:tracking-[-0.02em]',
          '[&_h2]:text-[var(--fg)] [&_h2]:mt-[var(--space-12)] [&_h2]:mb-[var(--space-8)]',
          '[&_h3]:font-sans [&_h3]:font-medium [&_h3]:text-[var(--type-base)]',
          '[&_h3]:text-[var(--fg)] [&_h3]:mt-[var(--space-8)] [&_h3]:mb-3',
          '[&_p]:text-[var(--type-base)] [&_p]:leading-[1.75] [&_p]:tracking-[-0.011em]',
          '[&_p]:text-[var(--fg-muted)] [&_p]:mb-[var(--space-8)]',
          '[&_strong]:text-[var(--fg)] [&_strong]:font-medium',
          '[&_ul]:list-none [&_ul]:p-0 [&_ul]:m-0 [&_ul]:mb-[var(--space-8)]',
          '[&_li]:relative [&_li]:pl-4 [&_li]:mb-2',
          '[&_li]:text-[var(--fg-muted)] [&_li]:text-[var(--type-base)] [&_li]:leading-[1.75]',
          '[&_li]:before:content-["—"] [&_li]:before:absolute [&_li]:before:left-0',
          '[&_li]:before:text-[var(--accent-text)] [&_li]:before:font-mono'
        )}
      >
        <MDXRemote source={subCase.content} />
      </div>
    </article>
  )
}

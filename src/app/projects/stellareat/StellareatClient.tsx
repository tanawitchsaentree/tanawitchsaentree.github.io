'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'
import { CookModeShift } from '@/demos/stellareat'
import { FridgeEntry } from '@/demos/stellareat/FridgeEntry'
import { CommunityOwnership } from '@/demos/stellareat/CommunityOwnership'
import { DecodeText } from '@/components/ui/DecodeText'

// ── One face across the site = Inter ──
const FONT_DISPLAY = "'Inter Variable', 'Inter', sans-serif"
const FONT_BODY    = "'Inter Variable', 'Inter', sans-serif"

// ── Back navigation (exact same pattern as UniverseHero / InvitraceClient) ──
function BackLink() {
  const router = useRouter()

  const handleBack = useCallback(() => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document) {
      ;(document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => { router.push('/') })
    } else {
      router.push('/')
    }
  }, [router])

  return (
    <button
      type="button"
      onClick={handleBack}
      className={cn(
        'inline-flex items-center gap-2',
        'text-[var(--fg-muted)] hover:text-[var(--fg)]',
        'transition-colors border-none bg-transparent p-0 cursor-pointer'
      )}
      style={{
        fontFamily:    FONT_BODY,
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.12em',
        transitionDuration: 'var(--duration-fast)',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <span aria-hidden="true">←</span>
      <span>Work</span>
    </button>
  )
}

// ── Nav bar ──────────────────────────────────────────────────────────────────
function NavBar() {
  return (
    <nav
      aria-label="Page navigation"
      className="w-full flex items-center justify-between"
      style={{
        position:     'sticky',
        top:          0,
        zIndex:       50,
        background:   'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding:      '16px 40px',
      }}
    >
      <BackLink />

      <span
        aria-hidden="true"
        style={{
          fontFamily:    FONT_BODY,
          fontSize:      11,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          color:         'var(--fg-muted)',
        }}
      >
        Stellareat · 2024
      </span>
    </nav>
  )
}

// ── Hero section ─────────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <header
      className={cn(
        'px-6 md:px-12 lg:px-20',
        'pt-24 pb-20 md:pt-32 md:pb-28'
      )}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        {/* Eyebrow */}
        <p
          className="mb-6"
          style={{
            fontFamily:    FONT_BODY,
            fontSize:      11,
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color:         'var(--fg-muted)',
          }}
        >
          Product Designer · Jan–Jun 2024 · Remote
        </p>

        {/* Headline */}
        <h1
          className="mb-4"
          style={{
            fontFamily:    FONT_DISPLAY,
            fontWeight:    400,
            fontSize:      'clamp(36px, 5.2vw, 68px)',
            letterSpacing: '-0.02em',
            lineHeight:    1.08,
            color:         'var(--fg)',
            maxWidth:      '24ch',
          }}
        >
          <DecodeText text="The AI doesn't need you to know what you want." />
        </h1>

        {/* Sub-headline */}
        <p
          className="mb-10"
          style={{
            fontFamily:    FONT_DISPLAY,
            fontWeight:    400,
            fontSize:      'clamp(20px, 2.6vw, 30px)',
            letterSpacing: '-0.02em',
            lineHeight:    1.25,
            color:         'var(--fg-muted)',
          }}
        >
          It starts with what you have.
        </p>

        {/* Context line */}
        <p
          className="mb-6"
          style={{
            fontFamily:    FONT_BODY,
            fontSize:      17,
            lineHeight:    1.6,
            color:         'var(--fg-muted)',
          }}
        >
          Stellareat — AI-powered culinary platform. Recipe generation, guided cooking, community ownership.
        </p>

        {/* Context paragraph */}
        <p
          style={{
            fontFamily: FONT_BODY,
            fontSize:   17,
            lineHeight: 1.65,
            color:      'var(--fg-muted)',
            maxWidth:   '56ch',
          }}
        >
          Most recipe apps start with a search bar. Stellareat starts with what&apos;s already in your kitchen — ingredients, equipment, energy level — and works backward to what you can actually make tonight.
        </p>
      </div>
    </header>
  )
}

// ── Section label shared style ────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="mb-6"
      style={{
        fontFamily:    FONT_BODY,
        fontSize:      11,
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color:         'var(--fg-muted)',
      }}
    >
      {children}
    </p>
  )
}

// ── Demo 1: Fridge Entry ──────────────────────────────────────────────────────
function EntrySection() {
  return (
    <section
      aria-labelledby="entry-heading"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* Text block */}
      <div className={cn('px-6 md:px-12 lg:px-20', 'pt-20 pb-12 md:pt-28 md:pb-16')}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <SectionLabel>01 — Entry</SectionLabel>

          <h2
            id="entry-heading"
            className="mb-8"
            style={{
              fontFamily:    FONT_DISPLAY,
              fontWeight:    400,
              fontSize:      'clamp(22px, 3vw, 40px)',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              color:         'var(--fg)',
            }}
          >
            &ldquo;From your fridge, not from a search bar.&rdquo;
          </h2>

          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize:   17,
              lineHeight: 1.65,
              color:      'var(--fg-muted)',
              maxWidth:   '56ch',
            }}
          >
            The entry experience doesn&apos;t ask what you want. It asks what you have — and uses that as the starting point for everything the AI generates.
          </p>
        </div>
      </div>

      {/* Demo — full bleed, horizontal padding only */}
      <div className="px-6 md:px-12 lg:px-20 pb-20 md:pb-28">
        <FridgeEntry />
      </div>
    </section>
  )
}

// ── Demo 2: Cook Mode ─────────────────────────────────────────────────────────
function CookModeSection() {
  return (
    <section
      aria-labelledby="cook-mode-heading"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* Text block */}
      <div className={cn('px-6 md:px-12 lg:px-20', 'pt-20 pb-12 md:pt-28 md:pb-16')}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <SectionLabel>02 — Cook Mode</SectionLabel>

          <h2
            id="cook-mode-heading"
            className="mb-8"
            style={{
              fontFamily:    FONT_DISPLAY,
              fontWeight:    400,
              fontSize:      'clamp(22px, 3vw, 40px)',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              color:         'var(--fg)',
            }}
          >
            &ldquo;Dietary preferences are not a settings page.&rdquo;
          </h2>

          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize:   17,
              lineHeight: 1.65,
              color:      'var(--fg-muted)',
              maxWidth:   '56ch',
            }}
          >
            The UI doesn&apos;t just enlarge text for the kitchen — it re-segments cognitive units into physical actions, surfacing one atomic step at a time so attention stays on the pan, not the screen. Cook mode is a different contract between the interface and the user.
          </p>
        </div>
      </div>

      {/* Demo — full bleed */}
      <div className="px-6 md:px-12 lg:px-20 pb-20 md:pb-28">
        <CookModeShift />
      </div>
    </section>
  )
}

// ── Demo 3: Community Ownership ───────────────────────────────────────────────
function CommunitySection() {
  return (
    <section
      aria-labelledby="community-heading"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      {/* Text block */}
      <div className={cn('px-6 md:px-12 lg:px-20', 'pt-20 pb-12 md:pt-28 md:pb-16')}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>

          <SectionLabel>03 — Community</SectionLabel>

          <h2
            id="community-heading"
            className="mb-8"
            style={{
              fontFamily:    FONT_DISPLAY,
              fontWeight:    400,
              fontSize:      'clamp(22px, 3vw, 40px)',
              letterSpacing: '-0.02em',
              lineHeight:    1.2,
              color:         'var(--fg)',
            }}
          >
            &ldquo;AI generates. Humans cook. The recipe drifts.&rdquo;
          </h2>

          <p
            style={{
              fontFamily: FONT_BODY,
              fontSize:   17,
              lineHeight: 1.65,
              color:      'var(--fg-muted)',
              maxWidth:   '56ch',
            }}
          >
            When four people make the same AI recipe and all modify it, which version is the real one? This demo shows what recipe ownership looks like when the author is a model.
          </p>
        </div>
      </div>

      {/* Demo — full bleed */}
      <div className="px-6 md:px-12 lg:px-20 pb-20 md:pb-28">
        <CommunityOwnership />
      </div>
    </section>
  )
}

// ── Closing: Three design decisions ──────────────────────────────────────────
const PRINCIPLES = [
  {
    label: '01 — Entry is context, not intent',
    body: 'Most AI tools start by asking what you want. Stellareat starts by asking what you have. The difference is where the cognitive load lands — on the user who has to articulate a desire, or on the AI that can infer one from context. Designing the fridge-first entry meant the AI became a translator between reality and possibility, not a search engine.',
  },
  {
    label: '02 — Cook mode is a state, not a view',
    body: 'The same content shown during browsing and during cooking serves two different users — one reading, one doing. Re-segmenting steps into physical actions isn\'t a visual change, it\'s a cognitive contract. The interface commits to a different relationship with the user\'s attention when they press Cook.',
  },
  {
    label: '03 — Community ratings break when the author is an AI',
    body: 'Rating a recipe you modified tells you nothing about the base recipe. Rating a recipe the AI generated tells you something about the AI\'s judgment, not the cook\'s. The community ownership problem is unsolved. The demo surfaces the question; the product doesn\'t yet have an answer.',
  },
] as const

function ClosingSection() {
  return (
    <section
      aria-labelledby="closing-heading"
      style={{ borderTop: '1px solid var(--border)' }}
      className={cn('px-6 md:px-12 lg:px-20', 'py-20 md:py-32')}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <SectionLabel>Bringing it together</SectionLabel>

        <h2
          id="closing-heading"
          className="mb-3"
          style={{
            fontFamily:    FONT_DISPLAY,
            fontWeight:    400,
            fontSize:      'clamp(26px, 3.2vw, 42px)',
            letterSpacing: '-0.02em',
            lineHeight:    1.2,
            color:         'var(--fg)',
          }}
        >
          Three design decisions.
        </h2>

        <p
          className="mb-16"
          style={{
            fontFamily:    FONT_DISPLAY,
            fontWeight:    400,
            fontSize:      'clamp(16px, 2vw, 22px)',
            letterSpacing: '-0.02em',
            lineHeight:    1.35,
            color:         'var(--fg-muted)',
          }}
        >
          None of them about the food.
        </p>

        {/* Principles list */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {PRINCIPLES.map((p) => (
            <div
              key={p.label}
              style={{ borderTop: '1px solid var(--border)', paddingTop: 32, paddingBottom: 32 }}
            >
              <p
                className="mb-4"
                style={{
                  fontFamily:    FONT_BODY,
                  fontSize:      12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  color:         'var(--fg)',
                }}
              >
                {p.label}
              </p>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize:   17,
                  lineHeight: 1.65,
                  color:      'var(--fg-muted)',
                  maxWidth:   '56ch',
                }}
              >
                {p.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Unresolved section ────────────────────────────────────────────────────────
const UNRESOLVED = [
  {
    heading: 'Community incentive design',
    body: 'If you modify an AI recipe and it gets rated highly, who gets credit? The design currently sidesteps this with a \'base recipe + variations\' model, but the incentive structure hasn\'t been fully worked out.',
  },
  {
    heading: 'Low-vision testing gap',
    body: 'Cook mode was designed for accessibility — large touch targets, high contrast, simplified state. It was not user-tested with low-vision users. The design assumes distance reading is the constraint. It may not be.',
  },
  {
    heading: 'Food safety responsibility',
    body: 'AI-generated recipes carry no guarantee of food safety. Allergen substitutions, cooking temperatures, and cross-contamination risks are handled via disclaimer, not design. That\'s not solved — it\'s deferred.',
  },
] as const

function UnresolvedSection() {
  return (
    <section
      aria-labelledby="unresolved-heading"
      style={{ borderTop: '1px solid var(--border)' }}
      className={cn('px-6 md:px-12 lg:px-20', 'py-20 md:py-32')}
    >
      <div style={{ maxWidth: 960, margin: '0 auto' }}>

        <SectionLabel>What&apos;s still unresolved</SectionLabel>

        {/* 3-column grid, 1-column mobile */}
        <div
          style={{
            display:             'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap:                 40,
            marginTop:           16,
          }}
        >
          {UNRESOLVED.map((item) => (
            <div key={item.heading}>
              <h3
                className="mb-3"
                style={{
                  fontFamily:    FONT_DISPLAY,
                  fontWeight:    500,
                  fontSize:      'clamp(18px, 2.2vw, 24px)',
                  letterSpacing: '-0.02em',
                  lineHeight:    1.2,
                  color:         'var(--fg)',
                }}
              >
                {item.heading}
              </h3>
              <p
                style={{
                  fontFamily: FONT_BODY,
                  fontSize:   16,
                  lineHeight: 1.65,
                  color:      'var(--fg-muted)',
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── Root export ───────────────────────────────────────────────────────────────
export function StellareatClient() {
  return (
    <>
      <NavBar />
      <main>
        <HeroSection />
        <EntrySection />
        <CookModeSection />
        <CommunitySection />
        <ClosingSection />
        <UnresolvedSection />
      </main>

      <footer
        className={cn('px-6 md:px-12 lg:px-20', 'py-16')}
        style={{ borderTop: '1px solid var(--border)' }}
      >
        <p
          style={{
            fontFamily:    FONT_BODY,
            fontSize:      11,
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            color:         'var(--fg-muted)',
            opacity:       0.6,
          }}
        >
          Stellareat · Jan–Jun 2024 · Product Designer
        </p>
      </footer>
    </>
  )
}

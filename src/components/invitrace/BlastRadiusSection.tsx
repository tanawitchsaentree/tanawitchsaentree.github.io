'use client'

/**
 * BlastRadiusSection — one token, the whole system moves.
 *
 * The proof a federated design system actually works: a single control on the
 * left drives a real, polished hospital UI on the right. Change the token and
 * every component — buttons, patient cards, status pills, the whole dashboard —
 * re-renders together, in front of you. No abstract graph: the system IS the
 * product surface, and you watch one edit ripple through all of it at once.
 *
 * Switch the hospital archetype to see the SAME components, SAME token root,
 * resolve into three visibly different products. That's the federation.
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/cn'

// ── Archetype definitions — each hospital's resolved token set ──

type Arch = 'medium' | 'large' | 'specialty'

interface Tokens {
  radius:  number   // px — corner rounding
  density: number   // px — vertical breathing room (row padding)
  scale:   number   // unitless — type/control scale
  accent:  string   // CSS var — the hospital's brand hue
}

const ARCH: Record<Arch, { label: string; sub: string; base: Tokens }> = {
  medium:    { label: 'District',  sub: '200 beds · general',  base: { radius: 6,  density: 10, scale: 1.0,  accent: 'var(--arch-medium)' } },
  large:     { label: 'Teaching',  sub: '800 beds · academic', base: { radius: 10, density: 16, scale: 1.08, accent: 'var(--arch-large)' } },
  specialty: { label: 'Specialty', sub: '40 beds · oncology',  base: { radius: 18, density: 13, scale: 1.04, accent: 'var(--arch-specialty)' } },
}

// ── alpha tint that works with CSS vars ──
const tint = (c: string, pct: number) => `color-mix(in srgb, ${c} ${pct}%, transparent)`

// ── the real product surface — a patient dashboard ──
// Every visual property below is derived from `t`. Nothing is hardcoded layout.

const PATIENTS = [
  { name: 'Somchai Kittisak',  id: 'TH-2024-0847', ward: 'Cardiology · 3A',  status: 'Stable',   tone: 'ok'     },
  { name: 'Napat Wongsa',      id: 'TH-2024-0851', ward: 'Emergency · ER',   status: 'Waiting',  tone: 'warn'   },
  { name: 'Siriporn Thana',    id: 'TH-2024-0863', ward: 'ICU · Bed 2',      status: 'Critical', tone: 'danger' },
] as const

const TONE: Record<string, string> = {
  ok:     'var(--signal-ok)',
  warn:   'var(--signal-warn)',
  danger: 'var(--signal-danger)',
}

function Dashboard({ t }: { t: Tokens }) {
  const r  = t.radius
  const dy = t.density
  const fs = (px: number) => Math.round(px * t.scale)

  return (
    <div
      className="w-full overflow-hidden border shadow-[0_8px_40px_-12px_var(--shadow-color-mid)] transition-[border-radius] duration-[400ms] ease-[var(--ease-out-quick)]"
      style={{ borderRadius: r + 4, borderColor: 'var(--border)', background: 'var(--bg)' }}
    >
      {/* App bar */}
      <div
        className="flex items-center justify-between border-b transition-[padding] duration-[400ms] ease-[var(--ease-out-quick)]"
        style={{ padding: `${dy}px ${dy + 8}px`, borderColor: 'var(--border)', background: tint(t.accent, 6) }}
      >
        <div className="flex items-center gap-3">
          <span
            className="inline-block transition-[border-radius] duration-[400ms] ease-[var(--ease-out-quick)]"
            style={{ width: fs(22), height: fs(22), borderRadius: r * 0.6, background: t.accent }}
            aria-hidden="true"
          />
          <span className="font-mono text-[var(--fg)] tracking-tight" style={{ fontSize: fs(14), fontWeight: 500 }}>
            Ward Console
          </span>
        </div>
        <span className="font-mono text-[var(--fg-subtle)]" style={{ fontSize: fs(11) }}>
          4 admitted · 1 critical
        </span>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-3 border-b" style={{ borderColor: 'var(--border)' }}>
        {[
          { k: 'Admitted',  v: 24, c: t.accent },
          { k: 'Pending',   v: 8,  c: 'var(--fg-muted)' },
          { k: 'Critical',  v: 2,  c: 'var(--signal-danger)' },
        ].map((s, i) => (
          <div
            key={s.k}
            className={cn('flex flex-col gap-1 transition-[padding] duration-[400ms] ease-[var(--ease-out-quick)]', i < 2 && 'border-r')}
            style={{ padding: `${dy + 2}px ${dy + 4}px`, borderColor: 'var(--border)' }}
          >
            <span className="font-display font-normal tabular-nums leading-none" style={{ fontSize: fs(26), color: s.c }}>
              {s.v}
            </span>
            <span className="font-mono uppercase tracking-[0.1em] text-[var(--fg-subtle)]" style={{ fontSize: fs(10) }}>
              {s.k}
            </span>
          </div>
        ))}
      </div>

      {/* Patient rows */}
      <div className="flex flex-col">
        {PATIENTS.map((p, i) => (
          <div
            key={p.id}
            className={cn('flex items-center gap-3 transition-[padding] duration-[400ms] ease-[var(--ease-out-quick)]', i < PATIENTS.length - 1 && 'border-b')}
            style={{ padding: `${dy}px ${dy + 8}px`, borderColor: 'var(--border)' }}
          >
            {/* avatar */}
            <span
              className="flex-shrink-0 flex items-center justify-center font-mono text-[var(--fg)] transition-[border-radius] duration-[400ms] ease-[var(--ease-out-quick)]"
              style={{ width: fs(34), height: fs(34), borderRadius: r, background: 'var(--bg-muted)', fontSize: fs(12) }}
              aria-hidden="true"
            >
              {p.name.split(' ').map(n => n[0]).join('')}
            </span>
            {/* identity */}
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[var(--fg)] truncate leading-tight" style={{ fontSize: fs(13), fontWeight: 500 }}>
                {p.name}
              </p>
              <p className="font-mono text-[var(--fg-subtle)] truncate" style={{ fontSize: fs(11) }}>
                {p.id} · {p.ward}
              </p>
            </div>
            {/* status pill */}
            <span
              className="flex-shrink-0 font-mono uppercase tracking-[0.06em] transition-[border-radius,padding] duration-[400ms] ease-[var(--ease-out-quick)]"
              style={{
                fontSize: fs(10),
                padding: `${Math.round(dy * 0.4)}px ${Math.round(dy * 0.7)}px`,
                borderRadius: r * 0.8,
                color: TONE[p.tone],
                background: tint(TONE[p.tone], 12),
                border: `1px solid ${tint(TONE[p.tone], 35)}`,
              }}
            >
              {p.status}
            </span>
          </div>
        ))}
      </div>

      {/* Action footer */}
      <div
        className="flex items-center gap-2 border-t transition-[padding] duration-[400ms] ease-[var(--ease-out-quick)]"
        style={{ padding: `${dy}px ${dy + 8}px`, borderColor: 'var(--border)', background: 'var(--bg-elevated)' }}
      >
        <button
          type="button"
          className="font-mono text-[var(--fg-on-cover)] cursor-default transition-[border-radius,padding] duration-[400ms] ease-[var(--ease-out-quick)]"
          style={{
            fontSize: fs(12), fontWeight: 500,
            padding: `${Math.round(dy * 0.6)}px ${dy + 4}px`,
            borderRadius: r, background: t.accent,
          }}
        >
          Admit patient
        </button>
        <button
          type="button"
          className="font-mono cursor-default transition-[border-radius,padding] duration-[400ms] ease-[var(--ease-out-quick)]"
          style={{
            fontSize: fs(12), fontWeight: 500,
            padding: `${Math.round(dy * 0.6)}px ${dy + 4}px`,
            borderRadius: r, background: 'transparent',
            color: t.accent, border: `1px solid ${tint(t.accent, 45)}`,
          }}
        >
          Transfer
        </button>
      </div>
    </div>
  )
}

// ── control row ──

function Slider({
  label, value, min, max, unit, accent, onChange,
}: {
  label: string; value: number; min: number; max: number; unit: string; accent: string
  onChange: (v: number) => void
}) {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[var(--type-sm)] text-[var(--fg)]">{label}</span>
        <span className="font-mono text-[var(--type-sm)] tabular-nums" style={{ color: accent }}>
          {value}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="br-range w-full"
        style={{ ['--br-pct' as string]: `${pct}%`, ['--br-accent' as string]: accent }}
        aria-label={label}
      />
    </div>
  )
}

// ── main ───────────────────────────────────────────────────────

export function BlastRadiusSection() {
  const reduced = useReducedMotion()
  const [arch, setArch] = useState<Arch>('medium')
  const [over, setOver] = useState<Partial<Tokens>>({})

  const base = ARCH[arch].base
  const t: Tokens = { ...base, ...over }

  const setArchReset = useCallback((a: Arch) => { setArch(a); setOver({}) }, [])
  const patch = useCallback((p: Partial<Tokens>) => setOver(prev => ({ ...prev, ...p })), [])

  const touched = Object.keys(over).length > 0

  return (
    <section
      data-demo="blast-radius"
      className="border-t border-[var(--border)] py-24 md:py-32 px-6 md:px-12 lg:px-20 xl:px-[7.5rem]"
      aria-labelledby="blast-heading"
    >
      {/* range track styling — accent-filled, theme aware */}
      <style dangerouslySetInnerHTML={{ __html: `
        [data-demo="blast-radius"] .br-range { -webkit-appearance:none; appearance:none; height:3px; border-radius:3px; outline:none; display:block;
          background: linear-gradient(to right, var(--br-accent) var(--br-pct), var(--border) var(--br-pct)); }
        [data-demo="blast-radius"] .br-range::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%;
          background:var(--bg); border:2px solid var(--br-accent); cursor:grab; box-shadow:0 1px 4px var(--shadow-color-mid); transition:transform .12s var(--ease-out-quick); }
        [data-demo="blast-radius"] .br-range::-webkit-slider-thumb:active { cursor:grabbing; transform:scale(1.2); }
        [data-demo="blast-radius"] .br-range::-moz-range-thumb { width:18px; height:18px; border-radius:50%;
          background:var(--bg); border:2px solid var(--br-accent); cursor:grab; }
      `}} />

      {/* Header */}
      <div className="mb-12 max-w-[60ch]">
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.18em] text-[var(--accent-text)] mb-4">
          02 — One root, the whole system
        </p>
        <h2
          id="blast-heading"
          className="font-display font-normal leading-[1.1] tracking-[-0.02em] text-[clamp(1.625rem,4vw,2.5rem)] text-[var(--fg)] mb-4"
        >
          Move one token. Watch the product move with it.
        </h2>
        <p className="text-[var(--type-base)] text-[var(--fg-muted)] leading-[1.7]">
          This is a live hospital ward console — real buttons, patient cards, status pills. Every
          corner, every margin, every accent is resolved from the token root on the left. Drag a
          slider and the entire surface re-renders at once. Switch hospital to see the same
          components become three different products.
        </p>
      </div>

      {/* Controls + live product */}
      <div className="grid lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-start">

        {/* ── Control column ── */}
        <div className="flex flex-col gap-8">
          {/* Hospital archetype */}
          <div>
            <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)] mb-3">
              Hospital
            </p>
            <div className="flex flex-col border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden">
              {(Object.keys(ARCH) as Arch[]).map((a, i) => {
                const on = a === arch
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setArchReset(a)}
                    className={cn(
                      'flex items-center justify-between gap-3 px-4 py-3 text-left',
                      'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)] cursor-pointer',
                      i < 2 && 'border-b border-[var(--border)]',
                      on ? 'bg-[var(--bg-elevated)]' : 'hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
                        style={{ background: ARCH[a].base.accent, transform: on ? 'scale(1.3)' : 'scale(1)' }}
                        aria-hidden="true"
                      />
                      <span className="flex flex-col">
                        <span className="font-mono text-[var(--type-sm)]" style={{ color: on ? 'var(--fg)' : 'var(--fg-muted)' }}>
                          {ARCH[a].label}
                        </span>
                        <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">{ARCH[a].sub}</span>
                      </span>
                    </span>
                    {on && (
                      <motion.span layoutId="arch-dot" className="font-mono text-[var(--type-xs)]" style={{ color: ARCH[a].base.accent }}>
                        ●
                      </motion.span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Token sliders */}
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
                Token root
              </p>
              {touched && (
                <button
                  type="button"
                  onClick={() => setOver({})}
                  className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)] cursor-pointer"
                >
                  ↺ Reset
                </button>
              )}
            </div>
            <Slider label="radius.base"  value={t.radius}  min={0} max={22} unit="px" accent={t.accent} onChange={v => patch({ radius: v })} />
            <Slider label="density.row"  value={t.density} min={6} max={22} unit="px" accent={t.accent} onChange={v => patch({ density: v })} />
            <Slider label="scale.type"   value={Math.round(t.scale * 100)} min={92} max={120} unit="%" accent={t.accent} onChange={v => patch({ scale: v / 100 })} />

            <p className="font-mono text-[var(--type-xs)] text-[var(--fg-muted)] leading-[1.7] pt-2 border-t border-[var(--border)]">
              {touched
                ? 'Three tokens just re-flowed every component above — buttons, cards, pills, stats, all at once.'
                : 'These three values feed every component in the console. Drag one and watch the whole surface respond.'}
            </p>
          </div>
        </div>

        {/* ── Live product ── */}
        <div className="lg:sticky lg:top-20">
          <AnimatePresence mode="wait">
            <motion.div
              key={arch}
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <Dashboard t={t} />
            </motion.div>
          </AnimatePresence>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)] mt-4 text-center">
            {ARCH[arch].label} hospital · same components, resolved through its token set
          </p>
        </div>
      </div>
    </section>
  )
}

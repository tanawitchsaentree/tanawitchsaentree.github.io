'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'

type Archetype = 'medium' | 'large' | 'specialty'
type TokenKey = 'spacing' | 'radius' | 'color' | 'fontSize' | 'rowDensity'

interface TokenDef {
  label: string
  defaultValue: string
  numValue?: number
  unit?: string
  min?: number
  max?: number
  flex: boolean
}

const ARCHETYPES = [
  { key: 'medium'    as const, label: 'Medium hospital',  abbr: 'M', color: '#0D9488' },
  { key: 'large'     as const, label: 'Large hospital',   abbr: 'L', color: '#D97706' },
  { key: 'specialty' as const, label: 'Specialty clinic', abbr: 'S', color: '#E85D75' },
]

const BASE_TOKENS: Record<Archetype, Record<TokenKey, TokenDef>> = {
  medium: {
    spacing:    { label: 'spacing.base',    defaultValue: '12px', numValue: 12, unit: 'px', min: 8,  max: 20, flex: true  },
    radius:     { label: 'radius.md',       defaultValue: '4px',  numValue: 4,  unit: 'px', min: 0,  max: 16, flex: true  },
    color:      { label: 'color.primary',   defaultValue: '#0D9488',                                  flex: false },
    fontSize:   { label: 'font.size.label', defaultValue: '13px',                                     flex: false },
    rowDensity: { label: 'density.row',     defaultValue: '10px', numValue: 10, unit: 'px', min: 6,  max: 18, flex: true  },
  },
  large: {
    spacing:    { label: 'spacing.base',    defaultValue: '16px', numValue: 16, unit: 'px', min: 10, max: 24, flex: true  },
    radius:     { label: 'radius.md',       defaultValue: '6px',  numValue: 6,  unit: 'px', min: 0,  max: 16, flex: true  },
    color:      { label: 'color.primary',   defaultValue: '#D97706',                                  flex: false },
    fontSize:   { label: 'font.size.label', defaultValue: '14px',                                     flex: false },
    rowDensity: { label: 'density.row',     defaultValue: '14px', numValue: 14, unit: 'px', min: 8,  max: 20, flex: true  },
  },
  specialty: {
    spacing:    { label: 'spacing.base',    defaultValue: '14px', numValue: 14, unit: 'px', min: 8,  max: 22, flex: true  },
    radius:     { label: 'radius.md',       defaultValue: '8px',  numValue: 8,  unit: 'px', min: 0,  max: 16, flex: true  },
    color:      { label: 'color.primary',   defaultValue: '#E85D75',                                  flex: false },
    fontSize:   { label: 'font.size.label', defaultValue: '14px',                                     flex: false },
    rowDensity: { label: 'density.row',     defaultValue: '12px', numValue: 12, unit: 'px', min: 6,  max: 20, flex: true  },
  },
}

interface ResolvedTokens {
  spacing: number
  radius: number
  color: string
  fontSize: string
  rowDensity: number
}

function resolve(arch: Archetype, overrides: Partial<Record<TokenKey, number>>): ResolvedTokens {
  const b = BASE_TOKENS[arch]
  return {
    spacing:    overrides.spacing    ?? b.spacing.numValue!,
    radius:     overrides.radius     ?? b.radius.numValue!,
    color:      b.color.defaultValue,
    fontSize:   b.fontSize.defaultValue,
    rowDensity: overrides.rowDensity ?? b.rowDensity.numValue!,
  }
}

// ─── Component Previews ─────────────────────────────────────────────

function Label({ children }: { children: string }) {
  return (
    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)] mb-5 select-none">
      {children}
    </p>
  )
}

function ButtonPreview({ t }: { t: ResolvedTokens }) {
  return (
    <div className="p-6 lg:p-8">
      <Label>Button</Label>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          className="font-mono transition-all duration-300 ease-out cursor-default select-none"
          style={{
            padding: `${Math.round(t.spacing * 0.55)}px ${Math.round(t.spacing * 1.4)}px`,
            borderRadius: t.radius,
            background: t.color,
            color: '#fff',
            fontSize: t.fontSize,
            border: 'none',
            letterSpacing: '0.02em',
          }}
        >
          Confirm order
        </button>
        <button
          type="button"
          className="font-mono transition-all duration-300 ease-out cursor-default select-none"
          style={{
            padding: `${Math.round(t.spacing * 0.55)}px ${Math.round(t.spacing * 1.4)}px`,
            borderRadius: t.radius,
            background: 'transparent',
            color: t.color,
            fontSize: t.fontSize,
            border: `1px solid ${t.color}`,
            letterSpacing: '0.02em',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          className="font-mono transition-all duration-300 ease-out cursor-default select-none opacity-40"
          style={{
            padding: `${Math.round(t.spacing * 0.55)}px ${Math.round(t.spacing * 1.4)}px`,
            borderRadius: t.radius,
            background: 'transparent',
            color: 'var(--fg-muted)',
            fontSize: t.fontSize,
            border: `1px solid var(--border)`,
            letterSpacing: '0.02em',
          }}
        >
          Disabled
        </button>
      </div>
    </div>
  )
}

function FieldPreview({ t }: { t: ResolvedTokens }) {
  const sp = t.spacing
  const r = t.radius
  return (
    <div className="p-6 lg:p-8">
      <Label>Field</Label>
      <div className="flex flex-wrap gap-4 items-start">
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <label htmlFor="inv-patient-id" className="font-mono text-[var(--fg-muted)] transition-all duration-300" style={{ fontSize: t.fontSize }}>
            Patient ID
          </label>
          <input
            id="inv-patient-id"
            readOnly
            value="TH-2024-0847"
            className="font-mono bg-transparent border border-[var(--border)] text-[var(--fg)] focus:outline-none transition-all duration-300 ease-out"
            style={{ padding: `${Math.round(sp * 0.55)}px ${Math.round(sp * 0.8)}px`, borderRadius: r, fontSize: t.fontSize }}
          />
        </div>
        <div className="flex flex-col gap-1.5 min-w-[160px]">
          <span className="font-mono text-[var(--fg-muted)] transition-all duration-300" style={{ fontSize: t.fontSize }}>
            Ward
          </span>
          <div
            className="font-mono transition-all duration-300 ease-out"
            style={{
              padding: `${Math.round(sp * 0.55)}px ${Math.round(sp * 0.8)}px`,
              borderRadius: r,
              fontSize: t.fontSize,
              color: t.color,
              border: `1px solid ${t.color}50`,
              background: `${t.color}0f`,
            }}
          >
            ⚠ Required
          </div>
        </div>
      </div>
    </div>
  )
}

const ROWS = [
  { id: 'PT-001', name: 'Somchai K.',   status: 'Admitted',    active: true  },
  { id: 'PT-002', name: 'Napat W.',     status: 'Pending',     active: false },
  { id: 'PT-003', name: 'Siriporn T.', status: 'Discharged',  active: false },
]

function TablePreview({ t }: { t: ResolvedTokens }) {
  const rd = t.rowDensity
  return (
    <div className="p-6 lg:p-8">
      <Label>Table</Label>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[var(--border)]">
            {['ID', 'Patient', 'Status'].map(h => (
              <th
                key={h}
                className="text-left font-mono font-normal text-[var(--fg-subtle)] transition-all duration-300 ease-out"
                style={{ fontSize: t.fontSize, paddingBottom: `${rd}px`, paddingRight: '16px' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map(row => (
            <tr key={row.id} className="border-b border-[var(--border)] last:border-0">
              <td
                className="font-mono text-[var(--fg-muted)] transition-all duration-300 ease-out"
                style={{ fontSize: t.fontSize, padding: `${rd}px 16px ${rd}px 0` }}
              >
                {row.id}
              </td>
              <td
                className="font-mono text-[var(--fg)] transition-all duration-300 ease-out"
                style={{ fontSize: t.fontSize, padding: `${rd}px 16px ${rd}px 0` }}
              >
                {row.name}
              </td>
              <td className="transition-all duration-300 ease-out" style={{ padding: `${rd}px 0` }}>
                <span
                  className="font-mono transition-all duration-300 ease-out"
                  style={{
                    padding: `2px 8px`,
                    borderRadius: Math.round(t.radius * 0.5),
                    fontSize: '11px',
                    letterSpacing: '0.04em',
                    color:      row.active ? t.color : 'var(--fg-subtle)',
                    background: row.active ? `${t.color}18` : 'transparent',
                    border:     row.active ? `1px solid ${t.color}40` : '1px solid transparent',
                  }}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Token Panel ────────────────────────────────────────────────────

function TokenPanel({
  arch,
  overrides,
  onOverride,
}: {
  arch: Archetype
  overrides: Partial<Record<TokenKey, number>>
  onOverride: (k: TokenKey, v: number) => void
}) {
  const [shaking, setShaking] = useState<TokenKey | null>(null)
  const tokens = BASE_TOKENS[arch]

  const shake = useCallback((key: TokenKey) => {
    setShaking(key)
    setTimeout(() => setShaking(null), 600)
  }, [])

  const flexKeys:   TokenKey[] = ['spacing', 'radius', 'rowDensity']
  const lockedKeys: TokenKey[] = ['color', 'fontSize']

  return (
    <div className="flex flex-col gap-8">
      {/* Flex */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--accent-text)] mb-5 select-none">
          ↻ Flex axis
        </p>
        <div className="flex flex-col gap-5">
          {flexKeys.map(key => {
            const tok = tokens[key]
            const val = overrides[key] ?? tok.numValue!
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-[var(--fg)] select-none">{tok.label}</span>
                  <span className="font-mono text-[11px] tabular-nums text-[var(--fg-muted)] select-none">
                    {val}{tok.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={tok.min}
                  max={tok.max}
                  value={val}
                  onChange={e => onOverride(key, Number(e.target.value))}
                  className="inv-range w-full cursor-pointer"
                  aria-label={tok.label}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Locked */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)] mb-5 select-none">
          ⊘ Locked axis
        </p>
        <div className="flex flex-col gap-2">
          {lockedKeys.map(key => {
            const tok = tokens[key]
            const isShaking = shaking === key
            return (
              <div key={key}>
                <motion.button
                  type="button"
                  onClick={() => shake(key)}
                  animate={isShaking ? { x: [0, -5, 5, -5, 5, -2, 2, 0] } : { x: 0 }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className={cn(
                    'w-full flex items-center justify-between gap-3',
                    'px-3 py-2.5 border text-left transition-all duration-150',
                    isShaking
                      ? 'border-[var(--fg-muted)] bg-[var(--bg-elevated)]'
                      : 'border-[var(--border)] hover:border-[var(--fg-subtle)] cursor-not-allowed'
                  )}
                >
                  <span className="font-mono text-[11px] text-[var(--fg-muted)]">{tok.label}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {tok.defaultValue.startsWith('#') && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-[var(--border)] flex-shrink-0"
                        style={{ background: tok.defaultValue }}
                        aria-hidden="true"
                      />
                    )}
                    <span className="font-mono text-[10px] text-[var(--fg-subtle)]">{tok.defaultValue}</span>
                  </div>
                </motion.button>
                <AnimatePresence>
                  {isShaking && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="font-mono text-[10px] text-[var(--fg-subtle)] px-3 pt-1.5 overflow-hidden"
                    >
                      This cannot change — it&apos;s part of the contract.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Main ───────────────────────────────────────────────────────────

export function EngineSection() {
  const [arch, setArch]         = useState<Archetype>('medium')
  const [overrides, setOverrides] = useState<Partial<Record<TokenKey, number>>>({})

  const changeArch = useCallback((a: Archetype) => {
    setArch(a)
    setOverrides({})
  }, [])

  const handleOverride = useCallback((key: TokenKey, val: number) => {
    setOverrides(prev => ({ ...prev, [key]: val }))
  }, [])

  const t    = resolve(arch, overrides)
  const meta = ARCHETYPES.find(a => a.key === arch)!

  return (
    <section
      className={cn(
        'px-6 md:px-12 lg:px-20 xl:px-[7.5rem]',
        'py-24 md:py-32 border-t border-[var(--border)]'
      )}
      aria-labelledby="engine-heading"
    >
      {/* Range slider reset */}
      <style dangerouslySetInnerHTML={{ __html: `
        .inv-range { -webkit-appearance: none; appearance: none; height: 1px; background: var(--border); outline: none; display: block; }
        .inv-range::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: var(--fg); cursor: pointer; transition: transform 0.12s; }
        .inv-range::-webkit-slider-thumb:hover { transform: scale(1.35); }
        .inv-range::-moz-range-thumb { width: 12px; height: 12px; border-radius: 50%; background: var(--fg); cursor: pointer; border: none; }
      `}} />

      {/* Header row */}
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
        <div>
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--accent-text)] mb-4">
            02 — The engine
          </p>
          <h2
            id="engine-heading"
            className={cn(
              'font-display font-normal leading-[1.05] tracking-[-0.032em]',
              'text-[clamp(1.75rem,4vw,3rem)] text-[var(--fg)] max-w-[28ch]'
            )}
          >
            Same system. Three hospitals.
          </h2>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-muted)] mt-3">
            Switch archetype → adjust flex tokens → try clicking a locked one.
          </p>
        </div>

        {/* Archetype tabs */}
        <div className="flex border border-[var(--border)] self-start lg:self-auto">
          {ARCHETYPES.map(a => (
            <button
              key={a.key}
              type="button"
              onClick={() => changeArch(a.key)}
              className={cn(
                'flex items-center gap-2 px-4 py-3',
                'font-mono text-[var(--type-xs)] uppercase tracking-wider',
                'transition-colors duration-150',
                'border-r border-[var(--border)] last:border-r-0',
                arch === a.key
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'text-[var(--fg-muted)] hover:text-[var(--fg)] hover:bg-[var(--bg-elevated)]'
              )}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0 transition-colors duration-150"
                style={{ background: arch === a.key ? 'var(--bg)' : a.color }}
                aria-hidden="true"
              />
              <span className="hidden sm:inline">{a.abbr} — {a.label.split(' ')[0]}</span>
              <span className="sm:hidden">{a.abbr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Canvas + panel */}
      <div className="border border-[var(--border)] grid lg:grid-cols-[1fr_264px]">

        {/* Component canvas */}
        <AnimatePresence mode="wait">
          <motion.div
            key={arch}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="divide-y divide-[var(--border)] lg:border-r lg:border-[var(--border)]"
          >
            <ButtonPreview t={t} />
            <FieldPreview  t={t} />
            <TablePreview  t={t} />
          </motion.div>
        </AnimatePresence>

        {/* Token panel */}
        <div className="p-6 border-t lg:border-t-0 bg-[var(--bg-elevated)]">
          <div className="flex items-center justify-between mb-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--fg-subtle)] select-none">
              Token axis
            </p>
            <span
              className="font-mono text-[10px] px-2 py-0.5 border border-[var(--border)] select-none"
              style={{ color: meta.color }}
            >
              {meta.abbr} — {meta.label.split(' ')[0]}
            </span>
          </div>
          <TokenPanel arch={arch} overrides={overrides} onOverride={handleOverride} />
        </div>
      </div>
    </section>
  )
}

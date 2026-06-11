'use client'

import {
  useState, useEffect, useRef, useCallback, useId,
} from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/cn'
import type { VariantData, Primitive, Archetype } from '@/lib/invitrace-variants'
import {
  TREE_PRIMITIVES, TREE_ARCHETYPES, ARCHETYPE_META, PRIMITIVE_META,
} from '@/lib/invitrace-variants'
import { VariantPanel } from './VariantPanel'

// ─── Tree data model ──────────────────────────────────────────────

interface TreeNode {
  id: string
  type: 'root' | 'primitive' | 'variant'
  label: string
  abbr?: string
  color: string
  primitive?: Primitive
  archetype?: Archetype
  x: number
  y: number
  vx?: number
  vy?: number
}

interface TreeEdge {
  source: string
  target: string
}

// Static layout — canvas 700×520
const W = 700
const H = 520
const CX = W / 2

function buildStaticLayout(): { nodes: TreeNode[]; edges: TreeEdge[] } {
  const nodes: TreeNode[] = []
  const edges: TreeEdge[] = []

  // Root
  nodes.push({ id: 'root', type: 'root', label: 'Design Token', color: '#888888', x: CX, y: 440 })

  // Primitives — evenly spaced across width
  const primX = [160, CX, 540]
  TREE_PRIMITIVES.forEach((p, i) => {
    const id = `prim-${p}`
    nodes.push({
      id, type: 'primitive', label: PRIMITIVE_META[p].label,
      color: PRIMITIVE_META[p].color, primitive: p,
      x: primX[i], y: 290,
    })
    edges.push({ source: 'root', target: id })
  })

  // Variants — 3 per primitive, fanned out
  TREE_PRIMITIVES.forEach((p, pi) => {
    const cx = primX[pi]
    const offsets = [-72, 0, 72]
    TREE_ARCHETYPES.forEach((a, ai) => {
      const id = `var-${p}-${a}`
      const meta = ARCHETYPE_META[a]
      nodes.push({
        id, type: 'variant', label: `${PRIMITIVE_META[p].label} · ${meta.label}`,
        abbr: meta.abbr, color: meta.color, primitive: p, archetype: a,
        x: cx + offsets[ai], y: 140,
      })
      edges.push({ source: `prim-${p}`, target: id })
    })
  })

  return { nodes, edges }
}

// ─── Phase system ─────────────────────────────────────────────────

const PHASE_TEXTS = [
  {
    headline: 'Every component starts here.',
    body: 'One token. One rule. No exceptions. The root is what makes every hospital version the same thing.',
  },
  {
    headline: 'Primitives inherit the token.',
    body: 'They define behavior, not appearance. Button, Field, Table — these exist before any hospital context is applied.',
  },
  {
    headline: 'Variants adapt to hospital reality.',
    body: 'Same engine. Different surface. M, L, S — three archetypes, nine variant nodes. Each one has an axis of what can change and what can\'t.',
  },
  {
    headline: 'What you control vs. what stays locked is the contract.',
    body: 'Click any node to inspect its flex and locked axes. Drag to explore. The structure is the argument.',
  },
]

function getPhaseFromProgress(p: number): number {
  if (p < 0.25) return 0
  if (p < 0.5)  return 1
  if (p < 0.75) return 2
  return 3
}

// ─── Node visibility per phase ────────────────────────────────────

function nodeVisible(node: TreeNode, phase: number): boolean {
  if (node.type === 'root')      return phase >= 0
  if (node.type === 'primitive') return phase >= 1
  return phase >= 2
}

function edgeVisible(edge: TreeEdge, phase: number): boolean {
  if (edge.source === 'root') return phase >= 1
  return phase >= 2
}

// ─── Main component ───────────────────────────────────────────────

interface VariantTreeProps {
  variants: Record<string, VariantData>
}

export function VariantTree({ variants }: VariantTreeProps) {
  const reduced = useReducedMotion()
  const svgRef  = useRef<SVGSVGElement>(null)
  const descId  = useId()

  const [phase, setPhase]           = useState(reduced ? 3 : 0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [hoveredId, setHoveredId]   = useState<string | null>(null)
  const [showInvariantsOnly, setShowInvariantsOnly] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<VariantData | null>(null)

  const { nodes, edges } = buildStaticLayout()

  // ── Sticky scroll driver ─────────────────────────────────────────
  const sectionRef = useRef<HTMLDivElement>(null)
  const stickyRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduced) return

    const section = sectionRef.current
    if (!section) return

    const handler = () => {
      const rect = section.getBoundingClientRect()
      const sectionH = section.offsetHeight - window.innerHeight
      if (sectionH <= 0) return
      const progress = Math.max(0, Math.min(1, -rect.top / sectionH))
      setScrollProgress(progress)
      setPhase(getPhaseFromProgress(progress))
    }

    window.addEventListener('scroll', handler, { passive: true })
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [reduced])

  // ── Node interaction ─────────────────────────────────────────────
  const handleNodeClick = useCallback((node: TreeNode) => {
    if (!nodeVisible(node, phase)) return
    if (node.type !== 'variant') {
      setSelectedId(prev => prev === node.id ? null : node.id)
      setSelectedVariant(null)
      return
    }
    const key = `${node.primitive}-${node.archetype}`
    const data = variants[key] ?? null
    setSelectedId(node.id)
    setSelectedVariant(data)
  }, [phase, variants])

  const handleNodeKeyDown = useCallback((e: React.KeyboardEvent, node: TreeNode) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleNodeClick(node)
    }
  }, [handleNodeClick])

  // Compute path highlight: selected node → its ancestors
  const ancestorIds = new Set<string>()
  if (selectedId) {
    let current: string | null = selectedId
    while (current) {
      ancestorIds.add(current)
      const parentEdge = edges.find(e => e.target === current)
      current = parentEdge?.source ?? null
    }
  }

  const phaseText = PHASE_TEXTS[phase]

  // ── Render ───────────────────────────────────────────────────────
  return (
    // Scroll container — 4× viewport tall to give scroll room
    <div
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? 'auto' : '400vh' }}
      aria-label="Variant Tree — interactive design system diagram"
    >
      {/* Sticky canvas */}
      <div
        ref={stickyRef}
        className={cn(
          'flex flex-col md:flex-row items-stretch',
          !reduced && 'sticky top-0 h-svh'
        )}
      >
        {/* ── SVG tree panel ───────────────────────── */}
        <div className={cn(
          'relative flex-1 min-h-0',
          'flex items-center justify-center',
          'px-4 py-8 md:p-0'
        )}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-labelledby={descId}
            className="w-full max-w-[600px] h-auto"
            style={{ maxHeight: '70vh' }}
          >
            <title id={descId}>
              Variant tree: design token root branches to 3 primitives (Button, Field, Table),
              each with 3 hospital variants (Medium, Large, Specialty)
            </title>

            {/* Edges */}
            {edges.map(edge => {
              const src = nodes.find(n => n.id === edge.source)!
              const tgt = nodes.find(n => n.id === edge.target)!
              const visible = edgeVisible(edge, phase)
              const isHighlighted = ancestorIds.has(edge.source) && ancestorIds.has(edge.target)
              const isDimmed = selectedId !== null && !isHighlighted && showInvariantsOnly && tgt.type === 'variant'

              return (
                <motion.line
                  key={`${edge.source}→${edge.target}`}
                  x1={src.x} y1={src.y} x2={tgt.x} y2={tgt.y}
                  stroke={isHighlighted ? src.color : 'var(--border)'}
                  strokeWidth={isHighlighted ? 1.5 : 1}
                  strokeDasharray={tgt.type === 'variant' ? '5 4' : undefined}
                  initial={{ opacity: 0, pathLength: 0 }}
                  animate={{
                    opacity: visible ? (isDimmed ? 0.1 : isHighlighted ? 0.8 : 0.35) : 0,
                    pathLength: visible ? 1 : 0,
                  }}
                  transition={{ duration: reduced ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              )
            })}

            {/* Nodes */}
            {nodes.map(node => {
              const visible = nodeVisible(node, phase)
              const isSelected = selectedId === node.id
              const isAncestor = ancestorIds.has(node.id) && !isSelected
              const isDimmed = showInvariantsOnly && node.type === 'variant'
              const isHovered = hoveredId === node.id

              const r = node.type === 'root' ? 10 : node.type === 'primitive' ? 7 : 5.5
              const opacity = !visible ? 0 : isDimmed ? 0.1 : (selectedId && !ancestorIds.has(node.id)) ? 0.25 : 1

              return (
                <motion.g
                  key={node.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity, scale: isSelected ? 1.25 : isHovered ? 1.15 : 1 }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: `${node.x}px ${node.y}px`, cursor: visible ? 'pointer' : 'default' }}
                  onClick={() => handleNodeClick(node)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  role="button"
                  tabIndex={visible ? 0 : -1}
                  aria-label={node.label}
                  aria-pressed={isSelected}
                  onKeyDown={e => handleNodeKeyDown(e, node)}
                >
                  {/* Node circle */}
                  <circle
                    cx={node.x} cy={node.y} r={r}
                    fill={node.color}
                    fillOpacity={isSelected ? 1 : 0.7}
                    stroke={isSelected ? 'var(--fg)' : 'transparent'}
                    strokeWidth={2}
                  />
                  {/* Variant abbr label */}
                  {node.type === 'variant' && node.abbr && (
                    <text
                      x={node.x} y={node.y + 0.4}
                      textAnchor="middle" dominantBaseline="middle"
                      fontSize="5.5" fontFamily="inherit" fontWeight="600"
                      fill="white" pointerEvents="none"
                    >
                      {node.abbr}
                    </text>
                  )}
                  {/* Primitive label below */}
                  {node.type === 'primitive' && (
                    <text
                      x={node.x} y={node.y + 16}
                      textAnchor="middle"
                      fontSize="9" fontFamily="inherit"
                      fill="var(--fg-muted)" pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  )}
                  {/* Root label */}
                  {node.type === 'root' && (
                    <text
                      x={node.x} y={node.y + 18}
                      textAnchor="middle"
                      fontSize="9" fontFamily="inherit"
                      fill="var(--fg-subtle)" pointerEvents="none"
                    >
                      {node.label}
                    </text>
                  )}
                  {/* Focus ring */}
                  {isSelected && (
                    <circle
                      cx={node.x} cy={node.y} r={r + 5}
                      fill="none"
                      stroke="var(--fg)"
                      strokeWidth="1"
                      strokeDasharray="3 2"
                      pointerEvents="none"
                    />
                  )}
                </motion.g>
              )
            })}
          </svg>

          {/* Legend */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4"
              >
                {(Object.entries(ARCHETYPE_META) as [Archetype, typeof ARCHETYPE_META[Archetype]][]).map(([key, meta]) => (
                  <div key={key} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">{meta.abbr} — {meta.label.split(' ')[0]}</span>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right text panel ──────────────────────── */}
        <div className={cn(
          'md:w-[320px] flex-shrink-0',
          'flex flex-col justify-center',
          'px-8 py-8 md:py-12 md:pr-12',
          'border-t md:border-t-0 md:border-l border-[var(--border)]'
        )}>
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col gap-4"
            >
              <p className="font-mono text-[var(--type-xs)] uppercase tracking-widest text-[var(--accent-text)]">
                {String(phase + 1).padStart(2, '0')} / 04
              </p>
              <h3 className={cn(
                'font-display font-normal leading-[1.1] tracking-[-0.02em]',
                'text-[clamp(1.25rem,2.2vw,1.75rem)]',
                'text-[var(--fg)]'
              )}>
                {phaseText.headline}
              </h3>
              <p className="text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.7]">
                {phaseText.body}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Controls — appear in phase 3 */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="mt-8 flex flex-col gap-2"
              >
                <button
                  type="button"
                  onClick={() => { setShowInvariantsOnly(v => !v); setSelectedId(null); setSelectedVariant(null) }}
                  className={cn(
                    'px-4 py-2.5 text-left',
                    'font-mono text-[var(--type-xs)] uppercase tracking-wider',
                    'border transition-colors duration-[180ms]',
                    showInvariantsOnly
                      ? 'bg-[var(--fg)] text-[var(--bg)] border-[var(--fg)]'
                      : 'border-[var(--border)] text-[var(--fg-muted)] hover:text-[var(--fg)] hover:border-[var(--fg-muted)]'
                  )}
                >
                  {showInvariantsOnly ? '← Show all variants' : 'Show invariants only'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scroll progress indicator (desktop) */}
          {!reduced && (
            <div className="hidden md:flex mt-8 gap-1" aria-hidden="true">
              {[0, 1, 2, 3].map(i => (
                <div
                  key={i}
                  className={cn(
                    'h-0.5 flex-1 transition-colors duration-300',
                    i <= phase ? 'bg-[var(--fg)]' : 'bg-[var(--border)]'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Variant detail panel */}
      <VariantPanel
        data={selectedVariant}
        onClose={() => { setSelectedVariant(null); setSelectedId(null) }}
      />
    </div>
  )
}

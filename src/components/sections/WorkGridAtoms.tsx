'use client'

/* Shared atoms for WorkGridFeaturedCard + WorkGridCard — import from here only */

export function LockGlyph() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}>
      <rect x="5" y="11" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function Tags({ tags, max = 3, textColor, borderColor }: {
  tags:         string[]
  max?:         number
  textColor?:   string
  borderColor?: string
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: 'var(--space-1)' }}>
      {tags.slice(0, max).map(tag => (
        <span key={tag} style={{
          display:       'inline-block',
          padding:       'var(--space-1) var(--space-2)',
          borderRadius:  'var(--radius-sm)',
          border:        `1px solid ${borderColor ?? 'var(--border)'}`,
          fontSize:      'var(--type-xs)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase' as const,
          color:         textColor ?? 'var(--fg-subtle)',
          lineHeight:    1.7,
          whiteSpace:    'nowrap' as const,
        }}>{tag}</span>
      ))}
    </div>
  )
}

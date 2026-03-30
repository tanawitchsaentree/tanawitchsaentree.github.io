import React from 'react';

/** Parses **bold** and \n\n paragraph breaks into React nodes. */
function renderRich(text: string): React.ReactNode {
    if (!text) return null;
    const paras = text.split('\n\n');
    return paras.map((para, pi) => {
        const parts = para.split(/\*\*(.+?)\*\*/g);
        const nodes = parts.map((part, i) =>
            i % 2 === 1
                ? <strong key={i} style={{ color: 'var(--foreground)', fontWeight: 600 }}>{part}</strong>
                : part
        );
        return <p key={pi} style={{ margin: pi < paras.length - 1 ? '0 0 10px' : 0 }}>{nodes}</p>;
    });
}

/**
 * PinnedCard — physical "memo on a board" card
 *
 * Visual language: slight rotation, pushpin, lined-paper texture, soft color tint.
 * Pairs with PinnedCardsSection in ProjectModal for zigzag layout.
 *
 * When to use:
 *   - Design decisions (3–5 items, each with rationale)
 *   - Research insights / findings
 *   - Key learnings / retrospective notes
 *   - User quotes pinned as memos
 *   - Feature spec cards, HMW questions
 *
 * Do NOT use for:
 *   - Long lists (7+ items) — loses the "intentional memo" feel
 *   - Content without titles — pins need a headline to anchor to
 */

const PIN_COLORS = ['#E06B3C', '#5A70E8', '#9B5CE8', '#E8943B'];

const CARD_TINTS = [
    'rgba(90, 112, 232, 0.055)',
    'rgba(232, 148, 59, 0.06)',
    'rgba(155, 92, 232, 0.055)',
    'rgba(60, 180, 120, 0.05)',
];

// Alternating slight rotations — odd index = clockwise, even = counter-clockwise
const ROTATIONS = [-2.2, 2.0, -1.5, 2.6];

function PushPin({ color }: { color: string }) {
    return (
        <svg width="24" height="32" viewBox="0 0 24 32" fill="none" aria-hidden="true">
            {/* Head */}
            <circle cx="12" cy="10" r="9" fill={color} opacity="0.92" />
            {/* Shine highlight */}
            <circle cx="9" cy="7.5" r="3" fill="rgba(255,255,255,0.28)" />
            {/* Needle */}
            <rect x="10.5" y="19" width="3" height="12" rx="1.5" fill={color} opacity="0.65" />
            {/* Needle collar */}
            <circle cx="12" cy="19" r="2.5" fill={color} opacity="0.8" />
        </svg>
    );
}

export interface PinnedCardProps {
    number: string;
    title: string;
    description?: string;
    /** 0-based — drives rotation, tint, pin color, and left/right alignment */
    index: number;
    visible?: boolean;
    /** seconds — stagger delay for entrance animation */
    delay?: number;
    /** Structured decision fields — when present, replaces description render */
    problem?: string;
    options?: Array<{ key: string; text: string }>;
    chosen?: string;
    rationale?: string;
    cost?: string;
}

export function PinnedCard({
    number,
    title,
    description,
    index,
    visible = true,
    delay = 0,
    problem,
    options,
    chosen,
    rationale,
    cost,
}: PinnedCardProps) {
    const isRight = index % 2 !== 0;
    const rotation = ROTATIONS[index % ROTATIONS.length];
    const tint = CARD_TINTS[index % CARD_TINTS.length];
    const pinColor = PIN_COLORS[index % PIN_COLORS.length];
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    return (
        <div
            style={{
                width: '62%',
                alignSelf: isRight ? 'flex-end' : 'flex-start',
                transform: visible
                    ? `rotate(${rotation}deg)`
                    : `rotate(${rotation}deg) scale(0.88) translateY(24px)`,
                opacity: visible ? 1 : 0,
                transition: `opacity 0.5s ${delay}s ${ease}, transform 0.6s ${delay}s ${ease}`,
                position: 'relative',
            }}
        >
            {/* Pushpin */}
            <div
                style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 2,
                    filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.35))',
                }}
            >
                <PushPin color={pinColor} />
            </div>

            {/* Card body */}
            <div
                style={{
                    background: `var(--muted)`,
                    backgroundImage: `radial-gradient(ellipse at top right, ${tint} 0%, transparent 65%)`,
                    border: '1px solid var(--border)',
                    borderRadius: 12,
                    padding: '28px 22px 22px',
                    boxShadow: '0 6px 28px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.07)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                {/* Lined paper texture */}
                <div
                    style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none', borderRadius: 12,
                        backgroundImage: 'repeating-linear-gradient(transparent, transparent 23px, var(--border) 24px)',
                        backgroundPosition: '0 42px',
                        opacity: 0.25,
                    }}
                />

                <div
                    style={{
                        fontFamily: 'var(--font-mono)', fontSize: '11px',
                        opacity: 0.38, marginBottom: 10, letterSpacing: '0.1em',
                        position: 'relative',
                    }}
                >
                    {number}
                </div>

                <div
                    style={{
                        fontSize: 'var(--modal-body)', fontWeight: 700, lineHeight: 1.35,
                        marginBottom: 12, color: 'var(--foreground)', position: 'relative',
                    }}
                >
                    {title}
                </div>

                {/* Structured decision layout */}
                {options ? (
                    <div style={{ position: 'relative' }}>
                        {problem && (
                            <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', lineHeight: 1.65, marginBottom: 14 }}>
                                {problem}
                            </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: cost || rationale ? 12 : 0 }}>
                            {options.map(opt => {
                                const isChosen = opt.key === chosen;
                                return (
                                    <div key={opt.key} style={{
                                        display: 'flex', alignItems: 'flex-start', gap: 10,
                                        padding: '9px 12px', borderRadius: 9,
                                        background: isChosen ? `${pinColor}11` : 'transparent',
                                        border: `1px solid ${isChosen ? `${pinColor}40` : 'var(--border)'}`,
                                        opacity: isChosen ? 1 : 0.48,
                                    }}>
                                        <div style={{
                                            width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                                            background: isChosen ? pinColor : 'transparent',
                                            border: `1.5px solid ${isChosen ? pinColor : 'var(--border)'}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '9px', fontWeight: 800,
                                            color: isChosen ? '#fff' : 'var(--muted-foreground)',
                                        }}>
                                            {opt.key}
                                        </div>
                                        <span style={{
                                            fontSize: 'var(--modal-floor)', lineHeight: 1.55,
                                            color: isChosen ? 'var(--foreground)' : 'var(--muted-foreground)',
                                            fontWeight: isChosen ? 500 : 400,
                                        }}>
                                            {opt.text}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                        {rationale && (
                            <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', lineHeight: 1.55, marginBottom: cost ? 10 : 0, paddingLeft: 2 }}>
                                {rationale}
                            </div>
                        )}
                        {cost && (
                            <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.05)', borderLeft: '2px solid rgba(239,68,68,0.3)', borderRadius: '0 6px 6px 0' }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(239,68,68,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Cost → </span>
                                <span style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', lineHeight: 1.5 }}>{cost}</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)', position: 'relative' }}>
                        {renderRich(description ?? '')}
                    </div>
                )}
            </div>
        </div>
    );
}

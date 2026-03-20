import { useEffect, useRef, useState } from 'react';
import '../index.css';
import workData from '../data/work_projects.json';
import { useTheme } from 'next-themes';

// Palette applied only in light theme — cycles by card index, never hardcoded per card
const LIGHT_PALETTE = ['#555879', '#98A1BC', '#DED3C4', '#F4EBD3'] as const;

// Perceived brightness (0–255). > 140 = treat as light background.
function hexBrightness(hex: string): number {
    if (!hex || hex.length < 7) return 0;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

interface WorkGridProps {
    onOpenProject?: (projectId: string) => void;
}

// Rich cover for cards without an image — adapts to light/dark background
function ColorCover({ isLight }: { isLight: boolean }) {
    const dot   = isLight ? 'rgba(0,0,0,0.13)'  : 'rgba(255,255,255,0.14)';
    const glow  = isLight ? 'rgba(0,0,0,0.07)'  : 'rgba(255,255,255,0.1)';
    const cFill = isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.04)';
    const cS1   = isLight ? 'rgba(0,0,0,0.10)'  : 'rgba(255,255,255,0.05)';
    const cS2   = isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.03)';
    const cS3   = isLight ? 'rgba(0,0,0,0.08)'  : 'rgba(255,255,255,0.04)';
    const ln    = isLight ? 'rgba(0,0,0,0.06)'  : 'rgba(255,255,255,0.03)';
    const fade  = isLight ? 'rgba(0,0,0,0.30)'  : 'rgba(0,0,0,0.55)';
    return (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `radial-gradient(circle, ${dot} 1px, transparent 1px)`,
                backgroundSize: '22px 22px',
            }} />
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse 65% 55% at 75% 20%, ${glow} 0%, transparent 65%)`,
            }} />
            <svg
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                viewBox="0 0 500 220"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
            >
                <circle cx="400" cy="-30" r="180" fill={cFill} />
                <circle cx="400" cy="-30" r="230" fill="none" stroke={cS1} strokeWidth="1" />
                <circle cx="400" cy="-30" r="290" fill="none" stroke={cS2} strokeWidth="1" />
                <circle cx="50" cy="250" r="130" fill="none" stroke={cS3} strokeWidth="1" />
                <line x1="0" y1="160" x2="500" y2="80" stroke={ln} strokeWidth="1" />
            </svg>
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%',
                background: `linear-gradient(to top, ${fade} 0%, transparent 100%)`,
            }} />
        </div>
    );
}

export default function WorkGrid({ onOpenProject }: WorkGridProps) {
    const gridRef = useRef<HTMLDivElement>(null);
    const [revealed, setRevealed] = useState(false);
    const [hoveredId, setHoveredId] = useState<number | null>(null);
    const { resolvedTheme: theme } = useTheme();

    // Short delay so the browser finishes painting before stagger begins.
    // Per-card stagger creates the weighted entrance — no clip-path needed.
    useEffect(() => {
        const t = setTimeout(() => setRevealed(true), 200);
        return () => clearTimeout(t);
    }, []);

    // Lazy-load videos
    useEffect(() => {
        const grid = gridRef.current;
        if (!grid) return;
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const card = entry.target as HTMLElement;
                    card.querySelectorAll<HTMLVideoElement>('video[data-src]').forEach(video => {
                        video.src = video.dataset.src!;
                        video.play().catch(() => {});
                    });
                    observer.unobserve(card);
                });
            },
            { rootMargin: '200px' }
        );
        grid.querySelectorAll<HTMLElement>('.work-item').forEach(card => observer.observe(card));
        return () => observer.disconnect();
    }, []);

    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    return (
        <div id="work-grid" className="work-grid-container">
            <div className="work-grid" ref={gridRef}>
                    {workData.map((itemData, cardIndex) => {
                        const item = itemData as any;
                        const isVideo = item.image?.endsWith('.mp4') ?? false;
                        const hasImage = !!item.image;
                        const hasModal = !!item.projectId;
                        const isHovered = hoveredId === item.id;

                        const handleClick = () => {
                            if (hasModal && onOpenProject) {
                                onOpenProject(item.projectId);
                            } else if (item.link) {
                                window.open(item.link, '_blank', 'noopener,noreferrer');
                            }
                        };

                        const staggerDelay = cardIndex * 0.08 + 0.1;
                        const cardBg = theme === 'light'
                            ? LIGHT_PALETTE[cardIndex % LIGHT_PALETTE.length]
                            : (item.cover_color ?? '#111');
                        // Flip all foreground colors when card background is perceptually light
                        const isLightCard = !hasImage && hexBrightness(cardBg) > 140;
                        // Light cards: dark gradient zone → white text still works (same as dark cards)
                        const textColor    = '#fff';
                        const textShadow   = isLightCard ? '0 1px 6px rgba(0,0,0,0.5)' : '0 1px 4px rgba(0,0,0,0.4)';
                        const tagRest      = isLightCard ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.6)';
                        const tagHoverClr  = '#fff';
                        const tagHoverBg   = isLightCard ? 'rgba(0,0,0,0.18)'  : 'rgba(255,255,255,0.15)';
                        const tagHoverBdr  = isLightCard ? 'rgba(0,0,0,0.25)'  : 'rgba(255,255,255,0.22)';
                        const labelGrad    = isLightCard
                            ? 'linear-gradient(to top, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0.12) 50%, transparent 100%)'
                            : 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)';
                        const hoverOverlay = isLightCard ? 'rgba(0,0,0,0.12)'  : 'rgba(0,0,0,0.45)';
                        const arrowStroke  = isLightCard ? 'rgba(0,0,0,0.55)'  : 'rgba(255,255,255,0.8)';
                        return (
                            <div
                                key={item.id}
                                className={`work-item work-item-${item.size}`}
                                aria-label={`Project: ${item.title}`}
                                role="button"
                                tabIndex={0}
                                onClick={handleClick}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
                                onMouseEnter={() => setHoveredId(item.id)}
                                onMouseLeave={() => setHoveredId(null)}
                                style={{
                                    position: 'relative',
                                    overflow: 'hidden',
                                    aspectRatio: item.aspect ?? undefined,
                                    cursor: hasModal || item.link ? 'pointer' : 'default',
                                    background: cardBg,
                                    boxShadow: theme === 'light'
                                        ? '0 0 0 1px rgba(0,0,0,0.08), 0 2px 16px rgba(0,0,0,0.07)'
                                        : 'none',
                                    opacity: revealed ? 1 : 0,
                                    transform: revealed ? 'none' : 'translateY(22px)',
                                    transition: `opacity 0.6s ${staggerDelay}s ${ease}, transform 0.7s ${staggerDelay}s ${ease}`,
                                }}
                            >
                                {/* Rich cover for no-image cards */}
                                {!hasImage && <ColorCover isLight={isLightCard} />}

                                {/* Blurred bg for image cards */}
                                {hasImage && !isVideo && (
                                    <div style={{
                                        position: 'absolute', inset: '-2px',
                                        backgroundImage: `url(${item.image})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        filter: 'blur(20px) brightness(0.7)',
                                        transform: isHovered ? 'scale(1.18)' : 'scale(1.1)',
                                        transition: `transform 0.7s ${ease}`,
                                        zIndex: 0,
                                    }} />
                                )}

                                {/* Main media */}
                                {isVideo ? (
                                    <video
                                        data-src={item.image}
                                        autoPlay loop muted playsInline preload="none"
                                        style={{
                                            display: 'block', position: 'absolute', inset: 0,
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            zIndex: 1, pointerEvents: 'none',
                                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                            transition: `transform 0.7s ${ease}`,
                                        }}
                                    />
                                ) : hasImage ? (
                                    <img
                                        src={item.image} alt={item.title} loading="lazy"
                                        style={{
                                            display: 'block', position: 'absolute', inset: 0,
                                            width: '100%', height: '100%', objectFit: 'cover',
                                            zIndex: 1, pointerEvents: 'none',
                                            transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                                            transition: `transform 0.7s ${ease}`,
                                        }}
                                    />
                                ) : null}

                                {/* Hover overlay */}
                                <div style={{
                                    position: 'absolute', inset: 0,
                                    background: hoverOverlay,
                                    opacity: isHovered ? 1 : 0,
                                    transition: 'opacity 0.35s ease',
                                    zIndex: 2,
                                }} />

                                {/* Label — always visible at bottom, lifts on hover */}
                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, right: 0,
                                    padding: '32px 18px 16px',
                                    background: labelGrad,
                                    zIndex: 3,
                                    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
                                    transition: `transform 0.4s ${ease}`,
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
                                        <div>
                                            <div style={{
                                                fontSize: '13px', fontWeight: 700,
                                                color: textColor, lineHeight: 1.3, marginBottom: 4,
                                                textShadow,
                                            }}>
                                                {item.title}
                                            </div>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 2 }}>
                                            {(item.type as string).split('·').map((tag: string, i: number) => (
                                                <span key={i} style={{
                                                    fontSize: '10px',
                                                    letterSpacing: '0.03em',
                                                    lineHeight: 1,
                                                    padding: isHovered ? '3px 8px' : '0 2px',
                                                    borderRadius: 100,
                                                    background: isHovered ? tagHoverBg : 'transparent',
                                                    border: `1px solid ${isHovered ? tagHoverBdr : 'transparent'}`,
                                                    color: isHovered ? tagHoverClr : tagRest,
                                                    transform: isHovered ? 'translateY(0)' : 'translateY(3px)',
                                                    transition: `all 0.3s ${i * 0.055}s ${ease}`,
                                                }}>
                                                    {tag.trim()}
                                                </span>
                                            ))}
                                        </div>
                                        </div>
                                        {/* Arrow hint on hover */}
                                        <div style={{
                                            opacity: isHovered ? 1 : 0,
                                            transform: isHovered ? 'translateX(0)' : 'translateX(-6px)',
                                            transition: `opacity 0.3s 0.05s, transform 0.3s 0.05s ${ease}`,
                                            flexShrink: 0,
                                        }}>
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={arrowStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="5" y1="12" x2="19" y2="12" />
                                                <polyline points="12 5 19 12 12 19" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
        </div>
    );
}

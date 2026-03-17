import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProjectMeta {
    title: string;
    subtitle: string;
    company: string;
    year: string;
    duration: string;
    role: string;
    team_size: string;
    cover_color: string;
    tags: string[];
}

interface Section {
    id: string;
    label: string;
    type: 'hero' | 'statement' | 'text_media' | 'decisions';
    data: any;
}

interface ProjectData {
    id: string;
    meta: ProjectMeta;
    sections: Section[];
}

// ─── Project Loader Registry ──────────────────────────────────────────────────
// Static map so Vite can tree-shake and chunk correctly

const PROJECT_LOADERS: Record<string, () => Promise<{ default: ProjectData }>> = {
    'allianz-doc-classification': () => import('../data/projects/allianz-doc-classification.json') as any,
};

// ─── Image Placeholder ────────────────────────────────────────────────────────

function ImagePlaceholder({ height = 320, label = 'Visual placeholder' }: { height?: number; label?: string }) {
    return (
        <div style={{
            width: '100%',
            height,
            background: 'var(--muted)',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--muted-foreground)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.05em',
            border: '1px solid var(--border)',
        }}>
            {label}
        </div>
    );
}

// ─── Section Renderers ────────────────────────────────────────────────────────

function HeroSection({ data, meta }: { data: any; meta: ProjectMeta }) {
    return (
        <div style={{ marginBottom: 64 }}>
            {/* Cover */}
            <div style={{
                width: '100%',
                height: 320,
                background: meta.cover_color,
                borderRadius: 12,
                marginBottom: 40,
                display: 'flex',
                alignItems: 'flex-end',
                padding: '32px 40px',
                boxSizing: 'border-box',
            }}>
                {/* Product icon placeholder */}
                <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 12,
                    background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                    </svg>
                </div>
            </div>

            {/* Headline */}
            <h2 style={{
                fontSize: 'clamp(24px, 3vw, 36px)',
                fontWeight: 700,
                lineHeight: 1.2,
                margin: '0 0 16px',
                color: 'var(--foreground)',
            }}>
                {data.headline}
            </h2>
            <p style={{
                fontSize: 'var(--text-base)',
                lineHeight: 1.7,
                color: 'var(--muted-foreground)',
                margin: '0 0 40px',
                maxWidth: 640,
            }}>
                {data.body}
            </p>

            {/* Stats row */}
            <div style={{
                display: 'flex',
                gap: 32,
                flexWrap: 'wrap',
                paddingTop: 32,
                borderTop: '1px solid var(--border)',
            }}>
                {data.stats.map((s: { label: string; value: string }) => (
                    <div key={s.label}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                            {s.label}
                        </div>
                        <div style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--foreground)' }}>
                            {s.value}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function StatementSection({ data }: { data: any }) {
    return (
        <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                {data.eyebrow}
            </div>
            <h3 style={{
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontWeight: 700,
                lineHeight: 1.3,
                margin: '0 0 24px',
                color: 'var(--foreground)',
            }}>
                {data.headline}
            </h3>
            <p style={{
                fontSize: 'var(--text-base)',
                lineHeight: 1.8,
                color: 'var(--muted-foreground)',
                margin: '0 0 32px',
            }}>
                {data.body}
            </p>
            {data.next && (
                <div style={{
                    padding: '16px 20px',
                    background: 'var(--muted)',
                    borderRadius: 8,
                    borderLeft: '3px solid var(--foreground)',
                }}>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                        Next Step
                    </div>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.6, color: 'var(--foreground)' }}>
                        {data.next}
                    </p>
                </div>
            )}
            <div style={{ marginTop: 32 }}>
                <ImagePlaceholder height={280} label="Visual — coming soon" />
            </div>
        </div>
    );
}

function TextMediaSection({ data }: { data: any }) {
    const isTextLeft = data.layout === 'text_left';
    const listItems: string[] = data.highlights ?? data.insights ?? data.outcomes ?? [];

    const textBlock = (
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                {data.eyebrow}
            </div>
            <h3 style={{
                fontSize: 'clamp(18px, 2vw, 24px)',
                fontWeight: 700,
                lineHeight: 1.3,
                margin: '0 0 16px',
                color: 'var(--foreground)',
            }}>
                {data.headline}
            </h3>
            <p style={{
                fontSize: 'var(--text-sm)',
                lineHeight: 1.8,
                color: 'var(--muted-foreground)',
                margin: '0 0 24px',
            }}>
                {data.body}
            </p>
            {listItems.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {listItems.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 'var(--text-sm)', color: 'var(--foreground)' }}>
                            <span style={{ opacity: 0.4, flexShrink: 0, marginTop: 2 }}>—</span>
                            <span style={{ lineHeight: 1.6 }}>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );

    const mediaBlock = (
        <div style={{ flex: '1 1 0', minWidth: 0 }}>
            <ImagePlaceholder height={260} label="Visual — coming soon" />
        </div>
    );

    return (
        <div style={{
            display: 'flex',
            gap: 48,
            marginBottom: 64,
            flexWrap: 'wrap',
        }}>
            {isTextLeft ? <>{textBlock}{mediaBlock}</> : <>{mediaBlock}{textBlock}</>}
        </div>
    );
}

function DecisionsSection({ data }: { data: any }) {
    return (
        <div style={{ marginBottom: 64 }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>
                {data.eyebrow}
            </div>
            <h3 style={{
                fontSize: 'clamp(18px, 2vw, 24px)',
                fontWeight: 700,
                lineHeight: 1.3,
                margin: '0 0 40px',
                color: 'var(--foreground)',
            }}>
                {data.headline}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {data.items.map((item: { number: string; title: string; description: string }, i: number) => (
                    <div key={i} style={{
                        display: 'flex',
                        gap: 24,
                        padding: '24px 0',
                        borderTop: '1px solid var(--border)',
                    }}>
                        <div style={{
                            fontFamily: 'var(--font-mono, monospace)',
                            fontSize: 'var(--text-xs)',
                            color: 'var(--muted-foreground)',
                            fontWeight: 600,
                            flexShrink: 0,
                            width: 28,
                            paddingTop: 2,
                        }}>
                            {item.number}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--text-base)', color: 'var(--foreground)', marginBottom: 8 }}>
                                {item.title}
                            </div>
                            <p style={{ margin: 0, fontSize: 'var(--text-sm)', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>
                                {item.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function ModalSkeleton() {
    const pulse = {
        background: 'var(--muted)',
        borderRadius: 6,
        animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    } as React.CSSProperties;

    return (
        <div>
            <div style={{ ...pulse, height: 320, borderRadius: 12, marginBottom: 40 }} />
            <div style={{ ...pulse, height: 36, width: '70%', marginBottom: 16 }} />
            <div style={{ ...pulse, height: 20, width: '90%', marginBottom: 8 }} />
            <div style={{ ...pulse, height: 20, width: '80%', marginBottom: 40 }} />
            <div style={{ display: 'flex', gap: 32 }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ flex: 1 }}>
                        <div style={{ ...pulse, height: 12, marginBottom: 8 }} />
                        <div style={{ ...pulse, height: 20 }} />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Section Renderer Dispatcher ─────────────────────────────────────────────

function SectionRenderer({ section, meta }: { section: Section; meta: ProjectMeta }) {
    switch (section.type) {
        case 'hero': return <HeroSection data={section.data} meta={meta} />;
        case 'statement': return <StatementSection data={section.data} />;
        case 'text_media': return <TextMediaSection data={section.data} />;
        case 'decisions': return <DecisionsSection data={section.data} />;
        default: return null;
    }
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ProjectModalProps {
    projectId: string | null;
    onClose: () => void;
}

export default function ProjectModal({ projectId, onClose }: ProjectModalProps) {
    const [data, setData] = useState<ProjectData | null>(null);
    const [_loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [scrollY, setScrollY] = useState(0);
    const [mounted, setMounted] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    // Load project data
    useEffect(() => {
        if (!projectId) {
            setData(null);
            setLoading(false);
            setContentVisible(false);
            return;
        }
        const loader = PROJECT_LOADERS[projectId];
        if (!loader) return;

        setLoading(true);
        setContentVisible(false);
        setData(null);

        loader().then(mod => {
            setData(mod.default);
            setLoading(false);
            // Small delay so skeleton is visible, then fade in
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setContentVisible(true));
            });
        });
    }, [projectId]);

    // Modal entrance animation
    useEffect(() => {
        if (!projectId) { setMounted(false); setScrollY(0); return; }
        requestAnimationFrame(() => setMounted(true));
    }, [projectId]);

    // Scroll lock + escape key
    useEffect(() => {
        if (!projectId) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = '';
            document.removeEventListener('keydown', onKey);
        };
    }, [projectId, onClose]);

    // IntersectionObserver — highlight active sidebar item
    useEffect(() => {
        if (!data) return;
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) setActiveSection(entry.target.id);
                });
            },
            { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );
        data.sections.forEach(s => {
            const el = sectionRefs.current[s.id];
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [data]);

    if (!projectId) return null;

    // Breadcrumb gradient fades in over first 80px
    const navOpacity = Math.min(scrollY / 80, 1);
    // Sidebar slides in after scrolling past the hero cover (~160px)
    const sidebarVisible = scrollY > 160;

    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const modal = (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                background: 'var(--background)',
                zIndex: 2000,
                overflow: 'hidden',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(20px)',
                transition: `opacity 0.45s ${ease}, transform 0.45s ${ease}`,
            }}
        >
            {/* ── Floating breadcrumb nav ─────────────────────────── */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: 56,
                zIndex: 20,
                pointerEvents: 'none',
            }}>
                {/* Gradient background layer — fades in gently as user scrolls */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, var(--background) 20%, transparent 100%)',
                    opacity: navOpacity * 0.85,
                    transition: `opacity 0.5s ${ease}`,
                    pointerEvents: 'none',
                }} />

                {/* Breadcrumb content */}
                <div style={{
                    position: 'relative',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    pointerEvents: 'auto',
                }}>
                    {/* Owner dot + name (click = back to home) */}
                    <button
                        onClick={onClose}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 7,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: 6,
                            transition: 'opacity 0.2s',
                            color: 'var(--foreground)',
                        }}
                        onMouseEnter={e => e.currentTarget.style.opacity = '0.6'}
                        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        aria-label="Back to portfolio"
                    >
                        {/* Accent dot */}
                        <span style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: data ? data.meta.cover_color : 'var(--foreground)',
                            display: 'block',
                            flexShrink: 0,
                            transition: 'background 0.3s',
                        }} />
                        <span style={{
                            fontSize: 'var(--text-base)',
                            fontWeight: 500,
                            lineHeight: 1,
                        }}>
                            Nate
                        </span>
                    </button>

                    {/* Chevron */}
                    <ChevronRight
                        size={12}
                        style={{ color: 'var(--muted-foreground)', flexShrink: 0 }}
                    />

                    {/* Project name (fades in once data is loaded) */}
                    <span style={{
                        fontSize: 'var(--text-base)',
                        color: 'var(--foreground)',
                        opacity: data ? 1 : 0,
                        transition: 'opacity 0.4s ease',
                        maxWidth: 320,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}>
                        {data?.meta.title ?? ''}
                    </span>
                </div>
            </div>

            {/* ── Body: full-width scroll + absolute sidebar ───────── */}
            <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>

                {/* Sidebar nav — absolutely positioned, floats over left edge */}
                <nav style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: 160,
                    padding: '80px 0 40px 32px',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    zIndex: 5,
                    opacity: sidebarVisible ? 1 : 0,
                    transform: sidebarVisible ? 'translateX(0)' : 'translateX(-10px)',
                    transition: `opacity 0.6s ${ease}, transform 0.6s ${ease}`,
                }}>
                    {/* Home link */}
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            padding: '6px 0 6px 0',
                            fontSize: 'var(--text-sm)',
                            color: 'var(--muted-foreground)',
                            marginBottom: 16,
                            transition: 'color 0.2s',
                            fontFamily: 'inherit',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'}
                        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                    >
                        Home
                    </button>

                    {/* Section items */}
                    {(data?.sections ?? []).map(s => {
                        const section = s as Section;
                        const isActive = activeSection === section.id;
                        return (
                            <button
                                key={section.id}
                                onClick={() => {
                                    sectionRefs.current[section.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    padding: '5px 0',
                                    fontSize: 'var(--text-sm)',
                                    fontWeight: isActive ? 600 : 400,
                                    color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    transition: 'color 0.25s, font-weight 0.25s',
                                    lineHeight: 1.5,
                                    fontFamily: 'inherit',
                                }}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--foreground)'; }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)'; }}
                            >
                                {section.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Main scrollable content — full width, full height */}
                <div
                    ref={contentRef}
                    onScroll={e => setScrollY((e.currentTarget).scrollTop)}
                    style={{
                        width: '100%',
                        height: '100%',
                        overflowY: 'auto',
                    }}
                >
                    {/* Centered inner wrapper */}
                    <div style={{ maxWidth: 720, margin: '0 auto', padding: '72px 24px 120px' }}>

                    {/* Tags */}
                    {data && (
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
                            {data.meta.tags.map(tag => (
                                <span key={tag} style={{
                                    fontSize: 'var(--text-xs)',
                                    padding: '4px 10px',
                                    borderRadius: 100,
                                    border: '1px solid var(--border)',
                                    color: 'var(--muted-foreground)',
                                    letterSpacing: '0.04em',
                                }}>
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Skeleton */}
                    {!contentVisible && <ModalSkeleton />}

                    {/* Content fades in */}
                    {data && (
                        <div style={{
                            opacity: contentVisible ? 1 : 0,
                            transition: `opacity 0.55s ${ease}`,
                        }}>
                            {data.sections.map(section => (
                                <div
                                    key={section.id}
                                    id={section.id}
                                    ref={el => { sectionRefs.current[section.id] = el; }}
                                >
                                    <SectionRenderer section={section} meta={data.meta} />
                                </div>
                            ))}
                        </div>
                    )}

                    </div> {/* end centered wrapper */}
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}

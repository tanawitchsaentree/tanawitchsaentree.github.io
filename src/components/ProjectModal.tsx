import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronRight, ChevronDown } from 'lucide-react';
import workData from '../data/work_projects.json';
import { PinnedCard } from './ui/PinnedCard';
import { SmartTooltip } from './ui/SmartTooltip';

// ─── Modal Scroll Context ──────────────────────────────────────────────────────
const ModalScrollCtx = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

// ─── Project Accent Color Context ─────────────────────────────────────────────
// Carries meta.cover_color into deeply nested section renderers.
// All 3 project colors are 6-digit hex — accent + '18' = 8-digit hex (CSS valid).
const ProjectAccentCtx = createContext('#888888');

// ─── Scroll-triggered visibility hook ─────────────────────────────────────────
function useInView(threshold = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const containerRef = useContext(ModalScrollCtx);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const root = (containerRef?.current as HTMLElement | null) ?? null;
        const obs = new IntersectionObserver(
            ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
            { threshold, root }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [threshold, containerRef]);
    return [ref, visible] as const;
}

// ─── Cover parallax (tracks modal scroll top) ─────────────────────────────────
function useCoverScroll(): number {
    const containerRef = useContext(ModalScrollCtx);
    const [pct, setPct] = useState(0);
    useEffect(() => {
        const c = containerRef?.current;
        if (!c) return;
        const update = () => setPct(Math.min(c.scrollTop / Math.max(c.clientHeight * 0.8, 1), 1));
        c.addEventListener('scroll', update, { passive: true });
        return () => c.removeEventListener('scroll', update);
    }, [containerRef]);
    return pct;
}

// ─── Keyframes injected once ───────────────────────────────────────────────────
const MODAL_CSS = `
@keyframes m-fade-up   { from { opacity:0; transform:translateY(48px) } to { opacity:1; transform:none } }
@keyframes m-scale-in  { from { opacity:0; transform:scale(0.88) }      to { opacity:1; transform:scale(1) } }
@keyframes m-slide-r   { from { opacity:0; transform:translateX(-36px) } to { opacity:1; transform:none } }
@keyframes m-slide-l   { from { opacity:0; transform:translateX(36px) }  to { opacity:1; transform:none } }
@keyframes m-blur-in   { from { opacity:0; filter:blur(14px); transform:scale(0.96) } to { opacity:1; filter:blur(0); transform:scale(1) } }
@keyframes m-spring-in { 0%{ opacity:0; transform:scale(0.4) } 60%{ transform:scale(1.12) } 100%{ opacity:1; transform:scale(1) } }
@keyframes m-row-in    { from { opacity:0; transform:translateY(18px) } to { opacity:1; transform:none } }
@keyframes m-bar-wipe  { from { width:0; opacity:0 } to { width:40px; opacity:1 } }
@keyframes m-word-up   { from { opacity:0; transform:translateY(22px) } to { opacity:1; transform:none } }
@keyframes m-shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
@keyframes blink       { 0%,100%{opacity:0.3} 50%{opacity:1} }
@keyframes drift-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(0.9)} }
@keyframes drift-fade  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
@keyframes drift-toast { 0%{opacity:0;transform:translateY(-6px)} 15%,85%{opacity:1;transform:none} 100%{opacity:0} }
@keyframes drift-pop   { 0%{transform:scale(1)} 40%{transform:scale(1.35)} 100%{transform:scale(1)} }
@keyframes drift-screen-fwd  { from{opacity:0;transform:translateX(28px)}  to{opacity:1;transform:translateX(0)} }
@keyframes drift-screen-back { from{opacity:0;transform:translateX(-28px)} to{opacity:1;transform:translateX(0)} }
@keyframes drift-el-in       { from{opacity:0;transform:translateY(14px)}  to{opacity:1;transform:none} }
.recipe-carousel::-webkit-scrollbar { display: none }
.scrolling-cards-track::-webkit-scrollbar { display: none }
.scrolling-cards-track { -ms-overflow-style: none; scrollbar-width: none; }
`;

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProjectMeta {
    title: string;
    subtitle?: string;
    company?: string;
    year?: string;
    duration?: string;
    role?: string;
    team_size?: string;
    cover_color?: string;
    tags?: string[];
    client?: string;
    roles?: string[];
}
interface MotionSpec {
    enter?: 'fade_up' | 'fade_in' | 'blur_in' | 'slide_left' | 'slide_right' | 'none';
    duration?: number;   // seconds
    delay?: number;      // seconds
    y_enter?: number;    // translateY px when hidden
    stagger?: number;    // seconds between staggered children
    easing?: string;     // CSS cubic-bezier or alias: fast_out | symmetric | spring
}
interface Section { id: string; label?: string; type: string; data: any; motion_spec?: MotionSpec; creative_direction?: { tone?: string; notes?: string }; }
interface ProjectData { id: string; meta: ProjectMeta; sections: Section[]; }

// ─── Motion helpers ───────────────────────────────────────────────────────────
const EASINGS: Record<string, string> = {
    fast_out:  'cubic-bezier(0.16, 1, 0.3, 1)',
    symmetric: 'cubic-bezier(0.65, 0, 0.35, 1)',
    spring:    'cubic-bezier(0.34, 1.56, 0.64, 1)',
};
const DEFAULT_MOTION: Required<MotionSpec> = {
    enter: 'fade_up', duration: 0.7, delay: 0, y_enter: 32, stagger: 0.08,
    easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
};
function useMotion(spec?: MotionSpec) {
    const m = { ...DEFAULT_MOTION, ...spec };
    const ease = EASINGS[m.easing] ?? m.easing;
    function entranceStyle(extraDelay = 0, visible = false): React.CSSProperties {
        const d = m.delay + extraDelay;
        const base = `opacity ${m.duration}s ${d}s ${ease}, transform ${m.duration}s ${d}s ${ease}`;
        const blurT = m.enter === 'blur_in' ? `, filter ${m.duration}s ${d}s ${ease}` : '';
        const tx = m.enter === 'slide_left'  ? `translateX(-${m.y_enter}px)`
                 : m.enter === 'slide_right' ? `translateX(${m.y_enter}px)`
                 : m.enter === 'blur_in'     ? 'scale(0.97)'
                 : m.enter === 'none'        ? 'none'
                 : `translateY(${m.y_enter}px)`;
        return {
            opacity: visible ? 1 : (m.enter === 'none' ? 1 : 0),
            transform: visible ? 'none' : tx,
            filter: m.enter === 'blur_in' ? (visible ? 'blur(0px)' : 'blur(12px)') : undefined,
            transition: m.enter !== 'none' ? base + blurT : undefined,
        };
    }
    return { m, ease, entranceStyle };
}

// ─── Project Loader Registry ──────────────────────────────────────────────────
const PROJECT_LOADERS: Record<string, () => Promise<{ default: ProjectData }>> = {
    'allianz-doc-classification': () => import('../data/projects/allianz-doc-classification.json') as any,
    'profita-mutual-fund': () => import('../data/projects/profita-mutual-fund.json') as any,
    'stellar-recipe-app': () => import('../data/projects/stellar-recipe-app.json') as any,
    'roomvu-redesign': () => import('../data/projects/roomvu-redesign.json') as any,
    'drift-nomad-app': () => import('../data/projects/drift-nomad-app.json') as any,
};
export const KNOWN_PROJECT_IDS = Object.keys(PROJECT_LOADERS);

// ─── Shared helpers ───────────────────────────────────────────────────────────
function ImagePlaceholder({ height = 320, label = 'Visual placeholder' }: { height?: number; label?: string }) {
    return (
        <div style={{
            width: '100%', height, background: 'var(--muted)', borderRadius: 10,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
            border: '1.5px dashed var(--border)',
        }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.35 }}>
                <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', opacity: 0.45 }}>Image needed</div>
            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '72%', lineHeight: 1.6, opacity: 0.7 }}>{label}</div>
        </div>
    );
}
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
function Eyebrow({ text }: { text: string }) {
    return (
        <div style={{
            fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16,
        }}>{text}</div>
    );
}

// ─── Allianz Section Renderers ────────────────────────────────────────────────
function HeroSection({ data, meta }: { data: any; meta: ProjectMeta }) {
    return (
        <div style={{ marginBottom: 72 }}>
            <div style={{
                width: 76, height: 76, borderRadius: 18, background: meta.cover_color,
                marginBottom: 52, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            </div>
            <div style={{ display: 'flex', gap: 64, alignItems: 'flex-start' }}>
                <div style={{ flex: '1 1 0', minWidth: 0 }}>
                    <h2 style={{ fontSize: 'var(--modal-display)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 24px', color: 'var(--foreground)' }}>{data.headline}</h2>
                    <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.8, color: 'var(--foreground)' }}>{renderRich(data.body)}</div>
                </div>
                <div style={{ width: 160, flexShrink: 0, paddingTop: 6 }}>
                    {data.stats.map((s: { label: string; value: string }) => (
                        <div key={s.label} style={{ marginBottom: 24 }}>
                            <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
                            <div style={{ fontSize: 'var(--modal-body)', fontWeight: 500, color: 'var(--foreground)', lineHeight: 1.5 }}>{s.value}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
function StatementSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.1);
    const { entranceStyle } = useMotion(motion);
    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            <div style={entranceStyle(0, visible)}>
                <Eyebrow text={data.eyebrow} />
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 24px', color: 'var(--foreground)' }}>{data.headline}</h3>
                <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.8, color: 'var(--foreground)', marginBottom: 32 }}>{renderRich(data.body)}</div>
                {data.next && (
                    <div style={{ padding: '16px 20px', background: 'var(--muted)', borderRadius: 8, borderLeft: '3px solid var(--foreground)' }}>
                        <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Next Step</div>
                        <p style={{ margin: 0, fontSize: 'var(--modal-body)', lineHeight: 1.6, color: 'var(--foreground)' }}>{data.next}</p>
                    </div>
                )}
                {data.image && <div style={{ marginTop: 32 }}><ImagePlaceholder height={280} label={data.image_hint ?? 'Visual — coming soon'} /></div>}
            </div>
        </div>
    );
}
function TextMediaSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.08);
    const { m, entranceStyle } = useMotion(motion);
    const isTextLeft = data.layout === 'text_left';
    const listItems: string[] = data.highlights ?? data.insights ?? data.outcomes ?? [];
    const textBlock = (
        <div style={{ flex: '1 1 0', minWidth: 0, ...entranceStyle(0, visible) }}>
            <Eyebrow text={data.eyebrow} />
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 16px', color: 'var(--foreground)' }}>{data.headline}</h3>
            <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.8, color: 'var(--foreground)', marginBottom: 24 }}>{renderRich(data.body)}</div>
            {listItems.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {listItems.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 'var(--modal-body)', color: 'var(--foreground)' }}>
                            <span style={{ opacity: 0.4, flexShrink: 0, marginTop: 2 }}>—</span>
                            <span style={{ lineHeight: 1.6 }}>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
    const mediaBlock = data.image
        ? <div style={{ flex: '1 1 0', minWidth: 0, ...entranceStyle(m.stagger, visible) }}><ImagePlaceholder height={260} label={data.image_hint ?? 'Visual — coming soon'} /></div>
        : null;
    return (
        <div ref={ref} style={{ display: 'flex', gap: 48, marginBottom: 64, flexWrap: 'wrap' }}>
            {mediaBlock
                ? (isTextLeft ? <>{textBlock}{mediaBlock}</> : <>{mediaBlock}{textBlock}</>)
                : textBlock}
        </div>
    );
}
function DecisionsSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.08);
    const { m, entranceStyle } = useMotion(motion);
    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            <div style={entranceStyle(0, visible)}>
                <Eyebrow text={data.eyebrow} />
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 40px', color: 'var(--foreground)' }}>{data.headline}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {data.items.map((item: { number: string; title: string; description: string }, i: number) => (
                    <div key={i} style={{
                        display: 'flex', gap: 24, padding: '24px 0', borderTop: '1px solid var(--border)',
                        ...entranceStyle(i * m.stagger, visible),
                    }}>
                        <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', fontWeight: 600, flexShrink: 0, width: 28, paddingTop: 2 }}>{item.number}</div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--modal-body)', color: 'var(--foreground)', marginBottom: 8 }}>{item.title}</div>
                            <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--foreground)' }}>{renderRich(item.description)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// PINNED CARDS — zigzag memo-board layout with pushpins
// Use for: design decisions, research insights, key learnings (3–5 items)
function PinnedCardsSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.08);
    const { m } = useMotion(motion);

    return (
        <div ref={ref} style={{ marginBottom: 72 }}>
            <Eyebrow text={data.eyebrow} />
            <h3 style={{
                fontSize: 'var(--modal-heading)', fontWeight: 700,
                lineHeight: 1.3, margin: '0 0 48px', color: 'var(--foreground)',
            }}>
                {data.headline}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {data.items.map((item: { number: string; title: string; description: string }, i: number) => (
                    <PinnedCard
                        key={i}
                        number={item.number}
                        title={item.title}
                        description={item.description}
                        index={i}
                        visible={visible}
                        delay={i * (m.stagger ?? 0.12)}
                    />
                ))}
            </div>
        </div>
    );
}

// ─── Universal Section Renderers ──────────────────────────────────────────────

// BIG NUMBER — single dramatic metric, full-bleed muted bg
function BigNumberSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.2);
    const accent = useContext(ProjectAccentCtx);
    const { entranceStyle } = useMotion(motion ?? { enter: 'fade_up', duration: 0.9, y_enter: 40 });
    return (
        <div ref={ref} style={{ margin: '0 -40px', padding: '72px 40px', background: 'var(--muted)', marginBottom: 72, textAlign: 'center' }}>
            <div style={entranceStyle(0, visible)}>
                {data.eyebrow && <Eyebrow text={data.eyebrow} />}
                <div style={{ fontSize: 'clamp(72px, 12vw, 120px)', fontWeight: 800, lineHeight: 0.9, letterSpacing: '-0.03em', color: accent, marginBottom: 16 }}>
                    {data.value}
                    {data.unit && <span style={{ fontSize: '0.35em', fontWeight: 700, marginLeft: '0.15em', verticalAlign: 'super', display: 'inline-block' }}>{data.unit}</span>}
                </div>
                <div style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, color: 'var(--foreground)', marginBottom: data.body ? 16 : 0 }}>{data.label}</div>
                {data.body && <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)', maxWidth: 520, margin: '0 auto' }}>{data.body}</p>}
            </div>
        </div>
    );
}

// STAT GRID — 2–4 metrics, hover scales number + surfaces context
function StatGridSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.1);
    const accent = useContext(ProjectAccentCtx);
    const { m, entranceStyle } = useMotion(motion);
    const [hovered, setHovered] = useState<number | null>(null);
    const stats: { value: string; label: string; context?: string }[] = data.stats ?? [];
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            {data.eyebrow && <div style={entranceStyle(0, visible)}><Eyebrow text={data.eyebrow} /></div>}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 12 }}>
                {stats.map((stat, i) => (
                    <div key={i} style={entranceStyle(i * m.stagger, visible)}>
                        <div
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                padding: '28px 24px', borderRadius: 12, background: 'var(--muted)',
                                border: `1px solid ${hovered === i ? `${accent}55` : 'var(--border)'}`,
                                boxShadow: hovered === i ? `0 4px 20px ${accent}18` : 'none',
                                transition: `border-color 0.25s, box-shadow 0.3s ${ease}`,
                                cursor: 'default',
                            }}
                        >
                            <div style={{
                                fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 800,
                                letterSpacing: '-0.02em', color: accent, lineHeight: 1, marginBottom: 8,
                                transform: hovered === i ? 'scale(1.1)' : 'scale(1)',
                                transformOrigin: 'left center',
                                transition: `transform 0.3s ${ease}`,
                                display: 'inline-block',
                            }}>{stat.value}</div>
                            <div style={{
                                fontSize: 'var(--modal-body)', fontWeight: 600, color: 'var(--foreground)',
                                lineHeight: 1.3, marginBottom: stat.context ? 5 : 0,
                            }}>{stat.label}</div>
                            {stat.context && (
                                <div style={{
                                    fontSize: '11px', lineHeight: 1.5,
                                    color: hovered === i ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    fontWeight: hovered === i ? 600 : 400,
                                    transition: 'color 0.2s, font-weight 0.2s',
                                }}>{stat.context}</div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// BEFORE / AFTER — paired transformation rows
// Each row = one before item directly paired with its after item.
// Hover a row: before fades (old reality), arrow lights up, after glows (new reality).
// grid ensures left/right cells share the same height — no alignment drift.
function BeforeAfterSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.08);
    const accent = useContext(ProjectAccentCtx);
    const { m } = useMotion(motion);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const beforeItems: string[] = data.before?.items ?? [];
    const afterItems: string[]  = data.after?.items ?? [];
    const rowCount = Math.max(beforeItems.length, afterItems.length);
    const [hovRow, setHovRow] = useState<number|null>(null);

    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            {data.eyebrow && <Eyebrow text={data.eyebrow} />}

            {/* Column header row */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 36px 1fr', gap:'0 8px', marginBottom:12 }}>
                <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:'var(--muted-foreground)', opacity: visible?1:0, transition:`opacity 0.4s ${ease}` }}>
                    {data.before?.label ?? 'Before'}
                </div>
                <div />
                <div style={{ fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.09em', color:accent, opacity: visible?1:0, transition:`opacity 0.4s 0.06s ${ease}` }}>
                    {data.after?.label ?? 'After'}
                </div>
            </div>

            {/* Paired rows — left and right cells share the same grid row height */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {Array.from({ length: rowCount }).map((_, i) => {
                    const before = beforeItems[i];
                    const after  = afterItems[i];
                    const isHov  = hovRow === i;
                    const delay  = i * 0.07 + (m.delay ?? 0);
                    return (
                        <div key={i}
                            onMouseEnter={() => setHovRow(i)}
                            onMouseLeave={() => setHovRow(null)}
                            style={{ display:'grid', gridTemplateColumns:'1fr 36px 1fr', gap:'0 8px', alignItems:'stretch', cursor:'default', opacity: visible?1:0, transform: visible?'none':'translateY(14px)', transition:`opacity 0.5s ${delay}s ${ease}, transform 0.5s ${delay}s ${ease}` }}>

                            {/* Before cell */}
                            {before ? (
                                <div style={{ padding:'11px 14px', borderRadius:9, background:'var(--muted)', border:'1px solid var(--border)', display:'flex', gap:9, alignItems:'flex-start', opacity: isHov ? 0.28 : 0.85, transition:'opacity 0.22s ease' }}>
                                    <span style={{ color:'var(--muted-foreground)', flexShrink:0, fontWeight:700, fontSize:'11px', lineHeight:'1.6', opacity:0.5, userSelect:'none' }}>—</span>
                                    <span style={{ fontSize:'var(--modal-body)', color:'var(--muted-foreground)', lineHeight:1.55 }}>{before}</span>
                                </div>
                            ) : <div />}

                            {/* Arrow connector — lights up on hover, nudges right */}
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', color: isHov ? accent : 'var(--muted-foreground)', opacity: isHov ? 1 : 0.3, fontSize:'15px', fontWeight:800, transform: isHov ? 'translateX(3px)' : 'none', transition:'color 0.2s ease, opacity 0.2s ease, transform 0.2s ease', userSelect:'none' }}>→</div>

                            {/* After cell */}
                            {after ? (
                                <div style={{ padding:'11px 14px 11px 12px', borderRadius:9, background: isHov ? `${accent}10` : 'var(--background)', border:`1px solid ${isHov ? `${accent}45` : 'var(--border)'}`, borderLeft:`2.5px solid ${isHov ? accent : `${accent}55`}`, boxShadow: isHov ? `0 3px 18px ${accent}14` : 'none', display:'flex', gap:9, alignItems:'flex-start', transition:'background 0.22s ease, border-color 0.22s ease, box-shadow 0.28s ease' }}>
                                    <span style={{ color:accent, flexShrink:0, fontSize:'11px', lineHeight:'1.6', fontWeight:700, opacity: isHov ? 1 : 0.5, transition:'opacity 0.2s' }}>→</span>
                                    <span style={{ fontSize:'var(--modal-body)', color:'var(--foreground)', lineHeight:1.55, fontWeight: isHov ? 500 : 400, transition:'font-weight 0.15s' }}>{after}</span>
                                </div>
                            ) : <div />}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// INSIGHT CARDS — 2–3 cards with icon + headline + body
function InsightCardsSection({ data, motion }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.1);
    const accent = useContext(ProjectAccentCtx);
    const { m, entranceStyle } = useMotion(motion);
    const [hovered, setHovered] = useState<number | null>(null);
    const items: { icon?: string; headline: string; body: string }[] = data.items ?? [];
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            {data.eyebrow && <div style={entranceStyle(0, visible)}><Eyebrow text={data.eyebrow} /></div>}
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 12 }}>
                {items.map((item, i) => (
                    <div key={i} style={entranceStyle(i * m.stagger, visible)}>
                        <div
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                padding: '28px 24px', borderRadius: 14, background: 'var(--muted)',
                                border: `1px solid ${hovered === i ? `${accent}55` : 'var(--border)'}`,
                                boxShadow: hovered === i ? `0 8px 32px ${accent}20` : 'none',
                                transform: hovered === i ? 'translateY(-6px)' : 'none',
                                transition: `border-color 0.25s, box-shadow 0.3s ${ease}, transform 0.3s ${ease}`,
                                cursor: 'default', height: '100%', boxSizing: 'border-box',
                            }}
                        >
                            {item.icon && (
                                <div style={{
                                    width: 38, height: 38, borderRadius: 10,
                                    background: hovered === i ? `${accent}35` : `${accent}18`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 18, fontSize: '17px',
                                    transition: 'background 0.25s',
                                }}>
                                    {item.icon}
                                </div>
                            )}
                            <div style={{
                                fontWeight: 700, fontSize: 'var(--modal-body)', lineHeight: 1.3, marginBottom: 10,
                                color: 'var(--foreground)', opacity: hovered === i ? 1 : 0.85,
                                transition: 'opacity 0.2s',
                            }}>{item.headline}</div>
                            <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{renderRich(item.body)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Audit Table Section ──────────────────────────────────────────────────────
function AuditTableSection({ data }: { data: any; motion?: MotionSpec }) {
    const [ref, visible] = useInView(0.08);
    const accent = useContext(ProjectAccentCtx);
    const [hovered, setHovered] = useState<number | null>(null);
    const [filter, setFilter] = useState<string>('all');
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const rows: any[] = data.rows ?? [];
    const filterOptions = ['all', 'high', 'medium', 'low'];
    const counts: Record<string, number> = { all: rows.length, high: 0, medium: 0, low: 0 };
    rows.forEach(r => { if (counts[r.severity] !== undefined) counts[r.severity]++; });
    const filtered = filter === 'all' ? rows : rows.filter((r: any) => r.severity === filter);

    const SEV_COLOR: Record<string, string> = { high: '#D94040', medium: '#C97A20', low: '#2E9B5F' };
    const SEV_BG: Record<string, string>    = { high: 'rgba(217,64,64,0.09)', medium: 'rgba(201,122,32,0.09)', low: 'rgba(46,155,95,0.09)' };

    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            {data.eyebrow && <Eyebrow text={data.eyebrow} />}
            {data.title && (
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, margin: '0 0 20px', color: 'var(--foreground)', lineHeight: 1.3 }}>
                    {data.title}
                </h3>
            )}

            {/* Severity filter pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
                opacity: visible ? 1 : 0, transition: `opacity 0.4s 0.05s ${ease}` }}>
                {filterOptions.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '5px 14px', borderRadius: 100, fontFamily: 'inherit',
                        fontSize: '11px', letterSpacing: '0.04em', cursor: 'pointer',
                        fontWeight: filter === f ? 700 : 500,
                        border: `1px solid ${filter === f ? 'var(--foreground)' : 'var(--border)'}`,
                        background: filter === f ? 'var(--foreground)' : 'transparent',
                        color: filter === f ? 'var(--background)' : 'var(--muted-foreground)',
                        transition: 'all 0.2s ease',
                    }}>
                        {f === 'all' ? 'All issues' : f.charAt(0).toUpperCase() + f.slice(1)}
                        <span style={{ marginLeft: 6, opacity: 0.5, fontWeight: 400 }}>{counts[f]}</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden',
                opacity: visible ? 1 : 0, transition: `opacity 0.5s 0.1s ${ease}` }}>

                {/* Column headers */}
                <div style={{
                    display: 'grid', gridTemplateColumns: '130px 1fr 88px 1fr',
                    padding: '10px 20px', background: 'var(--muted)', borderBottom: '1px solid var(--border)',
                }}>
                    {(data.columns ?? ['Area', 'Finding', 'Severity', 'Recommendation']).map((col: string, i: number) => (
                        <div key={i} style={{
                            fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.1em', color: 'var(--muted-foreground)',
                        }}>
                            {col}
                        </div>
                    ))}
                </div>

                {/* Data rows */}
                <div style={{ overflowX: 'auto' }}>
                    {filtered.map((row: any, i: number) => (
                        <div
                            key={`${filter}-${i}`}
                            onMouseEnter={() => setHovered(i)}
                            onMouseLeave={() => setHovered(null)}
                            style={{
                                display: 'grid', gridTemplateColumns: '130px 1fr 88px 1fr', minWidth: 600,
                                padding: '14px 20px',
                                borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                                background: hovered === i ? `${accent}0c` : 'transparent',
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'none' : 'translateY(10px)',
                                transition: `opacity 0.45s ${i * 0.07 + 0.15}s ${ease}, transform 0.45s ${i * 0.07 + 0.15}s ${ease}, background 0.2s ease`,
                            }}
                        >
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--foreground)', paddingRight: 12, paddingTop: 1, lineHeight: 1.5 }}>{row.area}</div>
                            <div style={{ fontSize: 'var(--modal-body)', color: 'var(--foreground)', lineHeight: 1.65, paddingRight: 20 }}>{row.finding}</div>
                            <div style={{ paddingTop: 2 }}>
                                <span style={{
                                    display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                                    fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                                    color: SEV_COLOR[row.severity] ?? 'var(--foreground)',
                                    background: SEV_BG[row.severity] ?? 'var(--muted)',
                                }}>
                                    {row.severity}
                                </span>
                            </div>
                            <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', lineHeight: 1.65 }}>{row.recommendation}</div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--muted-foreground)', fontSize: 'var(--modal-meta)' }}>
                            No issues in this category.
                        </div>
                    )}
                </div>
            </div>

            {data.note && (
                <p style={{ marginTop: 12, fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', lineHeight: 1.7, fontStyle: 'italic' }}>
                    {data.note}
                </p>
            )}
        </div>
    );
}

// ─── Demo Section ─────────────────────────────────────────────────────────────

const SCAN_DOCS = [
    { name: 'Invoice_Allianz_2847.pdf',    category: 'Invoice',        confidence: 94 },
    { name: 'Claim_Form_K091.pdf',         category: 'Claim',          confidence: 61 },
    { name: 'Legal_Notice_2024_11.pdf',    category: 'Legal',          confidence: 88 },
    { name: 'Correspondence_Broker04.pdf', category: 'Correspondence', confidence: 42 },
    { name: 'Invoice_Partner_8821.pdf',    category: 'Invoice',        confidence: 77 },
    { name: 'Claim_Auto_Damage_33.pdf',    category: 'Claim',          confidence: 91 },
    { name: 'Internal_Memo_Oct24.pdf',     category: 'Internal',       confidence: 63 },
];
function getSignal(c: number) {
    if (c >= 80) return { bg: 'rgba(34,197,94,0.09)',  bar: '#22c55e', text: '#16a34a' };
    if (c >= 60) return { bg: 'rgba(234,179,8,0.09)',  bar: '#eab308', text: '#a16207' };
    return             { bg: 'rgba(239,68,68,0.09)',   bar: '#ef4444', text: '#dc2626' };
}
function ConfidenceScanner({ accent }: { accent: string }) {
    const [revealed, setRevealed] = useState(false);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const redCount   = SCAN_DOCS.filter(d => d.confidence < 60).length;
    const checkCount = SCAN_DOCS.filter(d => d.confidence < 80).length - redCount;
    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                    IDAS Queue — {SCAN_DOCS.length} documents
                </div>
                <button onClick={() => setRevealed(r => !r)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer', fontSize: '12px', fontWeight: 600, background: revealed ? 'var(--background)' : accent, color: revealed ? 'var(--muted-foreground)' : '#fff', border: `1px solid ${revealed ? 'var(--border)' : accent}`, transition: `all 0.25s ${ease}` }}>
                    {revealed ? 'Hide signal' : '⚡ Enable signal'}
                </button>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 116px 1fr 50px', padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                    {['Document', 'Category', 'Confidence', ''].map(h => (
                        <div key={h} style={{ fontSize: '10px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
                    ))}
                </div>
                {SCAN_DOCS.map((doc, i) => {
                    const s = getSignal(doc.confidence);
                    return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 116px 1fr 50px', padding: '11px 14px', alignItems: 'center', background: revealed ? s.bg : 'var(--muted)', borderLeft: `3px solid ${revealed ? s.bar : 'transparent'}`, borderBottom: i < SCAN_DOCS.length - 1 ? '1px solid var(--border)' : 'none', transition: `background 0.45s ${i * 0.08}s ${ease}, border-color 0.45s ${i * 0.08}s ${ease}` }}>
                            <div style={{ fontSize: '12px', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>{doc.name}</div>
                            <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: 100, background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', width: 'fit-content' }}>{doc.category}</span>
                            <div style={{ paddingRight: 12 }}>
                                <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
                                    <div style={{ height: '100%', borderRadius: 2, background: revealed ? s.bar : 'transparent', width: revealed ? `${doc.confidence}%` : '0%', transition: `width 0.55s ${i * 0.08 + 0.1}s ${ease}, background 0.3s ease` }} />
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 700, textAlign: 'right', color: revealed ? s.text : 'transparent', transition: `color 0.25s ${i * 0.08 + 0.4}s ease`, fontFamily: 'var(--font-mono)' }}>{doc.confidence}%</div>
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: 10, padding: '9px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', opacity: revealed ? 1 : 0, transition: `opacity 0.4s ${SCAN_DOCS.length * 0.08 + 0.3}s ease` }}>
                <span style={{ fontSize: '12px', color: '#dc2626' }}>⚠ {redCount} flagged for immediate review · {checkCount} need checking — you wouldn't have known without the signal.</span>
            </div>
        </div>
    );
}

const INGREDIENTS_LIST = [
    { id: 'egg',      emoji: '🥚', label: 'Egg' },
    { id: 'pasta',    emoji: '🍝', label: 'Pasta' },
    { id: 'cheese',   emoji: '🧀', label: 'Cheese' },
    { id: 'pancetta', emoji: '🥓', label: 'Pancetta' },
    { id: 'onion',    emoji: '🧅', label: 'Onion' },
    { id: 'spinach',  emoji: '🥬', label: 'Spinach' },
    { id: 'tomato',   emoji: '🍅', label: 'Tomato' },
    { id: 'garlic',   emoji: '🧄', label: 'Garlic' },
    { id: 'chicken',  emoji: '🍗', label: 'Chicken' },
    { id: 'rice',     emoji: '🍚', label: 'Rice' },
    { id: 'potato',   emoji: '🥔', label: 'Potato' },
    { id: 'mushroom', emoji: '🍄', label: 'Mushroom' },
    { id: 'butter',   emoji: '🧈', label: 'Butter' },
    { id: 'cream',    emoji: '🥛', label: 'Cream' },
    { id: 'lemon',    emoji: '🍋', label: 'Lemon' },
    { id: 'basil',    emoji: '🌿', label: 'Basil' },
];
const KITCHENWARE = [
    { id: 'pan',  emoji: '🍳', label: 'Pan' },
    { id: 'pot',  emoji: '🥘', label: 'Pot' },
    { id: 'wok',  emoji: '🫕', label: 'Wok' },
    { id: 'oven', emoji: '♨️',  label: 'Oven' },
];
const RECIPE_DB = [
    { needs: ['egg','pasta','cheese','pancetta'],  ware: ['pan'],        name: 'Spaghetti Carbonara',  time: '25 min', emoji: '🍝', desc: "Roman pasta with silky egg sauce and crispy pancetta. No cream — ever." },
    { needs: ['egg','cheese','onion','spinach'],   ware: ['pan','oven'], name: 'Frittata',             time: '20 min', emoji: '🍳', desc: "Italian baked omelette. Humble ingredients, genuinely satisfying." },
    { needs: ['pasta','cheese'],                   ware: ['pot','pan'],  name: 'Cacio e Pepe',         time: '15 min', emoji: '🧆', desc: "Three ingredients. Ancient Roman technique. Impossible to stop eating." },
    { needs: ['egg','onion','spinach','tomato'],   ware: ['pan'],        name: 'Shakshuka',            time: '30 min', emoji: '🍲', desc: "Eggs poached in spiced tomato and greens. Better than it sounds." },
    { needs: ['egg','cheese'],                     ware: ['pan'],        name: 'Cheese Omelette',      time: '8 min',  emoji: '🍳', desc: "Fastest meal you can make. Perfectly folded, perfectly good." },
    { needs: ['chicken','garlic','lemon'],          ware: ['pan','oven'], name: 'Lemon Garlic Chicken', time: '35 min', emoji: '🍗', desc: "Three ingredients, one pan, dinner done. The recipe everyone needs." },
    { needs: ['rice','egg','garlic','onion'],       ware: ['wok','pan'],  name: 'Garlic Fried Rice',    time: '15 min', emoji: '🍚', desc: "Day-old rice, high heat, garlic. The best midnight meal ever invented." },
    { needs: ['chicken','onion','garlic'],          ware: ['wok','pan'],  name: 'Stir-fried Chicken',   time: '20 min', emoji: '🥘', desc: "High heat, quick cook, big flavor. Weeknight hero." },
    { needs: ['potato','butter','cream'],           ware: ['pot'],        name: 'Potato Soup',          time: '40 min', emoji: '🍲', desc: "Thick, silky, deeply comforting. The soup that solves everything." },
    { needs: ['mushroom','butter','garlic'],        ware: ['pan'],        name: 'Garlic Mushrooms',     time: '12 min', emoji: '🍄', desc: "Butter-basted mushrooms with garlic. Goes on anything — toast, pasta, life." },
    { needs: ['pasta','tomato','garlic','basil'],   ware: ['pot','pan'],  name: 'Pomodoro',             time: '20 min', emoji: '🍝', desc: "Four ingredients. Ancient recipe. Don't touch it." },
    { needs: ['rice','chicken','garlic','butter'],  ware: ['pot'],        name: 'Chicken Rice',         time: '45 min', emoji: '🍚', desc: "Poached chicken. Fragrant rice. The dish that comforts across cultures." },
];
const NOISE_RECIPES = ['Beef Wellington','Pad Thai','Chicken Tikka','Caesar Salad','Ramen Bowl','Street Tacos','Sushi Rolls','Paella','Mushroom Risotto','Tom Yum','Butter Chicken','Fish & Chips','Har Gow','Gyoza','Pho Bo','Bibimbap','Moussaka','Borscht','Chicken Goulash','Lamb Tagine'];

function getAIInsight(selected: Set<string>, match: { recipe: typeof RECIPE_DB[0]; score: number } | null): string {
    const has = (...ids: string[]) => ids.every(id => selected.has(id));
    if (selected.size === 0) return "Tell me what's in your fridge...";
    if (match?.score === 1) return `You have everything for ${match.recipe.name}. Stop scrolling — just cook.`;
    if (has('pasta','egg','cheese','pancetta'))   return "That's carbonara. Classic Roman. Don't add cream.";
    if (has('pasta','tomato','garlic','basil'))   return "Pomodoro. The purists are watching. Don't overcomplicate it.";
    if (has('egg','cheese'))                      return "Egg and cheese — you're one fold away from something great.";
    if (has('pasta','cheese'))                    return "Pasta and cheese. You're closer to cacio e pepe than you think.";
    if (has('pasta','pancetta'))                  return "Cured pork with pasta? This is going Roman. 🇮🇹";
    if (has('tomato','garlic','basil'))           return "Tomato, garlic, basil — Mediterranean flavor base unlocked.";
    if (has('chicken','garlic','lemon'))          return "Garlic, chicken, lemon — the three chords of home cooking.";
    if (has('mushroom','butter','garlic'))        return "Mushrooms in butter and garlic. 12 minutes from something great.";
    if (has('rice','egg','garlic'))               return "Rice, egg, garlic — that's fried rice. High heat, don't over-stir.";
    if (has('potato','cream','butter'))           return "Potato, cream, butter — this is getting very French, very fast.";
    if (has('butter','cream'))                    return "Butter and cream together... this will be indulgent.";
    if (has('chicken','onion'))                   return "Chicken and onion — the foundation of half the world's stews.";
    if (has('tomato','egg'))                      return "Tomato and egg — beloved across a dozen cuisines. Trust the combo.";
    if (has('garlic','butter'))                   return "Garlic butter: the simplest luxury in any kitchen.";
    if (has('onion','garlic'))                    return "Onion and garlic. You're building a flavor base. What protein?";
    if (has('rice','chicken'))                    return "Chicken rice is comfort food that transcends cultures.";
    if (has('lemon','garlic'))                    return "Lemon and garlic — brightness and depth. Great pairing.";
    if (has('spinach','egg'))                     return "Egg and spinach — quick, nutritious, deceptively satisfying.";
    if (selected.size === 1) {
        const id = [...selected][0];
        const m: Record<string, string> = {
            egg:      "Egg — the most versatile ingredient in any kitchen. What's next?",
            pasta:    "Pasta is already half a meal. Just add one more thing.",
            cheese:   "Cheese makes everything better. No notes.",
            chicken:  "Chicken — the blank canvas of proteins. Everything works with it.",
            rice:     "Rice is the foundation of half the world's cuisines.",
            mushroom: "Mushrooms. Earthy, meaty, deeply underrated.",
            tomato:   "A tomato alone is humble. With the right partner, it becomes a sauce.",
            garlic:   "Garlic alone isn't dinner. But it makes everything else dinner.",
            onion:    "Onion. The base of everything. Start here.",
            potato:   "Potatoes: comforting, cheap, and never wrong.",
            butter:   "Butter. Julia Child would approve of whatever you're making.",
            lemon:    "Lemon — the secret ingredient that makes other flavors pop.",
            basil:    "Fresh basil needs a companion. Tomato? Cheese?",
            spinach:  "Spinach. Healthy start. Keep adding.",
            pancetta: "Pancetta is cured pork. It makes everything taste like Italy.",
            cream:    "Cream — the shortcut to richness. What are you saucing?",
        };
        return m[id] ?? `${id} — interesting start. What else?`;
    }
    if (match) return `${match.recipe.name} is within reach. Keep building.`;
    return "Interesting combination. What else is in there?";
}

function AiThinkingDots() {
    return (
        <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
            {[0, 1, 2].map(i => (
                <span key={i} style={{
                    display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                    background: 'var(--muted-foreground)',
                    animation: `blink 1.1s ${i * 0.18}s infinite ease-in-out`,
                }} />
            ))}
        </span>
    );
}

function RecipeCollapse({ accent }: { accent: string }) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [selectedWare, setSelectedWare] = useState<Set<string>>(new Set());
    const [aiTargetText, setAiTargetText] = useState("Tell me what's in your fridge...");
    const [aiDisplayed, setAiDisplayed] = useState('');
    const [aiThinking, setAiThinking] = useState(true);
    const aiThinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const typeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const dragStartX = useRef(0);
    const dragScrollLeft = useRef(0);
    const hasDragged = useRef(false);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const toggle = (id: string) => setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    const toggleWare = (id: string) => setSelectedWare(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

    // Filter recipes by selected kitchenware
    const availableRecipes = selectedWare.size === 0
        ? RECIPE_DB
        : RECIPE_DB.filter(r => r.ware.some(w => selectedWare.has(w)));

    // Best-scoring recipe (score = matched / total needed)
    const match = availableRecipes.reduce<{ recipe: typeof RECIPE_DB[0]; score: number } | null>((best, r) => {
        const sel = Array.from(selected);
        const score = r.needs.filter(n => sel.includes(n)).length / r.needs.length;
        return score >= 0.5 && (!best || score > best.score) ? { recipe: r, score } : best;
    }, null);

    const hasEnough = selected.size >= 2;
    const collapsed = match !== null && hasEnough;
    const noMatch   = hasEnough && !match;

    const matchLabel = !match ? null
        : match.score === 1    ? 'Perfect match'
        : match.score >= 0.75  ? 'Strong match'
        : 'Good match';

    const usedList    = match ? match.recipe.needs.filter(n => selected.has(n)) : [];
    const missingList = match ? match.recipe.needs.filter(n => !selected.has(n)) : [];
    const extraList   = match ? Array.from(selected).filter(n => !match.recipe.needs.includes(n)) : [];

    const suggestions = noMatch ? INGREDIENTS_LIST.filter(ing => {
        if (selected.has(ing.id)) return false;
        const test = [...Array.from(selected), ing.id];
        return availableRecipes.some(r => r.needs.filter(n => test.includes(n)).length / r.needs.length >= 0.5);
    }).slice(0, 3) : [];

    const hint = selected.size === 0 ? "Select ingredients to find a recipe"
        : selected.size === 1 ? `${INGREDIENTS_LIST.find(d => selected.has(d.id))?.label} selected — add one more`
        : noMatch && suggestions.length > 0 ? `Try adding ${suggestions.map(s => s.label).join(' or ')}`
        : noMatch ? "No recipe found — try a different combination"
        : match && match.score === 1 ? "You have everything — ready to cook"
        : missingList.length > 0 ? `Add ${missingList.map(n => INGREDIENTS_LIST.find(d => d.id === n)?.label).filter(Boolean).join(' or ')} for a perfect match`
        : "";

    // AI insight — trigger thinking → then typewriter
    const currentInsight = getAIInsight(selected, match);
    useEffect(() => {
        if (aiThinkTimerRef.current) clearTimeout(aiThinkTimerRef.current);
        setAiThinking(true);
        aiThinkTimerRef.current = setTimeout(() => {
            setAiThinking(false);
            setAiTargetText(currentInsight);
        }, 380);
        return () => { if (aiThinkTimerRef.current) clearTimeout(aiThinkTimerRef.current); };
    }, [currentInsight]);

    useEffect(() => {
        if (typeIntervalRef.current) clearInterval(typeIntervalRef.current);
        let i = 0;
        setAiDisplayed('');
        typeIntervalRef.current = setInterval(() => {
            i++;
            setAiDisplayed(aiTargetText.slice(0, i));
            if (i >= aiTargetText.length) { clearInterval(typeIntervalRef.current!); typeIntervalRef.current = null; }
        }, 22);
        return () => { if (typeIntervalRef.current) clearInterval(typeIntervalRef.current); };
    }, [aiTargetText]);

    // Drag-scroll handlers
    const onCarouselMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!carouselRef.current) return;
        isDragging.current = true;
        hasDragged.current = false;
        dragStartX.current = e.pageX - carouselRef.current.getBoundingClientRect().left;
        dragScrollLeft.current = carouselRef.current.scrollLeft;
        carouselRef.current.style.cursor = 'grabbing';
    };
    const onCarouselMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging.current || !carouselRef.current) return;
        e.preventDefault();
        const x = e.pageX - carouselRef.current.getBoundingClientRect().left;
        const walk = x - dragStartX.current;
        if (Math.abs(walk) > 5) hasDragged.current = true;
        carouselRef.current.scrollLeft = dragScrollLeft.current - walk;
    };
    const onCarouselStop = () => {
        isDragging.current = false;
        if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
    };

    return (
        <div>
            {/* ── AI CHEF BAR ──────────────────────────────────────────────── */}
            <div style={{
                display: 'flex', gap: 12, alignItems: 'center',
                padding: '12px 16px', borderRadius: 12, marginBottom: 16,
                background: 'var(--muted)', border: '1px solid var(--border)', minHeight: 44,
            }}>
                <div style={{ fontSize: '18px', flexShrink: 0, lineHeight: 1 }}>🤖</div>
                <div style={{ flex: 1, minWidth: 0, fontSize: '12px', color: 'var(--foreground)', lineHeight: 1.6 }}>
                    {aiThinking ? <AiThinkingDots /> : (
                        <span>
                            {aiDisplayed}
                            <span style={{ animation: 'blink 1s infinite' }}>|</span>
                        </span>
                    )}
                </div>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.45, flexShrink: 0 }}>AI Chef</div>
            </div>

            {/* ── NOISE GRID (visible until match) ─────────────────────────── */}
            <div style={{
                marginBottom: 14,
                opacity: collapsed ? 0 : 1,
                maxHeight: collapsed ? 0 : '480px',
                overflow: 'hidden',
                pointerEvents: collapsed ? 'none' : 'auto',
                transition: 'opacity 0.3s ease, max-height 0.4s ease',
            }}>
                {noMatch ? (
                    <div style={{
                        padding: '28px 20px', borderRadius: 12, textAlign: 'center',
                        border: '1.5px dashed var(--border)', background: 'var(--background)',
                    }}>
                        <div style={{ fontSize: '26px', marginBottom: 10 }}>🤔</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 5 }}>
                            No recipe with just those.
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginBottom: 16 }}>
                            {suggestions.length > 0 ? 'One of these would unlock something:' : 'Try removing one and starting over.'}
                        </div>
                        {suggestions.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {suggestions.map(ing => (
                                    <button key={ing.id} onClick={() => toggle(ing.id)} style={{
                                        padding: '6px 14px', borderRadius: 100, fontFamily: 'inherit',
                                        cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                        background: `${accent}12`, color: accent,
                                        border: `1px solid ${accent}40`,
                                        transition: `all 0.2s ${ease}`,
                                    }}>+ {ing.emoji} {ing.label}</button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                        {NOISE_RECIPES.map(name => (
                            <div key={name} style={{
                                padding: '8px 10px', borderRadius: 8,
                                background: 'var(--background)', border: '1px solid var(--border)',
                                fontSize: '11px', color: 'var(--muted-foreground)',
                                textAlign: 'center', lineHeight: 1.4, opacity: 0.5,
                            }}>{name}</div>
                        ))}
                    </div>
                )}
            </div>

            {/* ── RESULT CARD ──────────────────────────────────────────────── */}
            <div style={{
                opacity: collapsed ? 1 : 0,
                maxHeight: collapsed ? '400px' : 0,
                overflow: 'hidden',
                pointerEvents: collapsed ? 'auto' : 'none',
                transition: `opacity 0.45s ${collapsed ? '0.25s' : '0s'} ${ease}, max-height 0.45s ${collapsed ? '0.25s' : '0s'} ease`,
                marginBottom: 14,
            }}>
                {match && (
                    <div style={{
                        padding: '20px 22px', borderRadius: 14, background: 'var(--background)',
                        border: `2px solid ${match.score === 1 ? accent : `${accent}60`}`,
                        boxShadow: match.score === 1 ? `0 0 0 3px ${accent}18` : 'none',
                        transition: `border-color 0.3s, box-shadow 0.3s`,
                    }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '32px', lineHeight: 1, flexShrink: 0 }}>{match.recipe.emoji}</div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>
                                        {matchLabel} · {match.recipe.time}
                                    </span>
                                    <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                                        {match.recipe.needs.map((n, di) => (
                                            <div key={di} style={{
                                                width: 6, height: 6, borderRadius: '50%',
                                                background: selected.has(n) ? accent : 'var(--border)',
                                                transition: 'background 0.25s',
                                            }} />
                                        ))}
                                    </div>
                                </div>
                                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6, lineHeight: 1.2 }}>
                                    {match.recipe.name}
                                </div>
                                <p style={{ margin: '0 0 14px', fontSize: '13px', lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
                                    {match.recipe.desc}
                                </p>
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {usedList.map(n => {
                                        const ing = INGREDIENTS_LIST.find(d => d.id === n);
                                        return ing ? (
                                            <span key={n} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: 100, background: `${accent}15`, border: `1px solid ${accent}`, color: accent, fontWeight: 600 }}>✓ {ing.emoji} {ing.label}</span>
                                        ) : null;
                                    })}
                                    {missingList.map(n => {
                                        const ing = INGREDIENTS_LIST.find(d => d.id === n);
                                        return ing ? (
                                            <span key={n} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: 100, background: 'transparent', border: '1.5px dashed var(--border)', color: 'var(--muted-foreground)' }}>{ing.emoji} {ing.label}</span>
                                        ) : null;
                                    })}
                                    {extraList.length > 0 && <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', opacity: 0.4, margin: '0 1px' }}>·</span>}
                                    {extraList.map(n => {
                                        const ing = INGREDIENTS_LIST.find(d => d.id === n);
                                        return ing ? (
                                            <span key={n} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: 100, background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', opacity: 0.55 }}>{ing.emoji} {ing.label}</span>
                                        ) : null;
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                                    {usedList.length > 0 && <span style={{ fontSize: '10px', color: accent, opacity: 0.7 }}>✓ in recipe</span>}
                                    {missingList.length > 0 && <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', opacity: 0.6 }}>-- still need</span>}
                                    {extraList.length > 0 && <span style={{ fontSize: '10px', color: 'var(--muted-foreground)', opacity: 0.5 }}>· extra</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── KITCHENWARE FILTER ────────────────────────────────────────── */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.45, textAlign: 'center', marginBottom: 8 }}>Kitchenware</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {KITCHENWARE.map(ware => {
                        const active = selectedWare.has(ware.id);
                        return (
                            <button key={ware.id} onClick={() => toggleWare(ware.id)} style={{
                                padding: '7px 14px', borderRadius: 100, fontFamily: 'inherit',
                                cursor: 'pointer', fontSize: '12px', fontWeight: active ? 700 : 500,
                                background: active ? `${accent}18` : 'var(--background)',
                                color: active ? accent : 'var(--muted-foreground)',
                                border: `1.5px solid ${active ? accent : 'var(--border)'}`,
                                transform: active ? 'scale(1.05)' : 'scale(1)',
                                transition: `all 0.2s ${ease}`,
                            }}>{ware.emoji} {ware.label}</button>
                        );
                    })}
                </div>
            </div>

            {/* ── INGREDIENT CAROUSEL (grab to scroll) ─────────────────────── */}
            <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.45, textAlign: 'center', marginBottom: 8 }}>Ingredients</div>
                <div style={{ position: 'relative' }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(to right, var(--muted), transparent)', zIndex: 2, pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 48, background: 'linear-gradient(to left, var(--muted), transparent)', zIndex: 2, pointerEvents: 'none' }} />
                    <div
                        ref={carouselRef}
                        className="recipe-carousel"
                        style={{ display: 'flex', gap: 8, overflowX: 'scroll', scrollbarWidth: 'none', cursor: 'grab', padding: '4px 52px 6px', userSelect: 'none' }}
                        onMouseDown={onCarouselMouseDown}
                        onMouseMove={onCarouselMouseMove}
                        onMouseUp={onCarouselStop}
                        onMouseLeave={onCarouselStop}
                    >
                        {INGREDIENTS_LIST.map(ing => {
                            const active = selected.has(ing.id);
                            const isExtra = active && match !== null && !match.recipe.needs.includes(ing.id);
                            return (
                                <button key={ing.id} onClick={() => { if (!hasDragged.current) toggle(ing.id); }} style={{
                                    padding: '8px 16px', borderRadius: 100, fontFamily: 'inherit',
                                    cursor: 'pointer', fontSize: '13px', fontWeight: active ? 700 : 500,
                                    background: active ? accent : 'var(--background)',
                                    color: active ? '#fff' : 'var(--foreground)',
                                    border: `1.5px solid ${active ? accent : 'var(--border)'}`,
                                    opacity: isExtra ? 0.55 : 1,
                                    transform: active ? 'scale(1.06)' : 'scale(1)',
                                    transition: `all 0.2s ${ease}`,
                                    flexShrink: 0, whiteSpace: 'nowrap',
                                }}>{ing.emoji} {ing.label}</button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── STATUS HINT ───────────────────────────────────────────────── */}
            <div style={{
                textAlign: 'center', fontSize: '11px', minHeight: 16,
                color: match?.score === 1 ? accent : 'var(--muted-foreground)',
                transition: 'color 0.3s',
            }}>
                {hint}
            </div>
        </div>
    );
}

// ── Profita per-persona screens ───────────────────────────────────────────────

function ProfitaAppHeader({ accent, tab }: { accent: string; tab: string }) {
    return (
        <div style={{ padding:'10px 16px', background:`linear-gradient(135deg, ${accent} 0%, #0d2140 100%)`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'16px', fontWeight:900, color:'#fff', letterSpacing:'-0.02em' }}>Profita</span>
            <span style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.55)', letterSpacing:'0.06em', textTransform:'uppercase' }}>{tab}</span>
        </div>
    );
}

function ProfitaNoviceScreen({ accent }: { accent: string }) {
    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    return (
        <div style={{ color:'#fff', paddingBottom:16 }}>
            <ProfitaAppHeader accent={accent} tab="My Journey" />
            <SmartTooltip wide delay={350} content={<DriftTip label="Decision 03" title="One fund, no percentages" body="Reduces cognitive load for first-time investors. Sarocha sees one option — the analyst sees three. Same app, different complexity." />}>
            <div style={{ margin:'12px 14px 10px', background:'linear-gradient(145deg,#0d1a2e,#122040)', borderRadius:14, padding:'16px', position:'relative', overflow:'hidden', animation:`drift-el-in 0.4s ${ease} 0.08s both` }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 20% 80%, ${accent}35 0%, transparent 55%)`, pointerEvents:'none' }} />
                <div style={{ position:'relative' }}>
                    <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:6 }}>SUGGESTED START</div>
                    <div style={{ fontSize:'42px', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, background:'linear-gradient(135deg,#60a5fa 0%,#93c5fd 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', marginBottom:5 }}>฿1,000</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)' }}>A comfortable starting amount</div>
                </div>
            </div>
            </SmartTooltip>
            <div style={{ margin:'0 14px 10px', padding:'10px 12px', borderRadius:10, background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.18)', display:'flex', gap:8, alignItems:'flex-start', animation:`drift-el-in 0.4s ${ease} 0.14s both` }}>
                <span style={{ fontSize:'14px', flexShrink:0 }}>💡</span>
                <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>Bond funds are lower risk — a good place to start building confidence.</span>
            </div>
            <SmartTooltip wide delay={300} content={<DriftTip label="Decision 03" title="Large card = low intimidation" body="Bigger padding, larger font, no return %. The design removes data the novice isn't ready to interpret — not because it hides it, but because it's irrelevant to her decision right now." />}>
            <div style={{ margin:'0 14px 14px', borderRadius:12, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', padding:'16px', animation:`drift-el-in 0.4s ${ease} 0.2s both` }}>
                <div style={{ fontWeight:700, fontSize:'15px', marginBottom:6, lineHeight:1.3 }}>Conservative Bond Fund</div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                    <span style={{ fontSize:'11px', padding:'3px 9px', borderRadius:100, background:'rgba(96,165,250,0.12)', border:'1px solid rgba(96,165,250,0.3)', color:'#60a5fa', fontWeight:700 }}>Low Risk</span>
                    <span style={{ fontSize:'13px', color:'#eab308' }}>★★★★★</span>
                </div>
                <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.35)' }}>Stable returns · Capital protection</div>
            </div>
            </SmartTooltip>
            <SmartTooltip wide delay={300} content={<DriftTip label="Decision 04" title="'฿1,000' not 'Start investing'" body="Concrete amount anchors the ask. Abstract CTAs are more intimidating than specific ones. The number makes the first step feel achievable." />}>
            <div style={{ margin:'0 14px', animation:`drift-el-in 0.4s ${ease} 0.26s both` }}>
                <button style={{ width:'100%', padding:'14px', borderRadius:12, background:`linear-gradient(135deg, ${accent} 0%, #1e4080 100%)`, color:'#fff', border:'none', fontFamily:'inherit', fontWeight:800, fontSize:'14px', cursor:'pointer', boxShadow:`0 8px 28px ${accent}50` }}>
                    Start with ฿1,000 →
                </button>
            </div>
            </SmartTooltip>
        </div>
    );
}

function ProfitaIntermScreen({ accent }: { accent: string }) {
    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    const funds = [
        { name:'Global Equity Growth', tag:'High Risk', pct:'+14.2%', stars:4 },
        { name:'Asia Balanced Fund',   tag:'Med Risk',  pct:'+7.8%',  stars:3 },
        { name:'US Tech Index',        tag:'High Risk', pct:'+22.1%', stars:5 },
    ];
    return (
        <div style={{ color:'#fff', paddingBottom:16 }}>
            <ProfitaAppHeader accent={accent} tab="Portfolio Analytics" />
            <SmartTooltip wide delay={350} content={<DriftTip label="Decision 03" title="YTD return at hero scale for analysts" body="Sarocha never sees this number. Anan sees it first. Same app — the information hierarchy shifts based on what each user uses to make decisions." />}>
            <div style={{ margin:'12px 14px 10px', background:'linear-gradient(145deg,#0d1a2e,#122040)', borderRadius:14, padding:'16px', position:'relative', overflow:'hidden', animation:`drift-el-in 0.4s ${ease} 0.08s both` }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 80% 20%, ${accent}25 0%, transparent 55%)`, pointerEvents:'none' }} />
                <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                    <div>
                        <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>PORTFOLIO YTD</div>
                        <div style={{ fontSize:'38px', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, background:'linear-gradient(135deg,#34d399 0%,#6ee7b7 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>+14.8%</div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)', letterSpacing:'0.08em', marginBottom:4, textTransform:'uppercase' }}>Total value</div>
                        <div style={{ fontSize:'16px', fontWeight:700, color:'rgba(255,255,255,0.75)' }}>฿248,420</div>
                    </div>
                </div>
                <div style={{ marginTop:12, display:'flex', gap:2, alignItems:'flex-end', height:32 }}>
                    {[30,42,36,50,45,58,52,65,60,72,68,82].map((h,i) => (
                        <div key={i} style={{ flex:1, borderRadius:'2px 2px 0 0', height:`${h}%`, background:'linear-gradient(180deg,#34d399 0%,#059669 100%)', opacity:0.4+i*0.05 }} />
                    ))}
                </div>
            </div>
            </SmartTooltip>
            <div style={{ margin:'0 14px 14px', display:'flex', flexDirection:'column', gap:7, animation:`drift-el-in 0.4s ${ease} 0.16s both` }}>
                {funds.map((f,i) => (
                    <SmartTooltip key={f.name} wide delay={250} content={<DriftTip label="Decision 03" title="Return % only for analysts" body="Sarocha's view shows no percentage — too much data too early causes paralysis. Anan's view surfaces it because that's her primary filter." />}>
                    <div style={{ padding:'11px 14px', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, animation:`drift-el-in 0.3s ${ease} ${0.18+i*0.06}s both` }}>
                        <div>
                            <div style={{ fontSize:'13px', fontWeight:600, marginBottom:3 }}>{f.name}</div>
                            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
                                <span style={{ fontSize:'10px', padding:'2px 7px', borderRadius:100, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.45)', fontWeight:600 }}>{f.tag}</span>
                                <span style={{ fontSize:'11px', color:'#eab308' }}>{'★'.repeat(f.stars)}</span>
                            </div>
                        </div>
                        <div style={{ fontSize:'16px', fontWeight:800, color:'#34d399', flexShrink:0 }}>{f.pct}</div>
                    </div>
                    </SmartTooltip>
                ))}
            </div>
            <SmartTooltip wide delay={300} content={<DriftTip label="Decision 04" title="'Optimize' not 'Start'" body="Analyst intent is refinement, not discovery. CTA copy shifts from '฿1,000 start' to 'Optimize portfolio' — same button position, entirely different user model." />}>
            <div style={{ margin:'0 14px', animation:`drift-el-in 0.4s ${ease} 0.3s both` }}>
                <button style={{ width:'100%', padding:'14px', borderRadius:12, background:`linear-gradient(135deg, ${accent} 0%, #1e4080 100%)`, color:'#fff', border:'none', fontFamily:'inherit', fontWeight:800, fontSize:'14px', cursor:'pointer', boxShadow:`0 8px 28px ${accent}50` }}>
                    Optimize portfolio
                </button>
            </div>
            </SmartTooltip>
        </div>
    );
}

function ProfitaESGScreen({ accent }: { accent: string }) {
    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    const green = '#22c55e';
    const funds = [
        { name:'ESG Global Leaders', badge:'ESG A+', pct:'+9.3%',  stars:4 },
        { name:'Green Energy Fund',  badge:'ESG S+', pct:'+12.0%', stars:5 },
    ];
    return (
        <div style={{ color:'#fff', paddingBottom:16 }}>
            <ProfitaAppHeader accent={accent} tab="Ethical Investing" />
            <SmartTooltip wide delay={350} content={<DriftTip label="Decision 02" title="ESG rating surfaces before fund list" body="Oraya qualifies funds by values, not returns. The rating hierarchy mirrors Drift's social proof ordering — the most important signal surfaces first." />}>
            <div style={{ margin:'12px 14px 10px', background:'linear-gradient(145deg,#0a1a0f,#0d2014)', borderRadius:14, padding:'16px', position:'relative', overflow:'hidden', border:`1px solid ${green}22`, animation:`drift-el-in 0.4s ${ease} 0.08s both` }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 30% 80%, ${green}18 0%, transparent 60%)`, pointerEvents:'none' }} />
                <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                        <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>YOUR ESG RATING</div>
                        <div style={{ fontSize:'46px', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(135deg, ${green} 0%, #4ade80 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>A+</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:4 }}>Portfolio ESG score</div>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                        {['ESG Screened ✓','Carbon Neutral ✓'].map(t => (
                            <SmartTooltip key={t} wide delay={250} content={<DriftTip label="Decision 02" title="Filter badge at hero level" body="ESG filters are primary qualifiers — not buried in advanced settings. They surface at the same hierarchy as the fund name." />}>
                            <span style={{ fontSize:'10px', padding:'4px 9px', borderRadius:100, background:`${green}15`, border:`1px solid ${green}35`, color:green, fontWeight:700, whiteSpace:'nowrap', display:'block' }}>{t}</span>
                            </SmartTooltip>
                        ))}
                    </div>
                </div>
            </div>
            </SmartTooltip>
            <div style={{ margin:'0 14px 14px', display:'flex', flexDirection:'column', gap:8, animation:`drift-el-in 0.4s ${ease} 0.16s both` }}>
                {funds.map((f,i) => (
                    <div key={f.name} style={{ padding:'14px', borderRadius:12, background:'rgba(255,255,255,0.04)', border:`1px solid rgba(255,255,255,0.07)`, borderLeft:`3px solid ${green}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, animation:`drift-el-in 0.3s ${ease} ${0.18+i*0.07}s both` }}>
                        <div>
                            <div style={{ fontSize:'13px', fontWeight:700, marginBottom:5 }}>{f.name}</div>
                            <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                                <span style={{ fontSize:'10px', padding:'2px 8px', borderRadius:100, background:`${green}15`, border:`1px solid ${green}35`, color:green, fontWeight:700 }}>{f.badge}</span>
                                <span style={{ fontSize:'11px', color:'#eab308' }}>{'★'.repeat(f.stars)}</span>
                            </div>
                        </div>
                        <div style={{ fontSize:'16px', fontWeight:800, color:green, flexShrink:0 }}>{f.pct}</div>
                    </div>
                ))}
            </div>
            <SmartTooltip wide delay={300} content={<DriftTip label="Decision 04" title="'Explore ethical' not 'Invest'" body="For values-driven users, the framing of the action matters. 'Explore' signals alignment with her intent — it's not just a transaction." />}>
            <div style={{ margin:'0 14px', animation:`drift-el-in 0.4s ${ease} 0.3s both` }}>
                <button style={{ width:'100%', padding:'14px', borderRadius:12, background:'linear-gradient(135deg,#16a34a 0%,#15803d 100%)', color:'#fff', border:'none', fontFamily:'inherit', fontWeight:800, fontSize:'14px', cursor:'pointer', boxShadow:`0 8px 28px ${green}40` }}>
                    Explore ethical funds
                </button>
            </div>
            </SmartTooltip>
        </div>
    );
}

function PersonaLens({ accent }: { accent: string }) {
    const [active, setActive]       = useState(0);
    const [animDir, setAnimDir]     = useState<1|-1>(1);
    const [callout, setCallout]     = useState<{label:string;text:string}|null>(null);
    const [visible, setVisible]     = useState(false);
    const [phoneHover, setPhoneHover] = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
    const ease = 'cubic-bezier(0.16,1,0.3,1)';

    const PERSONAS = [
        { initial:'S', name:'Sarocha', label:'First-time',  callout:{ label:'Persona 01', text:'Sarocha needs simplicity. One fund, no percentage, concrete starting amount. The app reduces every variable except the one decision she needs to make.' } },
        { initial:'A', name:'Anan',    label:'Analyst',     callout:{ label:'Persona 02', text:'Anan optimises daily. She needs YTD performance, charts, and three options side-by-side. Same app — information density triples.' } },
        { initial:'O', name:'Oraya',   label:'ESG Focus',   callout:{ label:'Persona 03', text:'Oraya qualifies by values first. ESG rating surfaces before fund description. Returns are secondary. The hierarchy itself is the decision.' } },
    ];

    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.12 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const t = setTimeout(() => showCallout(0), 900);
        return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const showCallout = (i: number) => {
        const c = PERSONAS[i].callout;
        if (timerRef.current) clearTimeout(timerRef.current);
        setCallout(c);
        timerRef.current = setTimeout(() => setCallout(null), 4000);
    };

    const switchTo = (i: number) => {
        if (i === active) return;
        setAnimDir(i > active ? 1 : -1);
        setActive(i);
        showCallout(i);
    };

    return (
        <div ref={stageRef} style={{ borderRadius:20, overflow:'hidden', background:'linear-gradient(160deg,#060d18 0%,#091526 60%,#060d18 100%)', position:'relative', padding:'44px 32px 36px', opacity:visible?1:0, transform:visible?'none':'translateY(32px)', transition:`opacity 0.7s ${ease}, transform 0.7s ${ease}` }}>
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:340, height:260, background:`radial-gradient(ellipse at 50% 0%, ${accent}28 0%, transparent 65%)`, pointerEvents:'none' }} />

            {/* Phone */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:32, position:'relative', zIndex:1, opacity:visible?1:0, transform:visible?'none':'translateY(20px)', transition:`opacity 0.7s ${ease} 0.12s, transform 0.7s ${ease} 0.12s` }}>
                <div
                    onMouseEnter={() => setPhoneHover(true)}
                    onMouseLeave={() => setPhoneHover(false)}
                    style={{ width:300, borderRadius:44, background:'#1C1C1E', border:'9px solid #0A0A0A', overflow:'hidden', height:580, boxShadow: phoneHover ? `0 0 0 1px #2a3a4a, 0 60px 120px rgba(0,0,0,0.9), 0 0 90px ${accent}35` : `0 0 0 1px #1a2a3a, 0 48px 96px rgba(0,0,0,0.88), 0 0 70px ${accent}22`, transform: phoneHover ? 'translateY(-6px) scale(1.012)' : 'none', transition:`all 0.35s ${ease}` }}
                >
                    <div style={{ padding:'14px 20px 4px', display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'12px', fontWeight:700, color:'#fff' }}>9:41</span>
                        <span style={{ fontSize:'10px', color:'#fff', opacity:0.7 }}>●●● WiFi ■</span>
                    </div>
                    <div key={active} style={{ animation:`${animDir >= 0 ? 'drift-screen-fwd' : 'drift-screen-back'} 0.26s ${ease} both`, overflow:'hidden' }}>
                        {active === 0 && <ProfitaNoviceScreen accent={accent} />}
                        {active === 1 && <ProfitaIntermScreen accent={accent} />}
                        {active === 2 && <ProfitaESGScreen   accent={accent} />}
                    </div>
                </div>
            </div>

            {/* Persona strip — dot nodes, same pattern as Drift journey */}
            <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-start', position:'relative', zIndex:1, marginBottom:28, opacity:visible?1:0, transform:visible?'none':'translateY(12px)', transition:`opacity 0.6s ${ease} 0.35s, transform 0.6s ${ease} 0.35s` }}>
                {PERSONAS.map((p,i) => {
                    const isActive  = active === i;
                    const isVisited = active > i;
                    const nextVis   = i < PERSONAS.length - 1 && active > i;
                    return (
                        <div key={p.name} style={{ display:'flex', alignItems:'flex-start' }}>
                            <SmartTooltip wide delay={300} content={<DriftTip label={`Persona 0${i+1}`} title={p.name} body={p.callout.text} />}>
                            <button onClick={() => switchTo(i)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', padding:'0 22px', fontFamily:'inherit' }}>
                                <div style={{ width:isActive?10:7, height:isActive?10:7, borderRadius:'50%', background: isActive ? accent : isVisited ? `${accent}70` : 'rgba(255,255,255,0.18)', boxShadow: isActive ? `0 0 14px ${accent}` : 'none', transition:`all 0.3s ${ease}`, flexShrink:0 }} />
                                <span style={{ fontSize:'11px', fontWeight:isActive?700:400, color:isActive?'#fff':'rgba(255,255,255,0.35)', whiteSpace:'nowrap', transition:`all 0.2s ${ease}` }}>{p.name}</span>
                                <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap' }}>{p.label}</span>
                            </button>
                            </SmartTooltip>
                            {i < PERSONAS.length - 1 && (
                                <div style={{ width:28, height:1.5, flexShrink:0, background: nextVis ? accent : 'rgba(255,255,255,0.1)', opacity: nextVis ? 0.55 : 1, transition:`background 0.4s ${ease}`, marginTop:4 }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Callout annotation */}
            <div style={{ maxWidth:360, margin:'0 auto', minHeight:56, position:'relative', zIndex:1, opacity:callout?1:0, visibility:callout?'visible':'hidden', transition:`opacity 0.3s ${ease}`, animation:callout?`drift-fade 0.25s ${ease}`:undefined }}>
                {callout && (
                    <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                        <div style={{ width:2, flexShrink:0, background:accent, borderRadius:2, alignSelf:'stretch', opacity:0.85 }} />
                        <div>
                            <div style={{ fontSize:'10px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:accent, opacity:0.85, marginBottom:5 }}>{callout.label}</div>
                            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.75 }}>{callout.text}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Drift App Demo ───────────────────────────────────────────────────────────

/** Structured tooltip card for Drift demo design rationale */
function DriftTip({ label, title, body }: { label: string; title: string; body: string }) {
    return (
        <div>
            <div style={{ fontSize:'9px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5, opacity:0.45 }}>{label}</div>
            <div style={{ fontSize:'13px', fontWeight:700, marginBottom:5, lineHeight:1.3 }}>{title}</div>
            <div style={{ fontSize:'11px', lineHeight:1.65, opacity:0.65 }}>{body}</div>
        </div>
    );
}

const DRIFT_AVATAR_COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444'];
// Callout data — maps interaction key → design decision explanation
const DRIFT_CALLOUTS: Record<string, {label:string; text:string}> = {
    city:          { label:'Decision 03', text:'Tab badges (Event 3 · Job 20) make a city\'s depth readable without opening anything. Nomads qualify cities by scanning numbers first, descriptions second.' },
    tab_event:     { label:'Decision 03', text:'Event 3 — three upcoming events visible before you tap. The count is the signal. Without it, the tab looks empty.' },
    tab_job:       { label:'Decision 03', text:'Job 20 — twenty open remote roles in Prague, visible from the city view. Context that would otherwise require a separate app.' },
    tab_feed:      { label:'Decision 03', text:'Live badge pulses to signal real-time activity. The feed shows nomads currently in the city — the "is there a scene here?" question answered in seconds.' },
    payment_USD:   { label:'Decision 01', text:'USD — standard. Present but not a differentiator. Every platform shows USD. The decision is why the other options are here at the same level.' },
    payment_Euro:  { label:'Decision 01', text:'Euro — common for European contracts. Card-level visibility means you don\'t open a listing only to discover the wrong currency.' },
    payment_BTC:   { label:'Decision 01', text:'BTC — the signal. A Bitcoin-native freelancer sees this and qualifies the listing in under a second. This is the argument for putting payment on the card, not buried in the detail.' },
    payment_ETH:   { label:'Decision 01', text:'ETH — DeFi-adjacent roles often pay in ETH. For this user it\'s as important as salary. Card-level means one scan, not fifteen opens.' },
    bookmark_job:  { label:'Decision 04', text:'Saved to Prague list. The same bookmark action works for jobs and events — one shortlist for the whole city, not two separate save systems.' },
    bookmark_event:{ label:'Decision 04', text:'Same icon. Same action. The intent is identical: "I\'m coming back to this for Prague." Unified saves mean the city shortlist stays coherent.' },
    join_event:    { label:'Decision 02', text:'Joining takes two taps — tap Interest, then confirm. Friction is intentional: low-quality RSVPs inflate the nomad count and break the social proof argument.' },
    social_tap:    { label:'Decision 02', text:'Ordering is an argument. "Nomad joined" (99+) sits above the event description because the decision to attend is social first. You need to know your crowd before you care about the agenda.' },
    event:         { label:'Decision 02', text:'Social proof before description. A well-described event with zero nomads is less compelling than a vague one with 99 people already in. Try tapping the nomad count above.' },
};

function DriftAvatarStack({ size = 30, count = 99, animatedCount }: { size?: number; count?: number; animatedCount?: number }) {
    const n = animatedCount !== undefined ? animatedCount : count;
    const label = n >= 99 ? '99+' : String(n);
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex' }}>
                {DRIFT_AVATAR_COLORS.map((c, i) => (
                    <div key={i} style={{ width: size, height: size, borderRadius: '50%', background: `radial-gradient(circle at 38% 35%, ${c}ee 0%, ${c}88 100%)`, border: '2.5px solid #1C1C1E', marginLeft: i > 0 ? -(size * 0.28) : 0, position: 'relative', zIndex: 5 - i, boxShadow: '0 2px 8px rgba(0,0,0,0.45)' }} />
                ))}
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>{label}</span>
        </div>
    );
}

function DriftCityScreen({ accent, tab, setTab, onJob, onEvent, onCallout, animScore }: {
    accent: string; tab: string; setTab: (t: string) => void;
    onJob: () => void; onEvent: () => void; onCallout: (k: string) => void; animScore: number;
}) {
    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    const [hoverEvent, setHoverEvent] = useState(false);
    const [hoverJob, setHoverJob] = useState(false);
    const TABS = [
        { id:'feed',  label:'Feed', badge:'Live', live:true },
        { id:'info',  label:'City info', badge:null, live:false },
        { id:'event', label:'Event', badge:'3', live:false },
        { id:'job',   label:'Job', badge:'20', live:false },
    ];
    return (
        <div style={{ color:'#fff' }}>
            {/* Nav */}
            <div style={{ padding:'6px 16px 10px', display:'flex', alignItems:'center', gap:8, animation:`drift-el-in 0.35s ${ease} 0.04s both` }}>
                <span style={{ color:'#AEAEB2', fontSize:'22px', lineHeight:1, fontWeight:300 }}>‹</span>
                <span style={{ fontWeight:700, fontSize:'16px', letterSpacing:'-0.01em' }}>Prague, Czech Republic</span>
            </div>

            {/* Score hero — THE argument in pixels */}
            <SmartTooltip wide delay={400} content={<DriftTip label="Design decision" title="One number qualifies a city" body="The 9.2 synthesises internet, cost, safety, and nomad density. One scan to decide — or skip — without opening anything." />}>
            <div style={{ margin:'0 14px 14px', borderRadius:18, overflow:'hidden', background:'linear-gradient(145deg,#0e1624 0%,#131020 60%,#0e0e14 100%)', position:'relative', padding:'20px 18px 16px', animation:`drift-el-in 0.4s ${ease} 0.1s both` }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 15% 85%, ${accent}30 0%, transparent 55%)`, pointerEvents:'none' }} />
                <div style={{ position:'absolute', top:0, right:0, width:120, height:120, background:`radial-gradient(ellipse at 80% 20%, ${accent}15 0%, transparent 60%)`, pointerEvents:'none' }} />
                <div style={{ position:'relative', display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                    <div>
                        <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.13em', textTransform:'uppercase', marginBottom:6 }}>NOMAD SCORE</div>
                        <div style={{ fontSize:'54px', fontWeight:900, lineHeight:0.95, letterSpacing:'-0.04em', color:'#fff', textShadow:`0 0 48px ${accent}70, 0 4px 20px rgba(0,0,0,0.6)`, fontVariantNumeric:'tabular-nums' }}>
                            {animScore.toFixed(1)}
                        </div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:6 }}>out of 10</div>
                    </div>
                    <div style={{ textAlign:'right', paddingBottom:4 }}>
                        <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:5 }}>MONTHLY COST</div>
                        <div style={{ fontSize:'24px', fontWeight:900, color:accent, letterSpacing:'-0.03em', lineHeight:1 }}>$3,200</div>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)', marginTop:4 }}>CAD / month</div>
                    </div>
                </div>
                {/* Score progress bar */}
                <div style={{ marginTop:14, height:3, borderRadius:3, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                    <div style={{ height:'100%', borderRadius:3, background:`linear-gradient(90deg, ${accent}80, ${accent})`, width:`${(animScore/10)*100}%`, transition:'width 0.05s linear', boxShadow:`0 0 12px ${accent}90` }} />
                </div>
            </div>
            </SmartTooltip>

            {/* Tab bar — counts are the design argument */}
            <div style={{ padding:'0 14px 12px', display:'flex', gap:5, animation:`drift-el-in 0.4s ${ease} 0.18s both` }}>
                {TABS.map(t => (
                    <SmartTooltip key={t.id} wide delay={300}
                        content={
                            t.id==='event' ? <DriftTip label="Decision 03" title={`${t.badge} events — no tap needed`} body="Count visible before you open. Nomads scan numbers first, descriptions second." /> :
                            t.id==='job'   ? <DriftTip label="Decision 03" title={`${t.badge} open roles in Prague`}   body="Freelancers qualify a city by job density. This number answers in one scan." /> :
                            t.id==='feed'  ? <DriftTip label="Decision 03" title="Live — nomads active now"             body="Pulse badge signals real-time activity. The city has a scene right now." /> :
                            t.label
                        }
                    >
                    <button onClick={() => { setTab(t.id); onCallout(`tab_${t.id}`); }} style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 11px', borderRadius:20, border:'none', fontFamily:'inherit', fontSize:'12px', cursor:'pointer', flexShrink:0, background:tab===t.id?accent:'rgba(255,255,255,0.08)', color:tab===t.id?'#fff':'rgba(255,255,255,0.5)', fontWeight:tab===t.id?700:500, transition:`all 0.22s ${ease}`, boxShadow:tab===t.id?`0 4px 20px ${accent}55`:'none' }}>
                        {t.label}
                        {t.badge && <span style={{ padding:'2px 6px', borderRadius:6, fontSize:'10px', fontWeight:800, background:t.live?'#FF3B30':'rgba(255,255,255,0.22)', color:'#fff', animation:t.live?'drift-pulse 2s ease-in-out infinite':undefined }}>{t.badge}</span>}
                    </button>
                    </SmartTooltip>
                ))}
            </div>

            {/* Tab content */}
            <div style={{ padding:'0 14px 16px', animation:`drift-el-in 0.4s ${ease} 0.26s both` }}>
                {tab==='info' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                        <div style={{ background:'#2C2C2E', borderRadius:14, padding:'14px' }}>
                            <div style={{ fontWeight:700, fontSize:'14px', marginBottom:8 }}>About Prague</div>
                            <div style={{ fontSize:'13px', color:'#AEAEB2', lineHeight:1.65 }}>Capital of Czech Republic, bisected by the Vltava. One of Europe's fastest-growing nomad hubs — 9.2 for a reason.</div>
                            <button style={{ background:'none', border:'none', color:accent, fontSize:'12px', fontWeight:700, cursor:'pointer', padding:'6px 0 0', fontFamily:'inherit' }}>Read more</button>
                        </div>
                        <div style={{ background:'#2C2C2E', borderRadius:14, padding:'14px' }}>
                            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                                <span style={{ fontWeight:700, fontSize:'14px' }}>Nomads in city</span>
                                <button style={{ background:'none', border:'none', color:accent, fontSize:'12px', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>See all</button>
                            </div>
                            <DriftAvatarStack count={99} />
                        </div>
                    </div>
                )}
                {tab==='event' && (
                    <SmartTooltip wide delay={300} content={<DriftTip label="Decision 02" title="Social proof before description" body="99+ nomads joined. The crowd is the product — the event is just the occasion. Tap to see it in context." />}>
                    <div
                        onClick={onEvent}
                        onMouseEnter={() => setHoverEvent(true)}
                        onMouseLeave={() => setHoverEvent(false)}
                        style={{ background: hoverEvent ? 'linear-gradient(145deg,#232340,#3a2040)' : 'linear-gradient(145deg,#1C1C2E,#2C1C2E)', borderRadius:14, padding:'16px', cursor:'pointer', border:`1.5px solid ${hoverEvent ? accent : accent+'35'}`, position:'relative', overflow:'hidden', transform: hoverEvent ? 'translateY(-2px)' : 'none', boxShadow: hoverEvent ? `0 12px 36px ${accent}30` : 'none', transition:`all 0.22s ${ease}` }}>
                        <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 80% 80%, ${accent}${hoverEvent?'35':'20'}, transparent 60%)`, pointerEvents:'none', transition:`all 0.22s ${ease}` }} />
                        <div style={{ position:'relative' }}>
                            <div style={{ fontSize:'11px', color:accent, fontWeight:700, letterSpacing:'0.08em', marginBottom:8 }}>UPCOMING · JUN 12</div>
                            <div style={{ fontWeight:800, fontSize:'16px', marginBottom:4, letterSpacing:'-0.01em' }}>Run For Hal Prague 2024</div>
                            <div style={{ fontSize:'13px', color:'#AEAEB2', marginBottom:14 }}>Prague Old Town · 12 CAD</div>
                            <DriftAvatarStack count={99} />
                            <div style={{ marginTop:12, fontSize:'12px', color:accent, fontWeight:700 }}>Open event →</div>
                        </div>
                    </div>
                    </SmartTooltip>
                )}
                {tab==='job' && (
                    <SmartTooltip wide delay={300} content={<DriftTip label="Decision 01" title="Currency on the card" body="BTC, ETH, USD, Euro visible before you open. For a crypto nomad this single scan replaces 15 taps per session." />}>
                    <div
                        onClick={onJob}
                        onMouseEnter={() => setHoverJob(true)}
                        onMouseLeave={() => setHoverJob(false)}
                        style={{ background: hoverJob ? '#3a3a3c' : '#2C2C2E', borderRadius:14, padding:'16px', cursor:'pointer', border:`1px solid ${hoverJob ? 'rgba(255,255,255,0.18)' : 'transparent'}`, transform: hoverJob ? 'translateY(-2px)' : 'none', boxShadow: hoverJob ? '0 12px 32px rgba(0,0,0,0.5)' : 'none', transition:`all 0.22s ${ease}` }}>
                        <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)', marginBottom:6, letterSpacing:'0.06em', textTransform:'uppercase' }}>FEATURED · JUST POSTED</div>
                        <div style={{ fontWeight:800, fontSize:'16px', marginBottom:4, letterSpacing:'-0.01em' }}>Graphic Designer</div>
                        <div style={{ fontSize:'13px', color:'#AEAEB2', marginBottom:14 }}>DuelNow · $50 USD/hr · Remote</div>
                        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                            {[['USD','#34C759'],['Euro','#007AFF'],['BTC','#F7931A'],['ETH','#627EEA']].map(([p,c]) => (
                                <span key={p} style={{ padding:'5px 11px', borderRadius:8, background:`${c}20`, color:c, fontSize:'11px', fontWeight:800, border:`1px solid ${c}40` }}>{p}</span>
                            ))}
                        </div>
                        <div style={{ marginTop:12, fontSize:'12px', color:accent, fontWeight:700 }}>Open vacancy →</div>
                    </div>
                    </SmartTooltip>
                )}
                {tab==='feed' && (
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                        {[
                            { handle:'@alexk_dev',  time:'2m',  text:'Just landed at Václav Havel. Coworking recs?', color:'#4ECDC4' },
                            { handle:'@sara.ui',    time:'15m', text:'Running the Run For Hal 5K on the 12th. Anyone?', color:'#FF6B6B' },
                            { handle:'@0xjamie',   time:'1h',  text:'Locked ETH-pay contract for July. Prague stays. 🔒', color:'#FFE66D' },
                        ].map((item,i) => (
                            <div key={i} style={{ background:'#2C2C2E', borderRadius:12, padding:'12px 14px', display:'flex', gap:10, alignItems:'flex-start', animation:`drift-el-in 0.3s ${ease} ${i*0.08}s both` }}>
                                <div style={{ width:32, height:32, borderRadius:'50%', background:item.color, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', fontWeight:900, color:'#1C1C1E' }}>{item.handle[1].toUpperCase()}</div>
                                <div style={{ minWidth:0 }}>
                                    <div style={{ display:'flex', gap:6, alignItems:'center', marginBottom:3 }}>
                                        <span style={{ fontSize:'13px', fontWeight:700 }}>{item.handle}</span>
                                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.3)' }}>{item.time} ago</span>
                                    </div>
                                    <div style={{ fontSize:'13px', color:'#AEAEB2', lineHeight:1.55 }}>{item.text}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function DriftJobScreen({ accent, onBack, onCallout }: { accent: string; onBack: () => void; onCallout: (k: string) => void }) {
    const [activePayment, setActivePayment] = useState<string|null>(null);
    const [bookmarked, setBookmarked] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    const PILL_COLORS: Record<string,string> = { USD:'#34C759', Euro:'#007AFF', BTC:'#F7931A', ETH:'#627EEA' };

    const handlePayment = (p: string) => {
        setActivePayment(prev => prev === p ? null : p);
        onCallout(`payment_${p}`);
    };
    const handleBookmark = () => {
        if (!bookmarked) { setBookmarked(true); setShowToast(true); onCallout('bookmark_job'); setTimeout(() => setShowToast(false), 2200); }
    };

    return (
        <div style={{ color:'#fff', paddingBottom:20 }}>
            {/* Nav */}
            <div style={{ padding:'6px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', animation:`drift-el-in 0.35s ${ease} 0.04s both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <button onClick={onBack} style={{ background:'none', border:'none', color:accent, fontSize:'22px', cursor:'pointer', padding:0, lineHeight:1, fontWeight:300 }}>‹</button>
                    <span style={{ fontWeight:700, fontSize:'16px', letterSpacing:'-0.01em' }}>Vacancy details</span>
                </div>
                <button onClick={handleBookmark} style={{ width:34, height:34, borderRadius:10, background:bookmarked?`${accent}25`:'rgba(255,255,255,0.08)', border:`1.5px solid ${bookmarked?accent:'rgba(255,255,255,0.12)'}`, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'15px', animation:bookmarked?'drift-pop 0.3s ease':undefined, transition:`all 0.2s ${ease}` }}>
                    {bookmarked ? '🔖' : '🏷'}
                </button>
            </div>

            {showToast && (
                <div style={{ margin:'0 14px 8px', background:'#1C3A1C', borderRadius:10, padding:'10px 14px', fontSize:'13px', fontWeight:700, color:'#34C759', textAlign:'center', animation:'drift-toast 2.2s ease forwards', border:'1px solid #34C75940' }}>
                    ✓ Added to Prague list
                </div>
            )}

            {/* Job hero card */}
            <div style={{ margin:'0 14px 12px', background:'linear-gradient(145deg,#1C1C1E,#252525)', borderRadius:16, padding:'18px 16px', position:'relative', overflow:'hidden', animation:`drift-el-in 0.4s ${ease} 0.1s both` }}>
                <div style={{ position:'absolute', inset:0, background:`radial-gradient(ellipse at 90% 10%, ${accent}18 0%, transparent 50%)`, pointerEvents:'none' }} />
                <div style={{ position:'relative' }}>
                    {/* Company */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:16 }}>
                        <div style={{ width:42, height:42, borderRadius:12, background:`${accent}22`, border:`1px solid ${accent}40`, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'18px', color:accent, flexShrink:0 }}>D</div>
                        <div>
                            <div style={{ fontWeight:800, fontSize:'17px', letterSpacing:'-0.01em' }}>Graphic Designer</div>
                            <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', marginTop:2 }}>DuelNow · Remote · EEA</div>
                        </div>
                    </div>
                    {/* Salary — hero number */}
                    <SmartTooltip wide delay={300} content={<DriftTip label="Decision 01" title="Rate at hero scale" body="Hourly rate is the primary filter. Shown at 44px so the scan takes half a second — not a detail buried in a paragraph." />}>
                    <div style={{ marginBottom:14 }}>
                        <div style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:5 }}>HOURLY RATE</div>
                        <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
                            <span style={{ fontSize:'44px', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, background:`linear-gradient(135deg, ${accent} 0%, #FFD580 100%)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>$50</span>
                            <span style={{ fontSize:'15px', color:'rgba(255,255,255,0.4)', fontWeight:500 }}>/hr USD</span>
                        </div>
                    </div>
                    </SmartTooltip>
                    {/* Tags */}
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                        <span style={{ padding:'5px 11px', borderRadius:8, background:'#34C75918', color:'#34C759', fontSize:'12px', fontWeight:700 }}>Freelance</span>
                        <span style={{ padding:'5px 11px', borderRadius:8, background:'#007AFF18', color:'#007AFF', fontSize:'12px', fontWeight:700 }}>Remote</span>
                        <span style={{ padding:'5px 11px', borderRadius:8, background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.4)', fontSize:'11px' }}>Just posted</span>
                    </div>
                </div>
            </div>

            {/* Payment pills — THE design argument: visible before the click */}
            <div style={{ margin:'0 14px 14px', animation:`drift-el-in 0.4s ${ease} 0.18s both` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                    <span style={{ fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.35)', letterSpacing:'0.1em', textTransform:'uppercase' }}>Payment currencies</span>
                    <span style={{ fontSize:'11px', color:accent, fontWeight:700 }}>↑ tap to try</span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                    {['USD','Euro','BTC','ETH'].map(p => {
                        const active = activePayment === p;
                        const c = PILL_COLORS[p];
                        const tipBody: Record<string,string> = {
                            USD:  'Standard. Present but not the differentiator — every platform shows USD.',
                            Euro: 'Common for European contracts. Card-level means no surprise currency when you open the listing.',
                            BTC:  'The signal. A Bitcoin-native freelancer sees this and qualifies the listing in under a second.',
                            ETH:  'DeFi-adjacent roles often pay in ETH. For this user it is as important as the salary number.',
                        };
                        return (
                            <SmartTooltip key={p} wide delay={250} content={<DriftTip label="Decision 01" title={`${p} — why it's on the card`} body={tipBody[p]} />}>
                            <button onClick={() => handlePayment(p)} style={{ padding:'13px 14px', borderRadius:12, border:`1.5px solid ${active ? c : 'rgba(255,255,255,0.1)'}`, background: active ? `${c}22` : 'rgba(255,255,255,0.04)', color: active ? c : 'rgba(255,255,255,0.55)', fontSize:'14px', fontWeight:800, cursor:'pointer', fontFamily:'inherit', transition:`all 0.2s ${ease}`, boxShadow: active ? `0 0 0 1px ${c}50, 0 8px 24px ${c}28` : 'none', display:'flex', alignItems:'center', justifyContent:'center', gap:6, transform: active ? 'scale(1.04)' : 'scale(1)', letterSpacing:'-0.01em' }}>
                                {active && <span style={{ fontSize:'11px' }}>✓</span>}
                                {p}
                            </button>
                            </SmartTooltip>
                        );
                    })}
                </div>
            </div>

            <div style={{ margin:'0 14px', animation:`drift-el-in 0.4s ${ease} 0.26s both` }}>
                <button style={{ width:'100%', padding:'15px', borderRadius:14, background:accent, color:'#fff', border:'none', fontFamily:'inherit', fontWeight:800, fontSize:'15px', cursor:'pointer', boxShadow:`0 8px 28px ${accent}50`, letterSpacing:'-0.01em' }}>Apply now</button>
            </div>
        </div>
    );
}

function DriftEventScreen({ accent, onBack, onCallout }: { accent: string; onBack: () => void; onCallout: (k: string) => void }) {
    const [bookmarked, setBookmarked] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [nomadCount, setNomadCount] = useState(0);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        let n = 0;
        const iv = setInterval(() => {
            n += 3;
            if (n >= 99) { setNomadCount(99); clearInterval(iv); }
            else setNomadCount(n);
        }, 12);
        return () => clearInterval(iv);
    }, []);

    const handleBookmark = () => {
        if (!bookmarked) {
            setBookmarked(true);
            setShowToast(true);
            onCallout('bookmark_event');
            setTimeout(() => setShowToast(false), 2200);
        }
    };

    const handleJoin = () => {
        if (!joined) {
            setJoined(true);
            onCallout('join_event');
        }
    };

    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    return (
        <div style={{ color:'#fff', fontSize:'13px', paddingBottom:20 }}>
            {/* Header */}
            <div style={{ padding:'4px 16px 10px', display:'flex', alignItems:'center', justifyContent:'space-between', animation:`drift-el-in 0.35s ${ease} 0.04s both` }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <button onClick={onBack} style={{ background:'none', border:'none', color:accent, fontSize:'22px', cursor:'pointer', padding:0, lineHeight:1 }}>‹</button>
                    <span style={{ fontWeight:700, fontSize:'15px' }}>Run For Hal Prague</span>
                </div>
                <button
                    onClick={handleBookmark}
                    style={{
                        width:32, height:32, borderRadius:8, border:`1px solid ${bookmarked ? accent : 'rgba(255,255,255,0.15)'}`,
                        background: bookmarked ? `${accent}20` : 'rgba(255,255,255,0.06)',
                        color: bookmarked ? accent : 'rgba(255,255,255,0.5)',
                        cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center',
                        animation: bookmarked ? 'drift-pop 0.3s ease' : undefined,
                        transition:'all 0.2s ease',
                    }}
                >
                    {bookmarked ? '★' : '☆'}
                </button>
            </div>

            {/* Hero — social proof FIRST, dominant. This IS the design argument. */}
            <SmartTooltip wide delay={300} content={<DriftTip label="Decision 02" title="Ordering is an argument" body="Count sits above the description. The decision to attend is social first — you need to know the crowd before you care about the agenda." />}>
            <div
                onClick={() => onCallout('social_tap')}
                style={{
                    margin:'0 16px 10px',
                    borderRadius:16,
                    overflow:'hidden',
                    background:'linear-gradient(145deg,#1C1C2E,#2C1C2E)',
                    border:`1px solid ${accent}30`,
                    cursor:'pointer',
                    position:'relative',
                    padding:'18px 16px 16px',
                    animation:`drift-el-in 0.4s ${ease} 0.1s both`,
                }}
            >
                {/* Radial glow behind the number */}
                <div style={{
                    position:'absolute', top:'50%', left:'50%',
                    transform:'translate(-50%,-60%)',
                    width:120, height:120,
                    background:`radial-gradient(ellipse, ${accent}22 0%, transparent 70%)`,
                    pointerEvents:'none',
                }} />
                <div style={{ fontSize:'10px', letterSpacing:'0.1em', textTransform:'uppercase', color:`${accent}cc`, fontWeight:600, marginBottom:6 }}>
                    Nomads Joining
                </div>
                {/* The number is the hero */}
                <div style={{
                    fontSize:'54px', fontWeight:900, lineHeight:1,
                    color: accent,
                    fontVariantNumeric:'tabular-nums',
                    textShadow:`0 0 48px ${accent}70, 0 0 12px ${accent}40`,
                    marginBottom:12,
                }}>
                    {nomadCount >= 99 ? '99+' : nomadCount}
                </div>
                <DriftAvatarStack animatedCount={nomadCount} />
                <div style={{ marginTop:10, fontSize:'10px', color:`${accent}99`, fontWeight:600 }}>↑ tap · social proof surfaces first</div>
            </div>
            </SmartTooltip>

            {/* Toast */}
            {showToast && (
                <div style={{
                    margin:'0 16px 8px',
                    background:'linear-gradient(135deg,#1a2e1a,#1e3a1e)',
                    border:'1px solid #34C75960',
                    borderRadius:10, padding:'9px 14px',
                    fontSize:'12px', fontWeight:700, color:'#34C759',
                    display:'flex', alignItems:'center', gap:6,
                    animation:'drift-toast 2.2s ease forwards',
                }}>
                    <span style={{ fontSize:'14px' }}>✓</span> Saved to your Prague list
                </div>
            )}

            {/* Event meta — visually subordinate */}
            <div style={{ margin:'0 16px 10px', background:'rgba(255,255,255,0.04)', borderRadius:12, padding:'12px 14px', animation:`drift-el-in 0.4s ${ease} 0.18s both` }}>
                <div style={{ fontWeight:700, fontSize:'14px', marginBottom:8 }}>Run For Hal Prague 2024</div>
                <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'12px', color:'rgba(255,255,255,0.55)' }}>
                        <span style={{ fontSize:'13px' }}>📍</span>
                        <span>Prague Old Town · V Jámé 9</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'12px', color:'rgba(255,255,255,0.55)' }}>
                        <span style={{ fontSize:'13px' }}>🕐</span>
                        <span>June 12 · 2:00 pm – 3:00 pm</span>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, fontSize:'12px', color:'rgba(255,255,255,0.55)' }}>
                        <span style={{ fontSize:'13px' }}>₿</span>
                        <span>BTC Prague 2024 · Free entry</span>
                    </div>
                </div>
            </div>

            {/* About — lowest hierarchy */}
            <div style={{ margin:'0 16px 14px', padding:'0 2px', animation:`drift-el-in 0.4s ${ease} 0.24s both` }}>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.45)', lineHeight:1.7 }}>
                    A 5km social run/walk around Prague Old Town, honouring Hal Finney. All abilities welcome.
                </div>
            </div>

            {/* CTA */}
            <div style={{ margin:'0 16px', animation:`drift-el-in 0.4s ${ease} 0.3s both` }}>
            <SmartTooltip wide delay={300} content={<DriftTip label="Decision 04" title="Interest, not RSVP" body="Two-tap confirmation is intentional. Low-quality RSVPs inflate the count and break the social proof argument." />}>
                <button
                    onClick={handleJoin}
                    style={{
                        width:'100%', padding:'14px', borderRadius:12,
                        background: joined ? `${accent}30` : accent,
                        color: joined ? accent : '#fff',
                        border: joined ? `1px solid ${accent}60` : 'none',
                        fontFamily:'inherit', fontWeight:700, fontSize:'14px', cursor:'pointer',
                        boxShadow: joined ? 'none' : `0 8px 28px ${accent}50`,
                        transition:'all 0.25s cubic-bezier(0.16,1,0.3,1)',
                        letterSpacing:'0.01em',
                    }}
                >
                    {joined ? '✓ Interested' : 'Interest to Join'}
                </button>
            </SmartTooltip>
            </div>
        </div>
    );
}

type DriftScreen = 'city' | 'job' | 'event';

const DRIFT_JOURNEY = [
    { id:'city'  as DriftScreen, icon:'🏙', label:'City Profile', step:'Choose a city' },
    { id:'job'   as DriftScreen, icon:'💼', label:'Vacancy',      step:'Find the work' },
    { id:'event' as DriftScreen, icon:'🏃', label:'Event',        step:'Confirm the crowd' },
];

function DriftAppDemo({ accent }: { accent: string }) {
    const [screen, setScreen]     = useState<DriftScreen>('city');
    const [screenDir, setScreenDir] = useState<1|-1>(1);
    const [cityTab, setCityTab]   = useState('info');
    const [callout, setCallout]   = useState<{label:string;text:string}|null>(null);
    const [visited, setVisited]   = useState<Set<DriftScreen>>(new Set(['city']));
    const [animScore, setAnimScore] = useState(0);
    const [phoneHover, setPhoneHover] = useState(false);
    const [visible, setVisible]   = useState(false);
    const stageRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout>|null>(null);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    // Scroll reveal
    useEffect(() => {
        const el = stageRef.current;
        if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.12 });
        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    // Score animation on mount + initial callout hint
    useEffect(() => {
        let s = 0;
        const iv = setInterval(() => {
            s = parseFloat((s + 0.2).toFixed(1));
            if (s >= 9.2) { setAnimScore(9.2); clearInterval(iv); }
            else setAnimScore(s);
        }, 18);
        const t = setTimeout(() => showCallout('city'), 900);
        return () => { clearInterval(iv); clearTimeout(t); };
    }, []);

    const showCallout = (key: string) => {
        const c = DRIFT_CALLOUTS[key];
        if (!c) return;
        if (timerRef.current) clearTimeout(timerRef.current);
        setCallout(c);
        timerRef.current = setTimeout(() => setCallout(null), 4000);
    };

    const DRIFT_ORDER: DriftScreen[] = ['city', 'job', 'event'];
    const handleScreen = (s: DriftScreen) => {
        const dir = DRIFT_ORDER.indexOf(s) >= DRIFT_ORDER.indexOf(screen) ? 1 : -1;
        setScreenDir(dir);
        setScreen(s);
        setVisited(prev => new Set([...prev, s]));
        showCallout(s);
    };

    return (
        /* Dark atmospheric stage — matches phone's dark UI, creates immersive showcase feel */
        <div ref={stageRef} style={{ borderRadius:20, overflow:'hidden', background:'linear-gradient(160deg,#0c0c14 0%,#15100a 60%,#0e0d0c 100%)', position:'relative', padding:'44px 32px 36px', opacity: visible?1:0, transform: visible?'none':'translateY(32px)', transition:`opacity 0.7s ${ease}, transform 0.7s ${ease}` }}>
            {/* Ambient glow behind phone — accent bleeds through */}
            <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:340, height:260, background:`radial-gradient(ellipse at 50% 0%, ${accent}22 0%, transparent 68%)`, pointerEvents:'none' }} />

            {/* Phone — centered, dramatic shadow */}
            <div style={{ display:'flex', justifyContent:'center', marginBottom:36, position:'relative', zIndex:1, opacity: visible?1:0, transform: visible?'none':'translateY(20px)', transition:`opacity 0.7s ${ease} 0.12s, transform 0.7s ${ease} 0.12s` }}>
                <div
                    onMouseEnter={() => setPhoneHover(true)}
                    onMouseLeave={() => setPhoneHover(false)}
                    style={{ width:300, borderRadius:44, background:'#1C1C1E', border:'9px solid #0A0A0A', boxShadow: phoneHover ? `0 0 0 1px #3a3a3a, 0 60px 120px rgba(0,0,0,0.9), 0 0 90px ${accent}35` : `0 0 0 1px #2a2a2a, 0 48px 96px rgba(0,0,0,0.85), 0 0 70px ${accent}20`, overflow:'hidden', height:600, transform: phoneHover ? 'translateY(-6px) scale(1.012)' : 'none', transition:`all 0.35s ${ease}` }}>
                    <div style={{ padding:'14px 20px 4px', display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontSize:'12px', fontWeight:700, color:'#fff' }}>9:41</span>
                        <span style={{ fontSize:'10px', color:'#fff', opacity:0.7 }}>●●● WiFi ■</span>
                    </div>
                    <div key={screen} style={{ animation: `${screenDir >= 0 ? 'drift-screen-fwd' : 'drift-screen-back'} 0.26s cubic-bezier(0.16,1,0.3,1) both`, overflow:'hidden' }}>
                        {screen === 'city'  && <DriftCityScreen  accent={accent} tab={cityTab} setTab={setCityTab} onJob={() => handleScreen('job')} onEvent={() => handleScreen('event')} onCallout={showCallout} animScore={animScore} />}
                        {screen === 'job'   && <DriftJobScreen   accent={accent} onBack={() => handleScreen('city')} onCallout={showCallout} />}
                        {screen === 'event' && <DriftEventScreen accent={accent} onBack={() => handleScreen('city')} onCallout={showCallout} />}
                    </div>
                </div>
            </div>

            {/* Journey indicator — dot nodes, no boxes */}
            <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-start', position:'relative', zIndex:1, marginBottom:28, opacity: visible?1:0, transform: visible?'none':'translateY(12px)', transition:`opacity 0.6s ${ease} 0.35s, transform 0.6s ${ease} 0.35s` }}>
                {DRIFT_JOURNEY.map((node, i) => {
                    const isActive  = screen === node.id;
                    const isVisited = visited.has(node.id);
                    const nextVisited = i < DRIFT_JOURNEY.length - 1 && visited.has(DRIFT_JOURNEY[i+1].id);
                    return (
                        <div key={node.id} style={{ display:'flex', alignItems:'flex-start' }}>
                            <button onClick={() => handleScreen(node.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, background:'none', border:'none', cursor:'pointer', padding:'0 22px', fontFamily:'inherit' }}>
                                {/* Dot */}
                                <div style={{ width: isActive?10:7, height: isActive?10:7, borderRadius:'50%', background: isActive ? accent : isVisited ? `${accent}70` : 'rgba(255,255,255,0.18)', boxShadow: isActive ? `0 0 14px ${accent}` : 'none', transition:`all 0.3s ${ease}`, flexShrink:0 }} />
                                <span style={{ fontSize:'11px', fontWeight: isActive?700:400, color: isActive?'#fff':'rgba(255,255,255,0.35)', whiteSpace:'nowrap', transition:`all 0.2s ${ease}` }}>{node.label}</span>
                                <span style={{ fontSize:'9px', color:'rgba(255,255,255,0.2)', whiteSpace:'nowrap' }}>{node.step}</span>
                            </button>
                            {i < DRIFT_JOURNEY.length - 1 && (
                                <div style={{ width:28, height:1.5, flexShrink:0, background: nextVisited ? accent : 'rgba(255,255,255,0.1)', opacity: nextVisited ? 0.55 : 1, transition:`background 0.4s ${ease}`, marginTop:4 }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Callout — editorial annotation, no generic box */}
            <div style={{ maxWidth:360, margin:'0 auto', minHeight:56, position:'relative', zIndex:1, opacity: callout?1:0, visibility: callout?'visible':'hidden', transition:`opacity 0.3s ${ease}`, animation: callout ? `drift-fade 0.25s ${ease}` : undefined }}>
                {callout && (
                    <div style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                        <div style={{ width:2, flexShrink:0, background:accent, borderRadius:2, alignSelf:'stretch', opacity:0.85 }} />
                        <div>
                            <div style={{ fontSize:'10px', fontWeight:700, color:accent, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:6 }}>{callout.label}</div>
                            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.5)', lineHeight:1.75 }}>{callout.text}</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Roomvu Homepage Redesign Demo ────────────────────────────────────────────
type RoomvuCat = 'all' | 'market' | 'mobile' | 'listings';
const ROOMVU_VIDEOS: Record<RoomvuCat, { title: string; date: string; cat: string }[]> = {
    all: [
        { title: 'Housing Market Q4 Update', date: 'Nov 2023', cat: 'Market Report' },
        { title: '5 Things Buyers Want Right Now', date: 'Nov 2023', cat: 'Mobile' },
        { title: 'Luxury Listings — Downtown', date: 'Oct 2023', cat: 'Listing' },
        { title: 'Condo Market Breakdown', date: 'Oct 2023', cat: 'Market Report' },
        { title: 'How to Win a Bidding War', date: 'Oct 2023', cat: 'Mobile' },
        { title: 'New Listings — Westside', date: 'Sep 2023', cat: 'Listing' },
    ],
    market: [
        { title: 'Housing Market Q4 Update', date: 'Nov 2023', cat: 'Market Report' },
        { title: 'Condo Market Breakdown', date: 'Oct 2023', cat: 'Market Report' },
        { title: 'Year-End Forecast', date: 'Sep 2023', cat: 'Market Report' },
    ],
    mobile: [
        { title: '5 Things Buyers Want Right Now', date: 'Nov 2023', cat: 'Mobile' },
        { title: 'How to Win a Bidding War', date: 'Oct 2023', cat: 'Mobile' },
        { title: 'First-Time Buyer Checklist', date: 'Sep 2023', cat: 'Mobile' },
    ],
    listings: [
        { title: 'Luxury Listings — Downtown', date: 'Oct 2023', cat: 'Listing' },
        { title: 'New Listings — Westside', date: 'Sep 2023', cat: 'Listing' },
        { title: 'Featured Properties — East Side', date: 'Sep 2023', cat: 'Listing' },
    ],
};
const CITIES = ['Vancouver', 'Toronto', 'Calgary', 'Montreal', 'Ottawa'];
const CATS: { id: RoomvuCat; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'market', label: 'Market Reports' },
    { id: 'mobile', label: 'Mobile Friendly' },
    { id: 'listings', label: 'Listings' },
];

function RoomvuHomepageDemo({ accent }: { accent: string }) {
    const [city, setCity] = useState('Vancouver');
    const [cat, setCat] = useState<RoomvuCat>('all');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [hovered, setHovered] = useState<number | null>(null);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const videos = ROOMVU_VIDEOS[cat];

    return (
        <div style={{ border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', background: 'var(--background)' }}>
            {/* Browser chrome */}
            <div style={{ padding: '10px 16px', background: 'var(--muted)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', gap: 5 }}>
                    {['#FF5F57','#FEBC2E','#28C840'].map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                </div>
                <div style={{ flex: 1, background: 'var(--background)', borderRadius: 6, padding: '4px 10px', fontSize: '11px', color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                    roomvu.com — redesign concept
                </div>
            </div>

            {/* Site nav */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '15px', color: accent, letterSpacing: '-0.02em' }}>roomvu</span>
                <div style={{ position: 'relative' }}>
                    <button onClick={() => setPickerOpen(!pickerOpen)} style={{
                        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 20,
                        border: `1.5px solid ${accent}`, background: `${accent}12`, color: accent,
                        fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                    }}>
                        📍 {city} ▾
                    </button>
                    {pickerOpen && (
                        <div style={{
                            position: 'absolute', right: 0, top: '110%', zIndex: 20, minWidth: 140,
                            background: 'var(--background)', border: '1px solid var(--border)',
                            borderRadius: 10, overflow: 'hidden', boxShadow: '0 8px 28px rgba(0,0,0,0.14)',
                        }}>
                            {CITIES.map(loc => (
                                <button key={loc} onClick={() => { setCity(loc); setPickerOpen(false); }} style={{
                                    display: 'block', width: '100%', textAlign: 'left', padding: '9px 16px',
                                    fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', border: 'none',
                                    background: loc === city ? `${accent}12` : 'transparent',
                                    color: loc === city ? accent : 'var(--foreground)',
                                    fontWeight: loc === city ? 700 : 400,
                                }}>
                                    {loc === city ? '✓ ' : ''}{loc}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Hero */}
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', background: `linear-gradient(135deg, ${accent}08 0%, transparent 60%)` }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: accent, letterSpacing: '0.09em', textTransform: 'uppercase', marginBottom: 6 }}>
                    Localized videos for {city} agents
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--foreground)', lineHeight: 1.35 }}>
                    Win more listings.<br />
                    <span style={{ color: 'var(--muted-foreground)', fontWeight: 500, fontSize: '13px' }}>Spend less time searching for the right content.</span>
                </div>
            </div>

            {/* Category tabs */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 6, overflowX: 'auto' }}>
                {CATS.map(c => (
                    <button key={c.id} onClick={() => setCat(c.id)} style={{
                        padding: '5px 13px', borderRadius: 20, fontFamily: 'inherit', fontSize: '11px',
                        fontWeight: cat === c.id ? 700 : 500, cursor: 'pointer', flexShrink: 0,
                        border: `1.5px solid ${cat === c.id ? accent : 'var(--border)'}`,
                        background: cat === c.id ? accent : 'transparent',
                        color: cat === c.id ? '#fff' : 'var(--muted-foreground)',
                        transition: 'all 0.2s ease',
                    }}>{c.label}</button>
                ))}
            </div>

            {/* Video grid */}
            <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                    {videos.map((v, i) => (
                        <div key={`${cat}-${i}`} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}
                            style={{
                                borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                                border: `1px solid ${hovered === i ? accent + '55' : 'var(--border)'}`,
                                transform: hovered === i ? 'translateY(-2px)' : 'none',
                                boxShadow: hovered === i ? `0 6px 20px ${accent}22` : 'none',
                                transition: `transform 0.2s ${ease}, box-shadow 0.2s ${ease}, border-color 0.2s`,
                            }}>
                            <div style={{
                                aspectRatio: '16/9', background: `${accent}10`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: 26, height: 26, borderRadius: '50%',
                                    background: hovered === i ? accent : `${accent}40`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: `background 0.2s ${ease}`,
                                }}>
                                    <div style={{ width: 0, height: 0, borderTop: '5px solid transparent', borderBottom: '5px solid transparent', borderLeft: `8px solid ${hovered === i ? '#fff' : accent}`, marginLeft: 2, transition: 'border-left-color 0.2s' }} />
                                </div>
                            </div>
                            <div style={{ padding: '8px 10px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--foreground)', lineHeight: 1.4, marginBottom: 5 }}>{v.title} — {city}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: 4, background: `${accent}15`, color: accent, fontWeight: 700 }}>{v.cat}</span>
                                    <span style={{ fontSize: '10px', color: 'var(--muted-foreground)' }}>{v.date}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function DemoSection({ data }: { data: any }) {
    const accent = useContext(ProjectAccentCtx);
    const [ref, visible] = useInView(0.08);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const demo = data.variant === 'confidence_scanner' ? <ConfidenceScanner accent={accent} />
               : data.variant === 'recipe_collapse'    ? <RecipeCollapse accent={accent} />
               : data.variant === 'persona_lens'       ? <PersonaLens accent={accent} />
               : data.variant === 'roomvu_homepage'    ? <RoomvuHomepageDemo accent={accent} />
               : data.variant === 'drift_app'          ? <DriftAppDemo accent={accent} />
               : null;
    return (
        <div ref={ref} style={{ marginBottom: 72, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}` }}>
            {data.eyebrow && <Eyebrow text={data.eyebrow} />}
            {data.headline && <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 8px', color: 'var(--foreground)' }}>{data.headline}</h3>}
            {data.description && <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)', margin: '0 0 24px' }}>{data.description}</p>}
            <div style={{ padding: '24px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--muted)' }}>{demo}</div>
        </div>
    );
}

// ─── Profita Section Renderers ────────────────────────────────────────────────

// COVER — parallax hero, 80vh, word-by-word title reveal
function CoverSection({ data }: { data: any }) {
    const [visible, setVisible] = useState(false);
    const scrollPct = useCoverScroll();
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    useEffect(() => { const t = setTimeout(() => setVisible(true), 60); return () => clearTimeout(t); }, []);

    const words = (data.title ?? '').split(' ');
    // Parallax: content drifts up + fades, bg scale zooms
    const bgScale = 1 + scrollPct * 0.1;
    const contentY = scrollPct * -72;
    const contentOpacity = Math.max(0, 1 - scrollPct * 2.2);

    return (
        <div style={{
            margin: '0 -40px', minHeight: '82vh',
            background: data.bg_color || '#1B3A5C',
            display: 'flex', alignItems: 'center',
            marginBottom: 80, position: 'relative', overflow: 'hidden',
        }}>
            {/* Parallax radial bg */}
            <div style={{
                position: 'absolute', inset: 0,
                background: `radial-gradient(ellipse 100% 70% at 65% 45%, rgba(201,168,76,0.1) 0%, transparent 65%)`,
                transform: `scale(${bgScale})`,
                pointerEvents: 'none',
            }} />
            {/* Subtle grid pattern */}
            <div style={{
                position: 'absolute', inset: 0, opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%', padding: '100px 40px 80px',
                opacity: contentOpacity,
                transform: `translateY(${contentY}px)`,
            }}>
                {/* Award badge */}
                {data.award_badge && (
                    <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        marginBottom: 36, padding: '6px 16px', borderRadius: 100,
                        border: '1px solid rgba(201,168,76,0.4)', background: 'rgba(201,168,76,0.08)',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'none' : 'translateY(-10px)',
                        transition: `opacity 0.6s ${ease}, transform 0.6s ${ease}`,
                    }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="8 21 12 17 16 21" /><line x1="12" y1="17" x2="12" y2="11" />
                            <path d="M7 4H17l-1 7a4 4 0 01-8 0L7 4z" />
                        </svg>
                        <span style={{ fontSize: '12px', color: '#C9A84C', fontWeight: 600, letterSpacing: '0.05em' }}>{data.eyebrow}</span>
                    </div>
                )}

                {/* Title — word by word */}
                <h2 style={{
                    fontSize: 'clamp(36px, 5.5vw, 68px)', fontWeight: 700, lineHeight: 1.08,
                    margin: '0 0 28px', color: '#C9A84C',
                    display: 'flex', flexWrap: 'wrap', gap: '0 0.28em',
                }}>
                    {words.map((word: string, i: number) => (
                        <span key={i} style={{
                            display: 'inline-block',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'none' : 'translateY(24px)',
                            transition: `opacity 0.7s ${i * 0.08}s ${ease}, transform 0.7s ${i * 0.08}s ${ease}`,
                        }}>{word}</span>
                    ))}
                </h2>

                {/* Subtitle */}
                <p style={{
                    fontSize: 'var(--modal-body)', lineHeight: 1.85,
                    color: 'rgba(255,255,255,0.6)', margin: '0 0 48px', maxWidth: 520,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateY(16px)',
                    transition: `opacity 0.8s 0.45s ${ease}, transform 0.8s 0.45s ${ease}`,
                }}>{data.subtitle}</p>

                {/* Stats */}
                {data.stats && (
                    <div style={{
                        display: 'flex', gap: 48, flexWrap: 'wrap',
                        opacity: visible ? 1 : 0,
                        transition: `opacity 0.8s 0.62s ${ease}`,
                    }}>
                        {data.stats.map((s: any, i: number) => (
                            <div key={i}>
                                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{s.label}</div>
                                <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Scroll indicator */}
            <div style={{
                position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                opacity: visible && scrollPct < 0.05 ? 0.5 : 0,
                transition: 'opacity 0.5s',
            }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>scroll</div>
                <div style={{ width: 1, height: 28, background: 'linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)' }} />
            </div>
        </div>
    );
}

// AWARD BLOCK — gold hover glow, trophy reacts when you look at it
function AwardBlock({ title, event }: { title: string; event: string }) {
    const [hovered, setHovered] = useState(false);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                padding: '20px 24px', borderRadius: 10,
                background: hovered ? 'rgba(201,168,76,0.09)' : 'rgba(201,168,76,0.06)',
                border: `1px solid ${hovered ? 'rgba(201,168,76,0.5)' : 'rgba(201,168,76,0.2)'}`,
                boxShadow: hovered ? '0 0 0 3px rgba(201,168,76,0.10), 0 4px 20px rgba(201,168,76,0.12)' : 'none',
                transition: `background 0.25s, border-color 0.25s, box-shadow 0.35s ${ease}`,
                cursor: 'default',
            }}
        >
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Awarded</div>
            <div style={{
                fontSize: '16px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 4,
                transform: hovered ? 'scale(1.015)' : 'scale(1)',
                transformOrigin: 'left center',
                transition: `transform 0.3s ${ease}`,
                display: 'inline-block',
            }}>{title}</div>
            <div style={{ fontSize: 'var(--modal-meta)', color: hovered ? 'var(--foreground)' : 'var(--muted-foreground)', transition: 'color 0.25s' }}>{event}</div>
        </div>
    );
}

// PROJECT OVERVIEW — two-pane card, stagger entrance
function ProjectOverviewSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.08);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ display: 'flex', gap: 0, marginBottom: 64, border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            {/* Left pane */}
            <div style={{
                flex: '0 0 260px', padding: '36px 32px', borderRight: '1px solid var(--border)', background: 'var(--muted)',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(-24px)',
                transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}`,
            }}>
                {data.label && <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>{data.label}</div>}
                <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.35, margin: '0 0 32px', color: 'var(--foreground)' }}>{data.title}</h3>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>My Role</div>
                    {data.my_role?.map((r: string) => (
                        <div key={r} style={{ fontSize: 'var(--modal-meta)', color: 'var(--foreground)', marginBottom: 5, lineHeight: 1.4 }}>{r}</div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 28 }}>
                    {[{ label: 'Client', val: data.client }, { label: 'Year', val: data.year }].map(({ label, val }) => (
                        <div key={label}>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
                            <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--foreground)', fontWeight: 500 }}>{val}</div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Right pane */}
            <div style={{
                flex: 1, padding: '36px 40px',
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(24px)',
                transition: `opacity 0.7s 0.1s ${ease}, transform 0.7s 0.1s ${ease}`,
            }}>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Overview</div>
                    <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.85, color: 'var(--foreground)', margin: 0 }}>{data.overview}</p>
                </div>
                {data.award && <AwardBlock title={data.award.title} event={data.award.event} />}
            </div>
        </div>
    );
}

// INTRO STATEMENT — dark full-bleed, blur-clear title
function IntroStatementSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.15);
    return (
        <div ref={ref} style={{ margin: '0 -40px', padding: '80px 40px', background: data.bg_color || '#1B3A5C', marginBottom: 72, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: 24, fontSize: '180px', lineHeight: 1, color: 'rgba(201,168,76,0.07)', fontFamily: 'Georgia, serif', pointerEvents: 'none', userSelect: 'none' }}>"</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.6s' }}>{data.eyebrow}</div>
            <h3 style={{
                fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, lineHeight: 1.18,
                margin: '0 0 28px', color: '#C9A84C', maxWidth: 680,
                opacity: visible ? 1 : 0,
                filter: visible ? 'blur(0)' : 'blur(10px)',
                transform: visible ? 'none' : 'translateY(16px)',
                transition: 'opacity 0.8s 0.1s, filter 0.8s 0.1s, transform 0.8s 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>{data.title}</h3>
            <p style={{
                fontSize: 'var(--modal-body)', lineHeight: 1.9, color: 'rgba(255,255,255,0.65)',
                margin: 0, maxWidth: 640,
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(12px)',
                transition: 'opacity 0.7s 0.25s, transform 0.7s 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>{data.body}</p>
        </div>
    );
}

// DESIGN BRIEF — Q cards, scale + stagger, hover lift
function DesignBriefSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.08);
    const [hovered, setHovered] = useState<number | null>(null);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ marginBottom: 72 }}>
            <Eyebrow text={data.eyebrow} />
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 16px', color: 'var(--foreground)' }}>{data.title}</h3>
            <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.8, color: 'var(--muted-foreground)', margin: '0 0 44px', maxWidth: 640 }}>{data.body}</p>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 22, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Questions to consider</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                {data.questions?.map((q: any, i: number) => (
                    <div key={q.number}
                        onMouseEnter={() => setHovered(i)}
                        onMouseLeave={() => setHovered(null)}
                        style={{
                            padding: '28px 24px 24px',
                            borderRadius: 14,
                            border: `1.5px solid ${hovered === i ? '#4A7AB5' : 'var(--border)'}`,
                            background: hovered === i ? 'rgba(74,122,181,0.05)' : 'var(--muted)',
                            cursor: 'default', position: 'relative', overflow: 'hidden',
                            boxShadow: hovered === i ? '0 8px 32px rgba(74,122,181,0.12)' : 'none',
                            opacity: visible ? 1 : 0,
                            transform: visible
                                ? (hovered === i ? 'translateY(-4px) scale(1.01)' : 'none')
                                : `scale(0.93) translateY(20px)`,
                            transition: `opacity 0.7s ${i * 0.09}s ${ease}, transform 0.5s ${hovered === i ? '0s' : `${i * 0.09}s`} ${ease}, border-color 0.2s, background 0.2s, box-shadow 0.3s`,
                        }}
                    >
                        {/* Ghost number bg */}
                        <div style={{
                            position: 'absolute', top: -16, right: 12,
                            fontSize: '88px', fontWeight: 900, lineHeight: 1,
                            color: hovered === i ? 'rgba(74,122,181,0.08)' : 'rgba(0,0,0,0.04)',
                            pointerEvents: 'none', userSelect: 'none',
                            transition: 'color 0.25s',
                        }}>{q.number}</div>
                        <div style={{ fontSize: '15px', fontWeight: 700, color: hovered === i ? '#4A7AB5' : 'var(--muted-foreground)', marginBottom: 14, transition: 'color 0.2s', position: 'relative' }}>Q{q.number}</div>
                        <p style={{ margin: 0, fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--foreground)', position: 'relative' }}>
                            {q.text}{' '}
                            <strong style={{ color: '#C9A84C', fontWeight: 600 }}>{q.highlight}</strong>
                            {q.suffix ? ` ${q.suffix}` : ''}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// RESEARCH METHOD — cards slide from right, stagger
function ResearchMethodSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.1);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ marginBottom: 72 }}>
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 44px', color: 'var(--foreground)', maxWidth: 580 }}>{data.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.methods?.map((m: any, i: number) => (
                    <div key={i} style={{
                        display: 'flex', gap: 28, alignItems: 'flex-start', padding: '28px',
                        borderRadius: 14, border: '1px solid var(--border)', background: 'var(--muted)',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'none' : 'translateX(36px)',
                        transition: `opacity 0.7s ${i * 0.12}s ${ease}, transform 0.7s ${i * 0.12}s ${ease}`,
                    }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--background)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 'var(--modal-body)', color: 'var(--foreground)', marginBottom: 10 }}>{m.label}</div>
                            <p style={{ margin: 0, fontSize: 'var(--modal-body)', lineHeight: 1.85, color: 'var(--muted-foreground)' }}>{m.body}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// QUOTE — Apple blur-clear reveal, large decorative mark
function QuoteSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.25);
    return (
        <div ref={ref} style={{ margin: '0 -40px 72px', padding: '88px 40px', background: 'var(--muted)', position: 'relative', overflow: 'hidden' }}>
            {/* Large decorative quote mark */}
            <div style={{
                position: 'absolute', top: -24, left: 16, fontSize: '220px', lineHeight: 1,
                color: 'var(--border)', fontFamily: 'Georgia, serif',
                pointerEvents: 'none', userSelect: 'none',
                opacity: visible ? 0.6 : 0,
                transform: visible ? 'none' : 'scale(0.8) translateX(-20px)',
                transition: 'opacity 1.2s, transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>"</div>
            <p style={{
                margin: '0 auto', maxWidth: 640, position: 'relative',
                fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 500, lineHeight: 1.55,
                color: 'var(--foreground)', textAlign: 'center',
                opacity: visible ? 1 : 0,
                filter: visible ? 'blur(0px)' : 'blur(12px)',
                transform: visible ? 'scale(1)' : 'scale(0.97)',
                transition: 'opacity 0.9s 0.15s, filter 0.9s 0.15s, transform 0.9s 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
            }}>{data.text}</p>
            {data.attribution && (
                <div style={{
                    textAlign: 'center', marginTop: 28, fontSize: 'var(--modal-meta)',
                    color: 'var(--muted-foreground)', fontStyle: 'italic',
                    opacity: visible ? 1 : 0, transition: 'opacity 0.7s 0.45s',
                }}>— {data.attribution}</div>
            )}
        </div>
    );
}

// PULL QUOTE — single dramatic user quote, very large, accent-tinted mark
function PullQuoteSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.2);
    const accent = useContext(ProjectAccentCtx);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ margin: '0 0 72px', padding: '56px 0' }}>
            <div style={{
                fontSize: '72px', lineHeight: 1, fontFamily: 'Georgia, serif',
                color: accent, opacity: visible ? 0.55 : 0,
                transform: visible ? 'none' : 'translateY(-8px)',
                transition: `opacity 0.6s ${ease}, transform 0.6s ${ease}`,
                marginBottom: 12, userSelect: 'none',
            }}>"</div>
            <p style={{
                margin: '0 0 28px', maxWidth: 680,
                fontSize: 'clamp(20px, 2.6vw, 28px)', fontWeight: 500, lineHeight: 1.6,
                color: 'var(--foreground)', fontStyle: 'italic',
                opacity: visible ? 1 : 0,
                filter: visible ? 'blur(0px)' : 'blur(8px)',
                transform: visible ? 'none' : 'translateY(12px)',
                transition: `opacity 0.8s 0.1s ${ease}, filter 0.8s 0.1s, transform 0.8s 0.1s ${ease}`,
            }}>{data.text}</p>
            {(data.attribution || data.context) && (
                <div style={{
                    display: 'flex', flexDirection: 'column', gap: 3,
                    opacity: visible ? 1 : 0, transition: `opacity 0.6s 0.35s`,
                }}>
                    {data.attribution && (
                        <span style={{ fontSize: 'var(--modal-body)', fontWeight: 600, color: 'var(--foreground)' }}>
                            — {data.attribution}
                        </span>
                    )}
                    {data.context && (
                        <span style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', fontStyle: 'italic' }}>
                            {data.context}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}

// SCROLLING CARDS — horizontal Apple-style feature tour with snap scroll
function ScrollingCardsSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.08);
    const accent = useContext(ProjectAccentCtx);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const scrollRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    const onMouseDown = (e: React.MouseEvent) => {
        isDragging.current = true;
        startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
        scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
    };
    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !scrollRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollRef.current.offsetLeft;
        scrollRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.2;
    };
    const onMouseUp = () => { isDragging.current = false; };

    const items: { title: string; body: string; tag?: string }[] = data.items ?? [];

    return (
        <div ref={ref} style={{ marginBottom: 64 }}>
            {data.eyebrow && <Eyebrow text={data.eyebrow} />}
            {data.title && (
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, margin: '0 0 24px', color: 'var(--foreground)', lineHeight: 1.3 }}>
                    {data.title}
                </h3>
            )}
            <div
                ref={scrollRef}
                onMouseDown={onMouseDown}
                onMouseMove={onMouseMove}
                onMouseUp={onMouseUp}
                onMouseLeave={onMouseUp}
                style={{
                    display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 6,
                    scrollSnapType: 'x mandatory', cursor: 'grab', userSelect: 'none',
                    marginLeft: -2, paddingLeft: 2,
                }}
                className="scrolling-cards-track"
            >
                {items.map((item, i) => (
                    <div
                        key={i}
                        style={{
                            flexShrink: 0, width: 260, padding: '24px 22px', borderRadius: 16,
                            border: `1px solid var(--border)`, background: 'var(--muted)',
                            scrollSnapAlign: 'start',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'none' : 'translateX(24px)',
                            transition: `opacity 0.5s ${i * 0.1 + 0.1}s ${ease}, transform 0.55s ${i * 0.1 + 0.1}s ${ease}`,
                        }}
                    >
                        {item.tag && (
                            <span style={{
                                display: 'inline-block', padding: '3px 11px', borderRadius: 100, marginBottom: 18,
                                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                                background: `${accent}20`, color: accent,
                            }}>{item.tag}</span>
                        )}
                        <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px', color: 'var(--foreground)', lineHeight: 1.35 }}>{item.title}</h4>
                        <p style={{ fontSize: 'var(--modal-body)', color: 'var(--muted-foreground)', lineHeight: 1.7, margin: 0 }}>{item.body}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// CHALLENGES — alternating slide entrance, hover brightens + left border
function ChallengesSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.1);
    const [hoveredItem, setHoveredItem] = useState<number | null>(null);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const items: string[] = data.items ?? [];
    const mid = Math.ceil(items.length / 2);
    const left = items.slice(0, mid);
    const right = items.slice(mid);

    const renderItem = (item: string, localIdx: number, globalIdx: number, fromDir: 'left' | 'right') => {
        const isHovered = hoveredItem === globalIdx;
        return (
            <div key={localIdx}
                onMouseEnter={() => setHoveredItem(globalIdx)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                    display: 'flex', gap: 14, alignItems: 'flex-start',
                    padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: isHovered ? 'inset 2px 0 0 rgba(201,168,76,0.7)' : 'inset 2px 0 0 transparent',
                    paddingLeft: isHovered ? 10 : 0,
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : (fromDir === 'left' ? 'translateX(-28px)' : 'translateX(28px)'),
                    transition: `opacity 0.6s ${globalIdx * 0.06}s ${ease}, transform 0.6s ${globalIdx * 0.06}s ${ease}, box-shadow 0.25s, padding-left 0.25s ${ease}`,
                    cursor: 'default',
                }}>
                <span style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#C9A84C', flexShrink: 0, marginTop: 8,
                    transform: isHovered ? 'scale(1.5)' : 'scale(1)',
                    boxShadow: isHovered ? '0 0 6px rgba(201,168,76,0.7)' : 'none',
                    transition: `transform 0.25s ${ease}, box-shadow 0.25s`,
                }} />
                <span style={{
                    fontSize: 'var(--modal-body)', lineHeight: 1.6,
                    color: isHovered ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.82)',
                    transition: 'color 0.2s',
                }}>{item}</span>
            </div>
        );
    };

    return (
        <div ref={ref} style={{ margin: '0 -40px', padding: '72px 40px', background: data.bg_color || '#1B3A5C', marginBottom: 72 }}>
            <h3 style={{
                fontSize: 'var(--modal-heading)', fontWeight: 700, margin: '0 0 40px', color: '#fff',
                opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)',
                transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}`,
            }}>{data.title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 56px' }}>
                <div>{left.map((item, i) => renderItem(item, i, i, 'left'))}</div>
                <div>{right.map((item, i) => renderItem(item, i, i + mid, 'right'))}</div>
            </div>
        </div>
    );
}

// AFFINITY MAP — accordion with smooth height transition
function AffinityMapSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.06);
    const [open, setOpen] = useState<Set<string>>(
        new Set((data.clusters ?? []).slice(0, 2).map((c: any) => c.category))
    );
    const toggle = (cat: string) => setOpen(prev => {
        const next = new Set(prev);
        next.has(cat) ? next.delete(cat) : next.add(cat);
        return next;
    });
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ marginBottom: 72 }}>
            <h3 style={{
                fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, lineHeight: 1.22, margin: '0 0 36px', color: 'var(--foreground)',
                opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(32px)',
                transition: `opacity 0.8s ${ease}, transform 0.8s ${ease}`,
            }}>{data.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {data.clusters?.map((cluster: any, ci: number) => {
                    const isOpen = open.has(cluster.category);
                    return (
                        <div key={cluster.category} style={{
                            border: `1px solid ${isOpen ? 'rgba(74,122,181,0.3)' : 'var(--border)'}`,
                            borderRadius: 12, overflow: 'hidden',
                            transition: 'border-color 0.25s',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'none' : 'translateY(24px)',
                            transitionDelay: `${ci * 0.07}s`,
                        }}>
                            <button onClick={() => toggle(cluster.category)} style={{
                                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '18px 22px', background: isOpen ? 'rgba(74,122,181,0.05)' : 'var(--background)',
                                border: 'none', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.25s',
                            }}>
                                <span style={{ fontWeight: 600, fontSize: 'var(--modal-body)', color: 'var(--foreground)', textAlign: 'left' }}>{cluster.category}</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                    <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '2px 8px', borderRadius: 100 }}>{cluster.items.length}</span>
                                    <ChevronDown size={14} color="var(--muted-foreground)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                                </span>
                            </button>
                            {/* Smooth height with max-height trick */}
                            <div style={{
                                maxHeight: isOpen ? '800px' : '0',
                                overflow: 'hidden',
                                transition: 'max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}>
                                <div style={{ padding: '8px 22px 22px', display: 'flex', flexWrap: 'wrap', gap: 7 }}>
                                    {cluster.items?.map((item: string, ii: number) => (
                                        <span key={item} style={{
                                            fontSize: '12px', padding: '5px 13px', borderRadius: 100,
                                            background: 'var(--muted)', border: '1px solid var(--border)',
                                            color: 'var(--foreground)', lineHeight: 1.5,
                                            opacity: isOpen ? 1 : 0,
                                            transform: isOpen ? 'none' : 'scale(0.9)',
                                            transition: `opacity 0.3s ${ii * 0.02}s, transform 0.3s ${ii * 0.02}s cubic-bezier(0.16, 1, 0.3, 1)`,
                                        }}>{item}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// PERSONAS — directional slide tab transition, stagger card fields
function PersonasSection({ data }: { data: any }) {
    const [active, setActive] = useState(0);
    const [fading, setFading] = useState(false);
    const [dir, setDir] = useState(1); // 1 = forward, -1 = backward
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const switchTo = (i: number) => {
        if (i === active) return;
        setDir(i > active ? 1 : -1);
        setFading(true);
        setTimeout(() => { setActive(i); setFading(false); }, 180);
    };
    const p = data.items?.[active];
    const fields = [
        { key: 'biography', label: 'Biography' },
        { key: 'goal', label: 'Goal' },
        { key: 'needs', label: 'Needs' },
        { key: 'frustrations', label: 'Frustrations' },
    ];
    if (!p) return null;
    return (
        <div style={{ marginBottom: 72 }}>
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 28px', color: 'var(--foreground)' }}>{data.title}</h3>

            {/* Tab bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                {data.items?.map((item: any, i: number) => (
                    <button key={i} onClick={() => switchTo(i)} style={{
                        padding: '9px 22px', borderRadius: 100, fontFamily: 'inherit',
                        fontSize: 'var(--modal-meta)', fontWeight: active === i ? 700 : 500, cursor: 'pointer',
                        border: `1.5px solid ${active === i ? 'var(--foreground)' : 'var(--border)'}`,
                        background: active === i ? 'var(--foreground)' : 'transparent',
                        color: active === i ? 'var(--background)' : 'var(--muted-foreground)',
                        transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    }}>
                        {item.name}
                        <span style={{ marginLeft: 8, fontSize: '10px', opacity: 0.55, fontWeight: 400 }}>{item.type}</span>
                    </button>
                ))}
            </div>

            {/* Persona card */}
            <div style={{
                opacity: fading ? 0 : 1,
                transform: fading ? `translateX(${dir * -24}px)` : 'none',
                transition: fading ? 'opacity 0.18s ease-in, transform 0.18s ease-in' : `opacity 0.35s ${ease}, transform 0.35s ${ease}`,
                border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'flex', flexWrap: 'wrap',
            }}>
                {/* Left identity */}
                <div style={{ flex: '0 0 220px', padding: '32px 28px', background: 'var(--muted)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
                    {/* Avatar shimmer */}
                    <div style={{
                        width: 60, height: 60, borderRadius: '50%', marginBottom: 20,
                        background: 'linear-gradient(135deg, var(--border) 0%, var(--muted-foreground) 50%, var(--border) 100%)',
                        backgroundSize: '200% auto',
                        animation: 'none',
                    }} />
                    <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid var(--border)' }}>{p.type}</div>
                    {p.why_use && (
                        <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Why Use the App</div>
                            <div style={{ fontSize: '12px', lineHeight: 1.75, color: 'var(--foreground)' }}>{renderRich(p.why_use)}</div>
                        </div>
                    )}
                </div>
                {/* Right details — fields stagger in on key change */}
                <div style={{ flex: 1, padding: '32px', minWidth: 0 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px' }}>
                        {fields.map((f, fi) => p[f.key] && (
                            <div key={`${active}-${f.key}`} style={{
                                gridColumn: f.key === 'biography' ? '1 / -1' : undefined,
                                animation: `m-row-in 0.45s ${fi * 0.06}s ${ease} both`,
                            }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{f.label}</div>
                                <div style={{ fontSize: 'var(--modal-meta)', lineHeight: 1.8, color: 'var(--foreground)' }}>{renderRich(p[f.key])}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// FEATURE MATRIX — tab switch with staggered row entrance
function FeatureMatrixSection({ data }: { data: any }) {
    const [active, setActive] = useState(0);
    const [fading, setFading] = useState(false);

    const switchTo = (i: number) => {
        if (i === active) return;
        setFading(true);
        setTimeout(() => { setActive(i); setFading(false); }, 150);
    };
    const col = data.columns?.[active];
    if (!col) return null;
    return (
        <div style={{ marginBottom: 72 }}>
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px', color: 'var(--foreground)' }}>{data.title}</h3>
            <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)', margin: '0 0 28px' }}>{data.description}</p>
            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '1px solid var(--border)' }}>
                {data.columns?.map((c: any, i: number) => (
                    <button key={i} onClick={() => switchTo(i)} style={{
                        padding: '11px 20px', fontFamily: 'inherit', fontSize: 'var(--modal-meta)',
                        fontWeight: active === i ? 700 : 400, cursor: 'pointer', border: 'none',
                        background: 'none', color: active === i ? 'var(--foreground)' : 'var(--muted-foreground)',
                        borderBottom: `2px solid ${active === i ? 'var(--foreground)' : 'transparent'}`,
                        marginBottom: '-1px', transition: 'color 0.2s, border-color 0.2s',
                    }}>{c.persona}</button>
                ))}
            </div>
            {/* Rows — key changes to restart stagger animation */}
            <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 0.15s', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {col.features?.map((f: any, rowIdx: number) => (
                    <div key={`${active}-${f.name}`} style={{
                        display: 'flex', gap: 16, alignItems: 'flex-start', padding: '16px 20px',
                        borderRadius: 10,
                        border: `1px solid ${f.priority === 'high' ? 'rgba(74,122,181,0.25)' : 'var(--border)'}`,
                        background: f.priority === 'high' ? 'rgba(74,122,181,0.05)' : 'var(--muted)',
                        animation: `m-row-in 0.4s ${rowIdx * 0.05}s cubic-bezier(0.16, 1, 0.3, 1) both`,
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: f.priority === 'high' ? '#4A7AB5' : 'var(--border)',
                            flexShrink: 0, marginTop: 6,
                            animation: f.priority === 'high' ? 'none' : 'none',
                        }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--modal-body)', color: 'var(--foreground)', marginBottom: 4 }}>{f.name}</div>
                            <div style={{ fontSize: '12px', lineHeight: 1.65, color: 'var(--muted-foreground)' }}>{f.rationale}</div>
                        </div>
                        <span style={{
                            fontSize: '11px', padding: '3px 10px', borderRadius: 100,
                            background: f.priority === 'high' ? 'rgba(74,122,181,0.15)' : 'var(--muted)',
                            color: f.priority === 'high' ? '#4A7AB5' : 'var(--muted-foreground)',
                            fontWeight: 600, flexShrink: 0,
                        }}>{f.priority}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// USER FLOW — spring scale nodes, hover spotlight dims siblings
function UserFlowSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.08);
    const [hoveredStep, setHoveredStep] = useState<number | null>(null);
    const steps: string[] = data.steps ?? [];
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const springEase = 'cubic-bezier(0.34, 1.56, 0.64, 1)';
    return (
        <div style={{ marginBottom: 72 }}>
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 12px', color: 'var(--foreground)' }}>{data.title}</h3>
            <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)', margin: '0 0 32px' }}>{data.description}</p>
            {/* Each step+arrow is an atomic flex unit — prevents orphaned arrows on wrap */}
            <div ref={ref} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 0', alignItems: 'center' }}>
                {steps.map((step, i) => {
                    const isTerminal = step === 'Start' || step === 'End';
                    const isLast = i === steps.length - 1;
                    const isHovered = hoveredStep === i;
                    const isDimmed = hoveredStep !== null && hoveredStep !== i;
                    const d = i * 0.05;
                    return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                            {/* Node */}
                            <div
                                onMouseEnter={() => setHoveredStep(i)}
                                onMouseLeave={() => setHoveredStep(null)}
                                style={{
                                    padding: isTerminal ? '9px 18px' : '8px 14px',
                                    borderRadius: isTerminal ? 100 : 8,
                                    border: `1.5px solid ${isHovered ? 'var(--foreground)' : (isTerminal ? 'var(--foreground)' : 'var(--border)')}`,
                                    background: isHovered
                                        ? (isTerminal ? 'var(--foreground)' : 'var(--foreground)')
                                        : (isTerminal ? 'var(--foreground)' : 'var(--muted)'),
                                    color: (isHovered || isTerminal) ? 'var(--background)' : 'var(--foreground)',
                                    fontSize: '12px', fontWeight: isTerminal ? 700 : 500,
                                    whiteSpace: 'nowrap', cursor: 'default',
                                    opacity: visible ? (isDimmed ? 0.35 : 1) : 0,
                                    transform: visible
                                        ? (isHovered ? 'scale(1.1)' : 'scale(1)')
                                        : 'scale(0.6)',
                                    boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
                                    transition: `opacity 0.35s ${d}s ${ease}, transform 0.45s ${d}s ${springEase}, background 0.2s, border-color 0.2s, box-shadow 0.25s, color 0.15s`,
                                }}>
                                {!isTerminal && (
                                    <span style={{ color: isHovered ? 'rgba(255,255,255,0.5)' : 'var(--muted-foreground)', marginRight: 5, fontSize: '10px', fontFamily: 'var(--font-mono)', transition: 'color 0.15s' }}>
                                        {i}
                                    </span>
                                )}
                                {step}
                            </div>
                            {/* Arrow — part of same atomic unit, wraps with its node */}
                            {!isLast && (
                                <svg width="28" height="12" viewBox="0 0 28 12" fill="none" style={{ flexShrink: 0, margin: '0 2px', opacity: isDimmed ? 0.15 : 0.3, transition: 'opacity 0.25s' }}>
                                    <path
                                        d="M0 6h22M17 2L23 6 17 10"
                                        stroke="currentColor"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        pathLength="1"
                                        strokeDasharray="1"
                                        strokeDashoffset={visible ? 0 : 1}
                                        style={{
                                            transition: `stroke-dashoffset 0.4s ${d + 0.06}s ease`,
                                            color: 'var(--foreground)',
                                        }}
                                    />
                                </svg>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// WIREFRAMES — 3D tilt on hover, stagger entrance
function WireframesSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.08);
    const [tilts, setTilts] = useState([{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const onMove = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientY - r.top) / r.height - 0.5) * -10;
        const y = ((e.clientX - r.left) / r.width - 0.5) * 10;
        setTilts(t => t.map((v, idx) => idx === i ? {x, y} : v));
    };
    const onLeave = (i: number) => setTilts(t => t.map((v, idx) => idx === i ? {x:0,y:0} : v));

    return (
        <div ref={ref} style={{ marginBottom: 72 }}>
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.3, margin: '0 0 36px', color: 'var(--foreground)' }}>{data.title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : `translateY(${16 + i * 10}px) scale(0.95)`, transition: `opacity 0.6s ${i * 0.1}s ${ease}, transform 0.6s ${i * 0.1}s ${ease}` }}>
                        <div
                            onMouseMove={e => onMove(e, i)}
                            onMouseLeave={() => onLeave(i)}
                            style={{
                                transform: `perspective(700px) rotateX(${tilts[i].x}deg) rotateY(${tilts[i].y}deg)`,
                                transition: 'transform 0.3s ease',
                                borderRadius: 10, overflow: 'hidden', willChange: 'transform',
                            }}
                        >
                            <ImagePlaceholder height={300} label={`Wireframe ${i + 1}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// MOCKUP SHOWCASE — 3D tilt hover, depth stagger
function MockupShowcaseSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.08);
    const [tilts, setTilts] = useState([{x:0,y:0},{x:0,y:0},{x:0,y:0}]);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const onMove = (e: React.MouseEvent<HTMLDivElement>, i: number) => {
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientY - r.top) / r.height - 0.5) * -14;
        const y = ((e.clientX - r.left) / r.width - 0.5) * 14;
        setTilts(t => t.map((v, idx) => idx === i ? {x, y} : v));
    };
    const onLeave = (i: number) => setTilts(t => t.map((v, idx) => idx === i ? {x:0,y:0} : v));

    // Depth: center card at index 1 has different translateY for parallax feel
    const depths = [32, 16, 40];

    return (
        <div ref={ref} style={{ margin: '0 -40px', padding: '88px 40px', background: data.bg_color || '#0A1628', marginBottom: 72 }}>
            <h3 style={{
                fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 700, textAlign: 'center',
                color: '#fff', margin: '0 0 60px', lineHeight: 1.1,
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(28px)',
                transition: `opacity 0.8s ${ease}, transform 0.8s ${ease}`,
            }}>{data.title}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 52 }}>
                {[0, 1, 2].map(i => (
                    <div key={i} style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'none' : `translateY(${depths[i]}px)`,
                        transition: `opacity 0.7s ${i * 0.1}s ${ease}, transform 0.7s ${i * 0.1}s ${ease}`,
                    }}>
                        <div
                            onMouseMove={e => onMove(e, i)}
                            onMouseLeave={() => onLeave(i)}
                            style={{
                                borderRadius: 20, overflow: 'hidden',
                                transform: `perspective(900px) rotateX(${tilts[i].x}deg) rotateY(${tilts[i].y}deg)`,
                                transition: 'transform 0.25s ease',
                                willChange: 'transform',
                                boxShadow: `0 ${20 + Math.abs(tilts[i].x) * 2}px ${60}px rgba(0,0,0,0.5)`,
                            }}
                        >
                            <ImagePlaceholder height={400} label={`Screen ${i + 1}`} />
                        </div>
                    </div>
                ))}
            </div>
            <p style={{
                margin: '0 auto', maxWidth: 580, fontSize: 'var(--modal-body)', lineHeight: 1.85,
                color: 'rgba(255,255,255,0.55)', textAlign: 'center',
                opacity: visible ? 1 : 0, transition: `opacity 0.7s 0.4s ${ease}`,
            }}>{data.description}</p>
        </div>
    );
}

// VISUAL DESIGN — word-by-word title reveal, gold bar wipe, slide-in panes
function VisualDesignSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.12);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const words = (data.title ?? '').split(' ');
    return (
        <div ref={ref} style={{ margin: '0 -40px', padding: '88px 40px', background: data.bg_color || '#1B3A5C', marginBottom: 72 }}>
            <div style={{ display: 'flex', gap: 64, alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{
                    flex: '1 1 280px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'none' : 'translateX(-24px)',
                    transition: `opacity 0.8s ${ease}, transform 0.8s ${ease}`,
                }}>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>{data.eyebrow}</div>
                    {/* Word-by-word reveal */}
                    <h3 style={{
                        fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 700, margin: '0 0 24px',
                        color: '#fff', lineHeight: 1.05,
                        display: 'flex', flexWrap: 'wrap', gap: '0 0.22em',
                    }}>
                        {words.map((w: string, i: number) => (
                            <span key={i} style={{
                                display: 'inline-block',
                                opacity: visible ? 1 : 0,
                                transform: visible ? 'none' : 'translateY(18px)',
                                transition: `opacity 0.6s ${0.1 + i * 0.08}s ${ease}, transform 0.6s ${0.1 + i * 0.08}s ${ease}`,
                            }}>{w}</span>
                        ))}
                    </h3>
                    {/* Gold bar wipe */}
                    <div style={{
                        height: 3, borderRadius: 2, marginBottom: 24, background: '#C9A84C',
                        animation: visible ? `m-bar-wipe 0.8s 0.5s ${ease} both` : 'none',
                        width: visible ? 40 : 0,
                    }} />
                    <p style={{
                        margin: 0, fontSize: 'var(--modal-body)', lineHeight: 1.85,
                        color: 'rgba(255,255,255,0.65)', maxWidth: 380,
                        opacity: visible ? 1 : 0,
                        transition: `opacity 0.7s 0.55s ${ease}`,
                    }}>{data.description}</p>
                </div>
                <div style={{
                    flex: '0 0 280px',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'scale(1)' : 'scale(0.88) translateX(24px)',
                    transition: `opacity 0.8s 0.15s ${ease}, transform 0.8s 0.15s ${ease}`,
                }}>
                    <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <ImagePlaceholder height={360} label="Visual design" />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ModalSkeleton() {
    const pulse = { background: 'var(--muted)', borderRadius: 6, animation: 'skeleton-pulse 1.5s ease-in-out infinite' } as React.CSSProperties;
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

// ─── Word Reveal Section ──────────────────────────────────────────────────────
// ─── Floating emoji physics ───────────────────────────────────────────────────
interface EmojiParticle { x: number; y: number; vx: number; vy: number; rot: number; rotV: number; size: number; bounces: number; spawned: boolean; }

const GRAVITY     = 0.30;
const ROT_DRAG    = 0.972;
const FLOOR_VY    = 0.58;   // energy kept on floor bounce (exponentially decays per bounce)
const FLOOR_VX    = 0.80;   // floor friction
const WALL_VX     = 0.65;
const CEIL_VY     = 0.45;

function FloatingEmojis({ emojis, active }: { emojis: string[]; active: boolean }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const spanRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const particles = useRef<EmojiParticle[]>([]);
    const rafRef = useRef<number>(0);
    const initialized = useRef(false);

    useEffect(() => {
        if (!active) return;
        const container = containerRef.current;
        if (!container) return;

        if (!initialized.current) {
            const W = container.clientWidth;
            const H = container.clientHeight;
            const cx = W * 0.5;
            const cy = H * 0.42;

            // All particles start at center, burst outward (popcorn stagger 0–260ms)
            particles.current = emojis.map(() => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 8 + Math.random() * 11;
                return {
                    x: cx,
                    y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 6,  // upward bias on burst
                    rot: Math.random() * 360,
                    rotV: (Math.random() - 0.5) * 20, // fast initial spin
                    size: 22 + Math.floor(Math.random() * 22),
                    bounces: 0,
                    spawned: false,
                };
            });

            // Staggered popcorn entrance — random delay, NOT sequential
            spanRefs.current.forEach((span, i) => {
                if (!span) return;
                const p = particles.current[i];
                span.style.left      = `${p.x}px`;
                span.style.top       = `${p.y}px`;
                span.style.fontSize  = `${p.size}px`;
                span.style.transform = `rotate(${p.rot}deg) scale(0)`;
                span.style.opacity   = '0';
                const delay = Math.random() * 260;
                setTimeout(() => {
                    if (!span) return;
                    span.style.transition = 'opacity 0.25s ease, transform 0.38s cubic-bezier(0.34,1.56,0.64,1)';
                    span.style.opacity    = '1';
                    span.style.transform  = `rotate(${p.rot}deg) scale(1)`;
                    setTimeout(() => {
                        if (span) { span.style.transition = 'none'; p.spawned = true; }
                    }, 420);
                }, delay);
            });
            initialized.current = true;
        }

        const tick = () => {
            const W = containerRef.current?.clientWidth  ?? 400;
            const H = containerRef.current?.clientHeight ?? 300;

            particles.current.forEach((p, i) => {
                const span = spanRefs.current[i];
                if (!span || !p.spawned) return;

                // Gravity
                p.vy += GRAVITY;

                // Spin coupled to horizontal motion (rolling feel)
                p.rotV += p.vx * 0.035;
                p.rotV *= ROT_DRAG;

                p.x   += p.vx;
                p.y   += p.vy;
                p.rot += p.rotV;

                // Floor — energy decays per bounce
                if (p.y > H - p.size) {
                    p.y = H - p.size;
                    const retain = Math.pow(FLOOR_VY, 1 + p.bounces * 0.25);
                    p.vy    = -Math.abs(p.vy) * Math.max(retain, 0.12);
                    p.vx   *= FLOOR_VX;
                    p.rotV *= 0.72;
                    p.bounces++;
                }
                // Ceiling
                if (p.y < 0) {
                    p.y  = 0;
                    p.vy = Math.abs(p.vy) * CEIL_VY;
                }
                // Walls
                if (p.x < 0) {
                    p.x    = 0;
                    p.vx   = Math.abs(p.vx) * WALL_VX;
                    p.rotV *= -0.65;
                }
                if (p.x > W - p.size) {
                    p.x    = W - p.size;
                    p.vx   = -Math.abs(p.vx) * WALL_VX;
                    p.rotV *= -0.65;
                }

                // Nudge when nearly settled — keeps scene alive without chaos
                const speed = Math.hypot(p.vx, p.vy);
                if (speed < 0.5 && Math.random() < 0.003) {
                    const a = Math.random() * Math.PI * 2;
                    const s = 2.5 + Math.random() * 3.5;
                    p.vx   += Math.cos(a) * s;
                    p.vy   += Math.sin(a) * s - 2; // slight upward bias
                    p.rotV += (Math.random() - 0.5) * 5;
                    p.bounces = Math.max(0, p.bounces - 1); // restore a bit of bounce energy
                }

                span.style.left      = `${p.x}px`;
                span.style.top       = `${p.y}px`;
                span.style.transform = `rotate(${p.rot}deg) scale(1)`;
            });

            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(rafRef.current);
    }, [active, emojis]);

    return (
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            {emojis.map((emoji, i) => (
                <span
                    key={i}
                    ref={el => { spanRefs.current[i] = el; }}
                    style={{ position: 'absolute', opacity: 0, userSelect: 'none', lineHeight: 1, willChange: 'transform' }}
                >
                    {emoji}
                </span>
            ))}
        </div>
    );
}

function WordRevealSection({ data }: { data: any }) {
    const scrollRef = useContext(ModalScrollCtx);
    const sectionRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0);
    const emojis: string[] = data.emojis ?? [];

    useEffect(() => {
        const container = scrollRef?.current;
        const section = sectionRef.current;
        if (!container || !section) return;

        const onScroll = () => {
            const cRect = container.getBoundingClientRect();
            const sRect = section.getBoundingClientRect();
            const relTop = sRect.top - cRect.top;
            // Complete when section top reaches 20% from top of container
            const p = Math.max(0, Math.min(1, (-relTop + cRect.height * 0.8) / (sRect.height * 0.4)));
            setProgress(p);
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
        return () => container.removeEventListener('scroll', onScroll);
    }, [scrollRef]);

    const words = (data.text as string).split(' ');

    return (
        <div ref={sectionRef} style={{ position: 'relative', padding: '100px 40px 40vh', textAlign: 'center', maxWidth: 780, margin: '0 auto' }}>
            {emojis.length > 0 && <FloatingEmojis emojis={emojis} active={progress > 0} />}
            <div style={{ position: 'relative', zIndex: 1 }}>
                {data.eyebrow && (
                    <div style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 32 }}>
                        {data.eyebrow}
                    </div>
                )}
                <p style={{ fontSize: 'clamp(22px, 3.5vw, 40px)', fontWeight: 700, lineHeight: 1.35, margin: 0, letterSpacing: '-0.01em' }}>
                    {words.map((word: string, i: number) => {
                        const threshold = i / words.length;
                        const lit = progress >= threshold;
                        return (
                            <span
                                key={i}
                                style={{
                                    color: lit ? 'var(--foreground)' : 'var(--muted-foreground)',
                                    opacity: lit ? 1 : 0.25,
                                    transition: 'color 0.4s ease, opacity 0.4s ease',
                                }}
                            >
                                {word}{' '}
                            </span>
                        );
                    })}
                </p>
            </div>
        </div>
    );
}

// ─── Section Renderer Dispatcher ─────────────────────────────────────────────
function SectionRenderer({ section, meta }: { section: Section; meta: ProjectMeta }) {
    switch (section.type) {
        // Allianz
        case 'hero': return <HeroSection data={section.data} meta={meta} />;
        case 'statement': return <StatementSection data={section.data} motion={section.motion_spec} />;
        case 'text_media': return <TextMediaSection data={section.data} motion={section.motion_spec} />;
        case 'decisions': return <DecisionsSection data={section.data} motion={section.motion_spec} />;
        case 'pinned_cards': return <PinnedCardsSection data={section.data} motion={section.motion_spec} />;
        case 'word_reveal': return <WordRevealSection data={section.data} />;
        // Universal
        case 'big_number': return <BigNumberSection data={section.data} motion={section.motion_spec} />;
        case 'stat_grid': return <StatGridSection data={section.data} motion={section.motion_spec} />;
        case 'before_after': return <BeforeAfterSection data={section.data} motion={section.motion_spec} />;
        case 'insight_cards': return <InsightCardsSection data={section.data} motion={section.motion_spec} />;
        case 'audit_table': return <AuditTableSection data={section.data} motion={section.motion_spec} />;
        case 'demo': return <DemoSection data={section.data} />;
        // Profita
        case 'cover': return <CoverSection data={section.data} />;
        case 'project_overview': return <ProjectOverviewSection data={section.data} />;
        case 'intro_statement': return <IntroStatementSection data={section.data} />;
        case 'design_brief': return <DesignBriefSection data={section.data} />;
        case 'research_method': return <ResearchMethodSection data={section.data} />;
        case 'quote': return <QuoteSection data={section.data} />;
        case 'pull_quote': return <PullQuoteSection data={section.data} />;
        case 'scrolling_cards': return <ScrollingCardsSection data={section.data} />;
        case 'challenges': return <ChallengesSection data={section.data} />;
        case 'affinity_map': return <AffinityMapSection data={section.data} />;
        case 'personas': return <PersonasSection data={section.data} />;
        case 'feature_matrix': return <FeatureMatrixSection data={section.data} />;
        case 'user_flow': return <UserFlowSection data={section.data} />;
        case 'wireframes': return <WireframesSection data={section.data} />;
        case 'mockup_showcase': return <MockupShowcaseSection data={section.data} />;
        case 'visual_design': return <VisualDesignSection data={section.data} />;
        default: return null;
    }
}

// ─── Modal Footer ─────────────────────────────────────────────────────────────
const projects = (workData as any[]).filter(p => p.projectId);

function ModalFooter({ currentId, onOpenProject, onClose }: {
    currentId: string;
    onOpenProject: (id: string) => void;
    onClose: () => void;
}) {
    const idx = projects.findIndex(p => p.projectId === currentId);
    const next = projects[(idx + 1) % projects.length];
    const [hovered, setHovered] = useState(false);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    return (
        <div style={{ padding: '0 0 80px', marginTop: 40 }}>
            {/* Divider */}
            <div style={{ height: '1px', background: 'var(--border)', marginBottom: 48 }} />

            {/* Next project card */}
            <div
                role="button"
                tabIndex={0}
                onClick={() => onOpenProject(next.projectId)}
                onKeyDown={e => { if (e.key === 'Enter') onOpenProject(next.projectId); }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                style={{
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    height: 200,
                    background: next.cover_color ?? '#111',
                    transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
                    transition: `transform 0.5s ${ease}, box-shadow 0.5s ${ease}`,
                    boxShadow: hovered ? '0 16px 48px rgba(0,0,0,0.18)' : '0 4px 16px rgba(0,0,0,0.08)',
                }}
            >
                {/* Dot grid bg */}
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '22px 22px',
                }} />
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 70%)',
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: '70%',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
                }} />

                {/* Labels */}
                <div style={{ position: 'absolute', top: 24, left: 28 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                        Next project
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: 24, left: 28, right: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                            {next.title}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>
                            {next.type}
                        </div>
                    </div>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%',
                        border: '1px solid rgba(255,255,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transform: hovered ? 'translateX(4px)' : 'translateX(0)',
                        transition: `transform 0.4s ${ease}`,
                        flexShrink: 0,
                    }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Back to home */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
                <button
                    onClick={onClose}
                    style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: 'var(--muted-foreground)',
                        fontFamily: 'inherit', letterSpacing: '0.05em',
                        transition: 'color 0.2s',
                        padding: '8px 16px',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}
                >
                    ← Back to home
                </button>
            </div>
        </div>
    );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────
interface ProjectModalProps {
    projectId: string | null;
    onClose: () => void;
    onOpenProject: (id: string) => void;
}

export default function ProjectModal({ projectId, onClose, onOpenProject }: ProjectModalProps) {
    const [data, setData] = useState<ProjectData | null>(null);
    const [_loading, setLoading] = useState(false);
    const [contentVisible, setContentVisible] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('');
    const [scrollY, setScrollY] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const handleClose = () => {
        setIsExiting(true);
        setTimeout(() => { setIsExiting(false); onClose(); }, 450);
    };

    useEffect(() => {
        if (!projectId) { setData(null); setLoading(false); setContentVisible(false); return; }
        const loader = PROJECT_LOADERS[projectId];
        if (!loader) return;
        setLoading(true);
        setContentVisible(false);
        setData(null);
        if (contentRef.current) contentRef.current.scrollTop = 0;
        loader().then(mod => {
            setData(mod.default);
            setLoading(false);
            requestAnimationFrame(() => requestAnimationFrame(() => setContentVisible(true)));
        });
    }, [projectId]);

    useEffect(() => {
        if (!projectId) { setMounted(false); setIsExiting(false); setScrollY(0); return; }
        requestAnimationFrame(() => setMounted(true));
    }, [projectId]);

    useEffect(() => {
        if (!projectId) return;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        document.addEventListener('keydown', onKey);
        return () => { document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
    }, [projectId, onClose]);

    useEffect(() => {
        if (!data) return;
        const container = contentRef.current;
        const observer = new IntersectionObserver(
            entries => { entries.forEach(entry => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
            { root: container, rootMargin: '-20% 0px -70% 0px', threshold: 0 }
        );
        data.sections.filter(s => s.label).forEach(s => { const el = sectionRefs.current[s.id]; if (el) observer.observe(el); });
        return () => observer.disconnect();
    }, [data]);

    if (!projectId) return null;

    const navProgress = Math.min(scrollY / 80, 1);
    const navOpacity = navProgress;
    const navHeight = 72 - navProgress * 24;
    const sidebarVisible = scrollY > 160;
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const sidebarSections = data?.sections.filter(s => s.label) ?? [];

    const modal = (
        <>
        {/* Backdrop */}
        <div
            onClick={handleClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.55)',
                backdropFilter: 'blur(6px)',
                WebkitBackdropFilter: 'blur(6px)',
                zIndex: 1999,
                opacity: mounted && !isExiting ? 1 : 0,
                transition: `opacity 0.45s ${ease}`,
            }}
        />
        <div style={{
            position: 'fixed', inset: '8px',
            background: 'var(--background)',
            borderRadius: 16,
            boxShadow: '0 8px 64px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.07)',
            zIndex: 2000, overflow: 'hidden',
            opacity: mounted && !isExiting ? 1 : 0,
            transform: mounted && !isExiting ? 'translateY(0) scale(1)' : isExiting ? 'translateY(60px) scale(0.97)' : 'translateY(32px) scale(0.97)',
            transition: `opacity 0.45s ${ease}, transform 0.45s ${ease}`,
        }}>
            {/* Keyframe injection */}
            <style>{MODAL_CSS}</style>

            {/* Floating nav */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: navHeight, zIndex: 20, pointerEvents: 'none', willChange: 'height' }}>
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--background) 20%, transparent 100%)', opacity: navOpacity * 0.9, pointerEvents: 'none' }} />
                <button onClick={handleClose} style={{ position: 'absolute', top: Math.round(navHeight / 2 - 16), right: 16, width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border)', background: 'var(--background)', color: 'var(--foreground)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 30, pointerEvents: 'auto', flexShrink: 0 }} onMouseEnter={e => e.currentTarget.style.opacity = '0.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} aria-label="Close">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
                <div style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, pointerEvents: 'auto' }}>
                    <button onClick={handleClose} style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, transition: 'opacity 0.2s', color: 'var(--foreground)', fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.6'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} aria-label="Back">
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: data?.meta.cover_color ?? 'var(--foreground)', display: 'block', flexShrink: 0 }} />
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 500, lineHeight: 1 }}>Nate</span>
                    </button>
                    <ChevronRight size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
                    <span style={{ fontSize: 'var(--text-base)', fontFamily: 'inherit', color: 'var(--foreground)', opacity: data ? 1 : 0, transition: 'opacity 0.4s ease', maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {data?.meta.title ?? ''}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
                {/* Sidebar */}
                <nav style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 160, padding: '80px 0 40px 32px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2, zIndex: 5, opacity: sidebarVisible ? 1 : 0, transform: sidebarVisible ? 'translateX(0)' : 'translateX(-10px)', transition: `opacity 0.6s ${ease}, transform 0.6s ${ease}` }}>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '6px 0', fontSize: '13px', color: 'var(--muted-foreground)', marginBottom: 16, fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>Home</button>
                    {sidebarSections.map(s => {
                        const isActive = activeSection === s.id;
                        return (
                            <button key={s.id} onClick={() => sectionRefs.current[s.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '5px 0 5px 10px', fontSize: '13px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)', transition: 'color 0.25s, border-color 0.25s', lineHeight: 1.5, fontFamily: 'inherit', borderLeft: `2px solid ${isActive ? (data?.meta.cover_color ?? 'var(--foreground)') : 'transparent'}`, marginLeft: -2 }} onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--foreground)'; }} onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
                                {s.label}
                            </button>
                        );
                    })}
                </nav>

                {/* Scroll content — wrapped in context provider */}
                <div
                    ref={contentRef}
                    onScroll={e => setScrollY(e.currentTarget.scrollTop)}
                    style={{ width: '100%', height: '100%', overflowY: 'auto' }}
                >
                    <ProjectAccentCtx.Provider value={data?.meta.cover_color ?? '#888888'}>
                    <ModalScrollCtx.Provider value={contentRef}>
                        <div style={{ maxWidth: 900, margin: '0 auto', padding: '72px 40px 120px' }}>
                            {data?.meta.tags && data.meta.tags.length > 0 && (
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 40 }}>
                                    {data.meta.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: 'var(--modal-meta)', padding: '4px 10px', borderRadius: 100, border: '1px solid var(--border)', color: 'var(--muted-foreground)', letterSpacing: '0.04em' }}>{tag}</span>
                                    ))}
                                </div>
                            )}
                            {!contentVisible && <ModalSkeleton />}
                            {data && (
                                <div style={{ opacity: contentVisible ? 1 : 0, transition: `opacity 0.55s ${ease}` }}>
                                    {data.sections.map(section => (
                                        <div key={section.id} id={section.id} ref={el => { sectionRefs.current[section.id] = el; }}>
                                            <SectionRenderer section={section} meta={data.meta} />
                                        </div>
                                    ))}
                                    <ModalFooter currentId={projectId!} onOpenProject={onOpenProject} onClose={handleClose} />
                                </div>
                            )}
                        </div>
                    </ModalScrollCtx.Provider>
                    </ProjectAccentCtx.Provider>
                </div>
            </div>
        </div>
        </>
    );

    return createPortal(modal, document.body);
}

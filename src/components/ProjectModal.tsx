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
@keyframes blink       { 0%,49%{opacity:1} 50%,100%{opacity:0} }
@keyframes dot-breathe { 0%,100%{opacity:0.45} 50%{opacity:0.88} }
@keyframes persona-pulse { 0%{opacity:0;transform:translate(-50%,-50%) scale(1)} 18%{opacity:0.14} 100%{opacity:0;transform:translate(-50%,-50%) scale(2.3)} }
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
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Serif+Display:ital@0;1&family=Syne:wght@700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap');
.ds-atomic-scroll::-webkit-scrollbar { display: none }
.ds-atomic-scroll { -ms-overflow-style: none; scrollbar-width: none; }
@keyframes ds-live-blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
@keyframes ds-row-flash { 0%{background:rgba(52,211,153,0.22)} 100%{background:transparent} }
@keyframes ds-num-pop { 0%{transform:scale(1)} 40%{transform:scale(1.14)} 100%{transform:scale(1)} }
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
    'invitrace-design-system': () => import('../data/projects/invitrace-design-system.json') as any,
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
            <div style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', opacity: 0.45 }}>Image needed</div>
            <div style={{ fontSize: '16px', color: 'var(--muted-foreground)', textAlign: 'center', maxWidth: '72%', lineHeight: 1.6, opacity: 0.7 }}>{label}</div>
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
    const accent = useContext(ProjectAccentCtx);
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
            fontWeight: 600,
        }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, flexShrink: 0, display: 'inline-block' }} />
            {text}
        </div>
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
                    <h2 style={{ fontSize: 'var(--modal-display)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px', color: 'var(--foreground)', letterSpacing: '-0.03em' }}>{data.headline}</h2>
                    <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)' }}>{renderRich(data.body)}</div>
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
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 20px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.headline}</h3>
                <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)', marginBottom: 32 }}>{renderRich(data.body)}</div>
                {data.next && (
                    <div style={{ padding: '16px 20px', background: 'var(--muted)', borderRadius: 8, borderLeft: '3px solid var(--foreground)' }}>
                        <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Next Step</div>
                        <p style={{ margin: 0, fontSize: 'var(--modal-body)', lineHeight: 1.6, color: 'var(--muted-foreground)' }}>{data.next}</p>
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
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 14px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.headline}</h3>
            <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)', marginBottom: 24 }}>{renderRich(data.body)}</div>
            {listItems.length > 0 && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {listItems.map((item, i) => (
                        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: 'var(--modal-body)', color: 'var(--muted-foreground)' }}>
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
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 36px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.headline}</h3>
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
                            <div style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)' }}>{renderRich(item.description)}</div>
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
                lineHeight: 1.25, margin: '0 0 40px', color: 'var(--foreground)',
                letterSpacing: '-0.025em',
            }}>
                {data.headline}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                {data.items.map((item: any, i: number) => (
                    <PinnedCard
                        key={i}
                        number={item.number}
                        title={item.title}
                        description={item.description}
                        index={i}
                        visible={visible}
                        delay={i * (m.stagger ?? 0.12)}
                        problem={item.problem}
                        options={item.options}
                        chosen={item.chosen}
                        rationale={item.rationale}
                        cost={item.cost}
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
                <div style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, color: 'var(--foreground)', marginBottom: data.body ? 16 : 0, letterSpacing: '-0.025em' }}>{data.label}</div>
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
                                    fontSize: '16px', lineHeight: 1.5,
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
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, margin: '0 0 20px', color: 'var(--foreground)', lineHeight: 1.25, letterSpacing: '-0.025em' }}>
                    {data.title}
                </h3>
            )}

            {/* Severity filter pills */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap',
                opacity: visible ? 1 : 0, transition: `opacity 0.4s 0.05s ${ease}` }}>
                {filterOptions.map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '5px 14px', borderRadius: 100, fontFamily: 'inherit',
                        fontSize: '16px', letterSpacing: '0.04em', cursor: 'pointer',
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
                            fontSize: '16px', fontWeight: 700, textTransform: 'uppercase',
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
                            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--foreground)', paddingRight: 12, paddingTop: 1, lineHeight: 1.5 }}>{row.area}</div>
                            <div style={{ fontSize: 'var(--modal-body)', color: 'var(--muted-foreground)', lineHeight: 1.65, paddingRight: 20 }}>{row.finding}</div>
                            <div style={{ paddingTop: 2 }}>
                                <span style={{
                                    display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                                    fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
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
                <div style={{ fontSize: '16px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'var(--font-mono)' }}>
                    IDAS Queue — {SCAN_DOCS.length} documents
                </div>
                <button onClick={() => setRevealed(r => !r)} style={{ padding: '7px 16px', borderRadius: 8, fontFamily: 'inherit', cursor: 'pointer', fontSize: '16px', fontWeight: 600, background: revealed ? 'var(--background)' : accent, color: revealed ? 'var(--muted-foreground)' : '#fff', border: `1px solid ${revealed ? 'var(--border)' : accent}`, transition: `all 0.25s ${ease}` }}>
                    {revealed ? 'Hide signal' : '⚡ Enable signal'}
                </button>
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 116px 1fr 50px', padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--background)' }}>
                    {['Document', 'Category', 'Confidence', ''].map(h => (
                        <div key={h} style={{ fontSize: '16px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{h}</div>
                    ))}
                </div>
                {SCAN_DOCS.map((doc, i) => {
                    const s = getSignal(doc.confidence);
                    return (
                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 116px 1fr 50px', padding: '11px 14px', alignItems: 'center', background: revealed ? s.bg : 'var(--muted)', borderLeft: `3px solid ${revealed ? s.bar : 'transparent'}`, borderBottom: i < SCAN_DOCS.length - 1 ? '1px solid var(--border)' : 'none', transition: `background 0.45s ${i * 0.08}s ${ease}, border-color 0.45s ${i * 0.08}s ${ease}` }}>
                            <div style={{ fontSize: '16px', color: 'var(--foreground)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'var(--font-mono)', opacity: 0.8 }}>{doc.name}</div>
                            <span style={{ fontSize: 'var(--modal-floor)', padding: '2px 8px', borderRadius: 100, background: 'var(--background)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', width: 'fit-content' }}>{doc.category}</span>
                            <div style={{ paddingRight: 12 }}>
                                <div style={{ height: 3, borderRadius: 2, background: 'var(--border)' }}>
                                    <div style={{ height: '100%', borderRadius: 2, background: revealed ? s.bar : 'transparent', width: revealed ? `${doc.confidence}%` : '0%', transition: `width 0.55s ${i * 0.08 + 0.1}s ${ease}, background 0.3s ease` }} />
                                </div>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: 700, textAlign: 'right', color: revealed ? s.text : 'transparent', transition: `color 0.25s ${i * 0.08 + 0.4}s ease`, fontFamily: 'var(--font-mono)' }}>{doc.confidence}%</div>
                        </div>
                    );
                })}
            </div>
            <div style={{ marginTop: 10, padding: '9px 14px', borderRadius: 8, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', opacity: revealed ? 1 : 0, transition: `opacity 0.4s ${SCAN_DOCS.length * 0.08 + 0.3}s ease` }}>
                <span style={{ fontSize: '16px', color: '#dc2626' }}>⚠ {redCount} flagged for immediate review · {checkCount} need checking — you wouldn't have known without the signal.</span>
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
                    animation: `dot-breathe 1.6s ${i * 0.22}s infinite ease-in-out`,
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
                <div style={{ fontSize: '20px', flexShrink: 0, lineHeight: 1 }}>🤖</div>
                <div style={{ flex: 1, minWidth: 0, fontSize: '16px', color: 'var(--foreground)', lineHeight: 1.6 }}>
                    {aiThinking ? <AiThinkingDots /> : (
                        <span>
                            {aiDisplayed}
                            <span style={{ animation: 'blink 1s infinite' }}>|</span>
                        </span>
                    )}
                </div>
                <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.45, flexShrink: 0 }}>AI Chef</div>
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
                        <div style={{ fontSize: '20px', fontWeight: 600, color: 'var(--foreground)', marginBottom: 5 }}>
                            No recipe with just those.
                        </div>
                        <div style={{ fontSize: '16px', color: 'var(--muted-foreground)', marginBottom: 16 }}>
                            {suggestions.length > 0 ? 'One of these would unlock something:' : 'Try removing one and starting over.'}
                        </div>
                        {suggestions.length > 0 && (
                            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                                {suggestions.map(ing => (
                                    <button key={ing.id} onClick={() => toggle(ing.id)} style={{
                                        padding: '6px 14px', borderRadius: 100, fontFamily: 'inherit',
                                        cursor: 'pointer', fontSize: '16px', fontWeight: 600,
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
                                fontSize: '16px', color: 'var(--muted-foreground)',
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
                                    <span style={{ fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: accent }}>
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
                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 6, lineHeight: 1.2 }}>
                                    {match.recipe.name}
                                </div>
                                <p style={{ margin: '0 0 14px', fontSize: '16px', lineHeight: 1.6, color: 'var(--muted-foreground)' }}>
                                    {match.recipe.desc}
                                </p>
                                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                                    {usedList.map(n => {
                                        const ing = INGREDIENTS_LIST.find(d => d.id === n);
                                        return ing ? (
                                            <span key={n} style={{ fontSize: 'var(--modal-floor)', padding: '3px 9px', borderRadius: 100, background: `${accent}15`, border: `1px solid ${accent}`, color: accent, fontWeight: 600 }}>✓ {ing.emoji} {ing.label}</span>
                                        ) : null;
                                    })}
                                    {missingList.map(n => {
                                        const ing = INGREDIENTS_LIST.find(d => d.id === n);
                                        return ing ? (
                                            <span key={n} style={{ fontSize: 'var(--modal-floor)', padding: '3px 9px', borderRadius: 100, background: 'transparent', border: '1.5px dashed var(--border)', color: 'var(--muted-foreground)' }}>{ing.emoji} {ing.label}</span>
                                        ) : null;
                                    })}
                                    {extraList.length > 0 && <span style={{ fontSize: '16px', color: 'var(--muted-foreground)', opacity: 0.4, margin: '0 1px' }}>·</span>}
                                    {extraList.map(n => {
                                        const ing = INGREDIENTS_LIST.find(d => d.id === n);
                                        return ing ? (
                                            <span key={n} style={{ fontSize: 'var(--modal-floor)', padding: '3px 9px', borderRadius: 100, background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--muted-foreground)', opacity: 0.55 }}>{ing.emoji} {ing.label}</span>
                                        ) : null;
                                    })}
                                </div>
                                <div style={{ display: 'flex', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                                    {usedList.length > 0 && <span style={{ fontSize: '16px', color: accent, opacity: 0.7 }}>✓ in recipe</span>}
                                    {missingList.length > 0 && <span style={{ fontSize: '16px', color: 'var(--muted-foreground)', opacity: 0.6 }}>-- still need</span>}
                                    {extraList.length > 0 && <span style={{ fontSize: '16px', color: 'var(--muted-foreground)', opacity: 0.5 }}>· extra</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ── KITCHENWARE FILTER ────────────────────────────────────────── */}
            <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.45, textAlign: 'center', marginBottom: 8 }}>Kitchenware</div>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                    {KITCHENWARE.map(ware => {
                        const active = selectedWare.has(ware.id);
                        return (
                            <button key={ware.id} onClick={() => toggleWare(ware.id)} style={{
                                padding: '7px 14px', borderRadius: 100, fontFamily: 'inherit',
                                cursor: 'pointer', fontSize: '16px', fontWeight: active ? 700 : 500,
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
                <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', opacity: 0.45, textAlign: 'center', marginBottom: 8 }}>Ingredients</div>
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
                                    cursor: 'pointer', fontSize: '16px', fontWeight: active ? 700 : 500,
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
                textAlign: 'center', fontSize: '16px', minHeight: 16,
                color: match?.score === 1 ? accent : 'var(--muted-foreground)',
                transition: 'color 0.3s',
            }}>
                {hint}
            </div>
        </div>
    );
}

// ── Profita — Pain: raw data confusion → Relief: adapted clarity ─────────────

type ProfitaView = 'raw' | 'novice' | 'analyst';

function PersonaLens({ accent: _accent }: { accent: string }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [view, setView] = useState<ProfitaView>('raw');
    const ease = 'cubic-bezier(0.16,1,0.3,1)';

    useEffect(() => {
        const el = stageRef.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
        obs.observe(el); return () => obs.disconnect();
    }, []);

    const RAW_METRICS = [
        ['3Y CAGR', '14.8%'], ['Sharpe', '0.81'], ['Std Dev', '6.2%'],
        ['Max Drawdown', '-8.3%'], ['Beta', '0.72'], ['Expense', '0.65%'],
    ];

    return (
        <div ref={stageRef} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}` }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C9A84C', marginBottom: 8 }}>Interactive Demo</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: 6 }}>Same fund. What you see depends on who you are.</div>
                <div style={{ fontSize: 16, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>Start from the confusion — then choose your perspective.</div>
            </div>
            <div style={{ background: '#F7F6F4', borderRadius: 20, padding: '28px', border: '1px solid #E2DDD6', boxShadow: '0 2px 16px rgba(0,0,0,0.05)' }}>
                {/* Fund card */}
                <div style={{ maxWidth: 460, margin: '0 auto 20px', background: '#fff', borderRadius: 14, overflow: 'hidden', border: `1px solid ${view === 'analyst' ? '#A7F3D0' : view === 'novice' ? '#E0CFA0' : '#E8E4DE'}`, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: `border-color 0.5s ${ease}` }}>
                    {/* Card header — always visible */}
                    <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid #F0EDE8', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                            <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#A09585', marginBottom: 4 }}>Mutual Fund</div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#1A1714', letterSpacing: '-0.02em', lineHeight: 1.2 }}>LH Conservative Mixed</div>
                        </div>
                        <div style={{
                            fontSize: 'var(--modal-floor)', fontWeight: 700, padding: '4px 10px', borderRadius: 20, flexShrink: 0, marginTop: 2, whiteSpace: 'nowrap',
                            background: view === 'analyst' ? '#DCFCE7' : view === 'novice' ? '#FEF9EE' : '#F0EDE8',
                            color: view === 'analyst' ? '#059669' : view === 'novice' ? '#92610A' : '#7A6E5F',
                            transition: `background 0.4s ${ease}, color 0.4s ${ease}`,
                        }}>
                            {view === 'analyst' ? '▲ Top quartile' : view === 'novice' ? '★★★★★ Top-rated' : 'Conservative'}
                        </div>
                    </div>

                    {/* Card body — render only active view, key forces remount + fade */}
                    <div style={{ padding: '20px' }}>
                        {view === 'raw' && (
                            <div key="raw" style={{ animation: `drift-el-in 0.35s ${ease} both` }}>
                                {RAW_METRICS.map(([k, v], i) => (
                                    <div key={k} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < RAW_METRICS.length - 1 ? '1px solid #F0EDE8' : 'none' }}>
                                        <span style={{ fontSize: 'var(--modal-floor)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A09585' }}>{k}</span>
                                        <span style={{ fontSize: 20, fontWeight: 700, color: '#1A1714', letterSpacing: '-0.01em' }}>{v}</span>
                                    </div>
                                ))}
                                <div style={{ fontSize: 16, color: '#92610a', marginTop: 14, padding: '10px 14px', background: '#FEF9EE', borderRadius: 8, border: '1px solid #F0E0A0' }}>
                                    Is this fund good? You'd need a finance degree to know.
                                </div>
                            </div>
                        )}

                        {view === 'novice' && (
                            <SmartTooltip wide delay={280} content={<DriftTip label="Decision 02" title="Stars replace Sharpe ratio" body="Sarocha closes the app when she sees 0.81 Sharpe. ★★★★★ answers 'is this good?' without requiring any financial literacy." />}>
                                <div key="novice" style={{ animation: `drift-el-in 0.35s ${ease} both`, cursor: 'default' }}>
                                    <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
                                        {'★★★★★'.split('').map((s, i) => <span key={i} style={{ fontSize: 38, color: '#F59E0B', filter: 'drop-shadow(0 2px 6px #F59E0B30)' }}>{s}</span>)}
                                    </div>
                                    <div style={{ fontSize: 16, color: '#6B5F50', marginBottom: 20, lineHeight: 1.5 }}>Top-rated · Conservative · Good for beginners</div>
                                    <button style={{ width: '100%', padding: '13px', borderRadius: 10, background: '#1B3A5C', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Start with ฿1,000</button>
                                </div>
                            </SmartTooltip>
                        )}

                        {view === 'analyst' && (
                            <SmartTooltip wide delay={280} content={<DriftTip label="Decision 02" title="Return at hero scale for analysts" body="Anan's primary signal is performance. +14.8% scanned in half a second — same data as raw, now with the right hierarchy." />}>
                                <div key="analyst" style={{ animation: `drift-el-in 0.35s ${ease} both`, cursor: 'default' }}>
                                    {/* Hero — label above, number below (DiscoveryLens pattern) */}
                                    <div style={{ marginBottom: 16 }}>
                                        <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.09em', color: '#A09585', marginBottom: 6 }}>3-Year CAGR</div>
                                        <div style={{ fontSize: 56, fontWeight: 900, color: '#059669', letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 8 }}>+14.8%</div>
                                        {/* Projection — muted, only bold number in accent */}
                                        <div style={{ fontSize: 16, color: '#6B5F50', lineHeight: 1.5 }}>
                                            Outperforms category avg by <span style={{ fontWeight: 700, color: '#059669' }}>+2.1%</span> · 85% confidence
                                        </div>
                                    </div>
                                    {/* Secondary metrics as columns with dividers */}
                                    <div style={{ borderTop: '1px solid #F0EDE8', paddingTop: 14, display: 'flex' }}>
                                        {[['Sharpe', '0.81'], ['Std Dev', '6.2%'], ['Expense', '0.65%']].map(([k, v], i) => (
                                            <div key={k} style={{ flex: 1, paddingLeft: i > 0 ? 16 : 0, paddingRight: i < 2 ? 16 : 0, borderRight: i < 2 ? '1px solid #F0EDE8' : 'none' }}>
                                                <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#A09585', marginBottom: 4 }}>{k}</div>
                                                <div style={{ fontSize: 20, fontWeight: 700, color: '#1A1714' }}>{v}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <button style={{ width: '100%', marginTop: 16, padding: '13px', borderRadius: 10, background: '#059669', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>Compare funds →</button>
                                </div>
                            </SmartTooltip>
                        )}
                    </div>
                </div>

                {/* Choice buttons */}
                {view === 'raw' && (
                    <div style={{ display: 'flex', gap: 10, animation: `drift-el-in 0.4s ${ease} both` }}>
                        <SmartTooltip wide delay={300} content={<DriftTip label="Design decision" title="Stars replace Sharpe ratio" body="Novice investors close the app when they see raw metrics. Stars give a reference frame without requiring financial literacy." />}>
                            <button onClick={() => setView('novice')} style={{ flex: 1, padding: '14px', borderRadius: 12, background: '#1B3A5C', color: '#fff', fontSize: 16, fontWeight: 700, border: 'none', cursor: 'pointer' }}>
                                I'm new to investing
                            </button>
                        </SmartTooltip>
                        <SmartTooltip wide delay={300} content={<DriftTip label="Design decision" title="Same data — adapted hierarchy" body="Analysts need raw numbers, not tooltips explaining what a Sharpe ratio is. The data stays — only the visual hierarchy changes." />}>
                            <button onClick={() => setView('analyst')} style={{ flex: 1, padding: '14px', borderRadius: 12, background: 'transparent', color: '#1B3A5C', fontSize: 16, fontWeight: 700, border: '2px solid #1B3A5C', cursor: 'pointer' }}>
                                I'm an analyst
                            </button>
                        </SmartTooltip>
                    </div>
                )}
                {view !== 'raw' && (
                    <div style={{ textAlign: 'center', animation: `drift-el-in 0.4s ${ease} both` }}>
                        <button onClick={() => setView('raw')} style={{ fontSize: 16, color: '#A09585', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px' }}>← See the raw data again</button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Drift — Pain: 3 apps 15 min → Relief: 1 screen 30 sec ────────────────────

/** Structured tooltip card */
function DriftTip({ label, title, body }: { label: string; title: string; body: string }) {
    return (
        <div>
            <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 5, opacity: 0.45 }}>{label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: 5, lineHeight: 1.3 }}>{title}</div>
            <div style={{ fontSize: '16px', lineHeight: 1.65, opacity: 0.65 }}>{body}</div>
        </div>
    );
}



const DRIFT_CITIES_DATA = {
    Prague:  { flag: '🇨🇿', score: '9.2', cost: '$3,200', jobs: 20, nomads: 124, accent: '#E07830', bg: 'linear-gradient(160deg, #1C1208 0%, #271908 60%, #1C1208 100%)' },
    Lisbon:  { flag: '🇵🇹', score: '8.7', cost: '$2,800', jobs: 14, nomads: 89,  accent: '#818CF8', bg: 'linear-gradient(160deg, #0F0F1C 0%, #16162A 60%, #0F0F1C 100%)' },
    Bangkok: { flag: '🇹🇭', score: '7.9', cost: '$1,400', jobs: 31, nomads: 203, accent: '#34D399', bg: 'linear-gradient(160deg, #0A1410 0%, #0F1C16 60%, #0A1410 100%)' },
} as const;
type DCity = keyof typeof DRIFT_CITIES_DATA;

function DriftAppDemo({ accent: _accent }: { accent: string }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [city, setCity] = useState<DCity>('Prague');
    const [merged, setMerged] = useState(false);
    const ease = 'cubic-bezier(0.16,1,0.3,1)';
    const cd = DRIFT_CITIES_DATA[city];

    useEffect(() => {
        const el = stageRef.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
        obs.observe(el); return () => obs.disconnect();
    }, []);

    const APPS = [
        { name: 'Nomad List', icon: '🌍', value: cd.score, unit: '/10', label: 'Livability score', step: 'Open app, search city, check score', color: '#F59E0B' },
        { name: 'Remote.co',  icon: '💼', value: String(cd.jobs),   unit: ' jobs',   label: 'Remote jobs open', step: 'Open app, filter by city, count roles', color: '#6366F1' },
        { name: 'Meetup',     icon: '🤝', value: String(cd.nomads), unit: ' nomads', label: 'Active community',  step: 'Open app, find nomad groups, guess',  color: '#10B981' },
    ];

    return (
        <div ref={stageRef} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}` }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: cd.accent, marginBottom: 8 }}>Interactive Demo</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: 6 }}>3 apps. 15 minutes. One relocation decision.</div>
                <div style={{ fontSize: 16, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>This is how every nomad researches a city today.</div>
            </div>
            {/* City selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                {(Object.keys(DRIFT_CITIES_DATA) as DCity[]).map(c => (
                    <button key={c} onClick={() => { setCity(c); setMerged(false); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, background: city === c ? DRIFT_CITIES_DATA[c].accent : 'var(--muted)', color: city === c ? '#fff' : 'var(--foreground)', border: `1px solid ${city === c ? DRIFT_CITIES_DATA[c].accent : 'var(--border)'}`, cursor: 'pointer', fontSize: 16, fontWeight: 700, transition: `all 0.2s ${ease}` }}>
                        <span>{DRIFT_CITIES_DATA[c].flag}</span><span>{c}</span>
                    </button>
                ))}
            </div>
            {/* Pain state — light checklist, visually opposite of dark Drift state */}
            <div style={{ opacity: merged ? 0 : 1, transform: merged ? 'translateY(-8px) scale(0.98)' : 'none', transition: `opacity 0.35s ${ease}, transform 0.35s ${ease}`, pointerEvents: merged ? 'none' : 'auto', position: merged ? 'absolute' : 'relative', width: '100%' }}>
                <div style={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 12 }}>
                    {/* Header */}
                    <div style={{ padding: '11px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Without Drift — your research process</span>
                        <span style={{ fontSize: 'var(--modal-floor)', color: '#EF4444', fontWeight: 700, background: 'rgba(239,68,68,0.08)', padding: '3px 10px', borderRadius: 20 }}>~15 min</span>
                    </div>
                    {/* Step rows */}
                    {APPS.map((app, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < APPS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--modal-floor)', fontWeight: 700, color: 'var(--muted-foreground)', flexShrink: 0 }}>{i + 1}</div>
                            <span style={{ fontSize: 18, flexShrink: 0 }}>{app.icon}</span>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--foreground)', marginBottom: 2 }}>{app.name}</div>
                                <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)' }}>{app.step} → write it down</div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <div style={{ fontSize: 20, fontWeight: 800, color: app.color, letterSpacing: '-0.02em', lineHeight: 1 }}>{app.value}<span style={{ fontSize: 13 }}>{app.unit}</span></div>
                                <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', marginTop: 2 }}>~5 min</div>
                            </div>
                        </div>
                    ))}
                    {/* Total */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 16px', background: 'rgba(239,68,68,0.04)', borderTop: '1px solid rgba(239,68,68,0.12)' }}>
                        <span style={{ fontSize: 16, color: 'var(--muted-foreground)' }}>3 separate apps. Numbers don't talk to each other.</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: '#EF4444' }}>Decide by gut</span>
                    </div>
                </div>
                <button onClick={() => setMerged(true)} style={{ width: '100%', padding: '14px', borderRadius: 12, background: cd.accent, color: '#fff', fontSize: 16, fontWeight: 800, border: 'none', cursor: 'pointer', transition: `background 0.3s ${ease}` }}>
                    See how Drift handles this →
                </button>
            </div>
            {/* Unified state — relief */}
            <div style={{ opacity: merged ? 1 : 0, transform: merged ? 'none' : 'translateY(12px)', transition: `opacity 0.45s ${ease} 0.1s, transform 0.45s ${ease} 0.1s`, pointerEvents: merged ? 'auto' : 'none', position: merged ? 'relative' : 'absolute', width: merged ? undefined : '100%', top: merged ? undefined : 0 }}>
                <div key={city} style={{ background: cd.bg, borderRadius: 16, padding: '24px', border: `1px solid ${cd.accent}22`, boxShadow: `0 20px 56px rgba(0,0,0,0.55), 0 0 60px ${cd.accent}08` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                        <span style={{ fontSize: 28 }}>{cd.flag}</span>
                        <div>
                            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{city}</div>
                            <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cd.cost} / month</div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                        {APPS.map((app, i) => (
                            <SmartTooltip key={i} wide delay={300} content={<DriftTip label="Consolidation" title={`${app.name} → Drift`} body={`This used to require opening ${app.name} separately. Drift surfaces it on the city card — no tab-switching, no context loss.`} />}>
                                <div style={{ background: `${app.color}12`, borderRadius: 10, padding: '14px 12px', border: `1px solid ${app.color}30`, animation: `drift-el-in 0.4s ${ease} ${i * 0.1}s both`, cursor: 'default' }}>
                                    <div style={{ fontSize: 28, fontWeight: 900, color: app.color, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 5 }}>
                                        {app.value}<span style={{ fontSize: 16 }}>{app.unit}</span>
                                    </div>
                                    <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.75)', marginBottom: 6 }}>{app.label}</div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#4ade80', letterSpacing: '0.04em', textTransform: 'uppercase' }}>✓ from {app.name}</div>
                                </div>
                            </SmartTooltip>
                        ))}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: 'rgba(74,222,128,0.07)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: 14 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Decision: move to {city}.</div>
                        <span style={{ fontSize: 20, fontWeight: 900, color: '#4ade80' }}>~30 sec</span>
                    </div>
                    <button onClick={() => setMerged(false)} style={{ width: '100%', padding: '10px', borderRadius: 10, background: 'transparent', color: 'rgba(255,255,255,0.6)', fontSize: 16, border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}>← Back to the old way</button>
                </div>
            </div>
        </div>
    );
}

// ── Roomvu — Pain: 3.5h manual → Relief: 6 videos in 0 min ──────────────────
type RVCity = 'Vancouver' | 'Toronto' | 'Calgary' | 'Montreal';
const RV_CITIES: RVCity[] = ['Vancouver', 'Toronto', 'Calgary', 'Montreal'];

const RV_SIX_VIDEOS: { thumb: string; sub: string; dur: string; titleFn: (c: RVCity) => string }[] = [
    { thumb: 'linear-gradient(135deg,#1B3A5C,#2d6a8e)', sub: 'Market Report', dur: '2:30', titleFn: c => `Q4 Market Report — ${c}` },
    { thumb: 'linear-gradient(135deg,#1e4a2a,#2d7a3e)', sub: 'Listing',       dur: '1:45', titleFn: c => `Top Listings — ${c} Downtown` },
    { thumb: 'linear-gradient(135deg,#3a1e4a,#6a3a7a)', sub: 'Mobile',        dur: '3:10', titleFn: c => `5 Things Buyers Want in ${c}` },
    { thumb: 'linear-gradient(135deg,#1a2e4a,#243f6e)', sub: 'Market Report', dur: '4:00', titleFn: c => `Housing Outlook: ${c} 2024` },
    { thumb: 'linear-gradient(135deg,#243e18,#3a6424)', sub: 'Listing',       dur: '2:00', titleFn: c => `New Properties — ${c} West` },
    { thumb: 'linear-gradient(135deg,#3a1630,#602454)', sub: 'Mobile',        dur: '2:45', titleFn: c => `How to Win — ${c} Bidding War` },
];

const MANUAL_STEPS = [
    { task: 'Write script',   time: '45 min', icon: '✍️' },
    { task: 'Record video',   time: '60 min', icon: '🎥' },
    { task: 'Edit & cut',     time: '90 min', icon: '✂️' },
    { task: 'Brand & export', time: '45 min', icon: '📤' },
];

function RVSkeletonCard() {
    return (
        <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB' }}>
            <div style={{ height: 70, background: '#F3F4F6', animation: 'skeleton-pulse 1.2s ease-in-out infinite' }} />
            <div style={{ padding: '8px', background: '#fff' }}>
                <div style={{ height: 8, background: '#F3F4F6', borderRadius: 4, marginBottom: 5, animation: 'skeleton-pulse 1.2s ease-in-out infinite 0.1s' }} />
                <div style={{ height: 7, background: '#F3F4F6', borderRadius: 4, width: '55%', animation: 'skeleton-pulse 1.2s ease-in-out infinite 0.2s' }} />
            </div>
        </div>
    );
}

function RoomvuHomepageDemo({ accent }: { accent: string }) {
    const stageRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [mode, setMode] = useState<'manual' | 'roomvu'>('manual');
    const [city, setCity] = useState<RVCity>('Vancouver');
    const [loading, setLoading] = useState(false);
    const ease = 'cubic-bezier(0.16,1,0.3,1)';

    useEffect(() => {
        const el = stageRef.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.12 });
        obs.observe(el); return () => obs.disconnect();
    }, []);

    const switchCity = (c: RVCity) => {
        if (c === city) return;
        setLoading(true);
        setTimeout(() => { setCity(c); setLoading(false); }, 600);
    };

    return (
        <div ref={stageRef} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity 0.7s ${ease}, transform 0.7s ${ease}` }}>
            <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: accent, marginBottom: 8 }}>Interactive Demo</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--foreground)', letterSpacing: '-0.02em', marginBottom: 6 }}>Video drives 403% more inquiries. Making it takes 3.5 hours.</div>
                <div style={{ fontSize: 16, color: 'var(--muted-foreground)', lineHeight: 1.6 }}>That's why most agents still don't use it.</div>
            </div>
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                {/* Mode toggle */}
                <div style={{ display: 'flex', borderBottom: '1px solid #E5E7EB' }}>
                    <button onClick={() => setMode('manual')} style={{ flex: 1, padding: '13px', fontSize: 16, fontWeight: 700, color: mode === 'manual' ? '#111827' : '#9CA3AF', background: mode === 'manual' ? '#F9FAFB' : '#fff', border: 'none', borderRight: '1px solid #E5E7EB', cursor: 'pointer', transition: `all 0.2s ${ease}` }}>
                        Without Roomvu
                    </button>
                    <button onClick={() => setMode('roomvu')} style={{ flex: 1, padding: '13px', fontSize: 16, fontWeight: 700, color: mode === 'roomvu' ? accent : '#9CA3AF', background: mode === 'roomvu' ? `${accent}08` : '#fff', border: 'none', cursor: 'pointer', transition: `all 0.2s ${ease}` }}>
                        With Roomvu
                    </button>
                </div>
                <div style={{ padding: '24px' }}>
                    {/* Manual — pain state */}
                    {mode === 'manual' && (
                        <div style={{ animation: `drift-el-in 0.4s ${ease} both` }}>
                            <div style={{ fontSize: 16, fontWeight: 600, color: '#6B7280', marginBottom: 12 }}>Creating one market report video for Vancouver:</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                                {MANUAL_STEPS.map((s, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                                        <span style={{ fontSize: 16 }}>{s.icon}</span>
                                        <span style={{ flex: 1, fontSize: 16, color: '#374151', fontWeight: 500 }}>{s.task}</span>
                                        <span style={{ fontSize: 16, fontWeight: 700, color: '#EF4444' }}>{s.time}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 10 }}>
                                <span style={{ fontSize: 16, color: '#991B1B', fontWeight: 600 }}>Total — per video, per city</span>
                                <span style={{ fontSize: 25, fontWeight: 900, color: '#EF4444' }}>3.5 hours</span>
                            </div>
                            <div style={{ fontSize: 16, color: '#9CA3AF', textAlign: 'center', fontStyle: 'italic' }}>
                                So most agents just don't. Their competitors do.
                            </div>
                        </div>
                    )}
                    {/* Roomvu — relief state */}
                    {mode === 'roomvu' && (
                        <div style={{ animation: `drift-el-in 0.4s ${ease} both` }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
                                {RV_CITIES.map(c => (
                                    <SmartTooltip key={c} wide delay={250} content={<DriftTip label="Decision 01" title="Content is city-scoped by default" body="Every video in Roomvu is city-scoped. Switching city regenerates the entire library — not a filter on top of a national catalogue." />}>
                                        <button onClick={() => switchCity(c)} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, background: city === c ? accent : '#F9FAFB', border: `1px solid ${city === c ? accent : '#E5E7EB'}`, cursor: 'pointer', fontSize: 16, fontWeight: 700, color: city === c ? '#fff' : '#374151', transition: `all 0.2s ${ease}` }}>
                                            <span style={{ fontSize: 16 }}>📍</span>{c}
                                        </button>
                                    </SmartTooltip>
                                ))}
                            </div>
                            {loading ? (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                    {[0,1,2,3,4,5].map(i => <RVSkeletonCard key={i} />)}
                                </div>
                            ) : (
                                <div key={city} style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                                    {RV_SIX_VIDEOS.map((v, i) => {
                                        const title = v.titleFn(city);
                                        const parts = title.split(city);
                                        return (
                                            <div key={i} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #E5E7EB', animation: `drift-el-in 0.28s ${ease} ${i * 0.06}s both` }}>
                                                <div style={{ height: 70, background: v.thumb, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <span style={{ fontSize: 16, marginLeft: 2, color: '#fff' }}>▶</span>
                                                    </div>
                                                    <div style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 16, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '1px 4px', borderRadius: 3 }}>{v.dur}</div>
                                                </div>
                                                <div style={{ padding: '7px 9px', background: '#fff' }}>
                                                    <div style={{ fontSize: 16, fontWeight: 600, color: '#111827', lineHeight: 1.4, marginBottom: 2 }}>
                                                        {parts.length > 1 ? <>{parts[0]}<span style={{ color: accent, fontWeight: 800 }}>{city}</span>{parts[1]}</> : title}
                                                    </div>
                                                    <div style={{ fontSize: 16, color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{v.sub}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {!loading && (
                                <div key={`ready-${city}`} style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', animation: `drift-el-in 0.4s ${ease} 0.45s both` }}>
                                    <span style={{ fontSize: 16, fontWeight: 700, color: accent }}>✓ 6 videos ready for {city}</span>
                                    <span style={{ fontSize: 16, fontWeight: 900, color: '#059669' }}>0 minutes</span>
                                </div>
                            )}
                        </div>
                    )}
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
            {data.headline && <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 8px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.headline}</h3>}
            {data.description && <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.7, color: 'var(--muted-foreground)', margin: '0 0 24px' }}>{data.description}</p>}
            <div style={{ padding: '24px', borderRadius: 16, border: '1px solid var(--border)', background: 'var(--muted)' }}>{demo}</div>
        </div>
    );
}

// ─── Profita Section Renderers ────────────────────────────────────────────────

// COVER — 2-column hero: gradient text title left, glass stat card right
function CoverSection({ data }: { data: any }) {
    const [visible, setVisible] = useState(false);
    const [count, setCount] = useState(0);
    const [isWide, setIsWide] = useState(() => window.innerWidth >= 720);
    const scrollPct = useCoverScroll();
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 60);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const update = () => setIsWide(window.innerWidth >= 720);
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    // Counter animation for return % or fraction numerator
    useEffect(() => {
        if (!visible || !data.perf_stat) return;
        const isFraction = data.perf_stat.format === 'fraction';
        const target = isFraction ? parseInt(data.perf_stat.value) : parseFloat(data.perf_stat.value);
        const dur = isFraction ? 1200 : 1800; const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setCount(isFraction ? Math.round(target * e) : parseFloat((target * e).toFixed(1)));
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [visible, data.perf_stat]);

    const bgScale = 1 + scrollPct * 0.07;
    const contentY = scrollPct * -60;
    const contentOpacity = Math.max(0, 1 - scrollPct * 2.0);
    const gold = '#C9A84C';

    return (
        <div style={{
            margin: '0 -40px', minHeight: '85vh',
            background: data.bg_color || '#1B3A5C',
            display: 'flex', alignItems: 'center',
            marginBottom: 80, position: 'relative', overflow: 'hidden',
        }}>
            {/* Bg: top-right gold glow */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 70% 60% at 85% 12%, rgba(201,168,76,0.14) 0%, transparent 55%)`,
                transform: `scale(${bgScale})`,
            }} />
            {/* Bg: bottom-left depth shadow */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: `radial-gradient(ellipse 55% 50% at 5% 95%, rgba(0,0,0,0.4) 0%, transparent 60%)`,
            }} />
            {/* Bg: fine dot grid */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.028,
                backgroundImage: `radial-gradient(circle, rgba(201,168,76,1) 1px, transparent 1px)`,
                backgroundSize: '30px 30px',
            }} />
            {/* Bottom border accent */}
            <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(to right, transparent 5%, rgba(201,168,76,0.2) 40%, rgba(201,168,76,0.2) 60%, transparent 95%)`,
            }} />

            {/* Content grid */}
            <div style={{
                width: '100%', padding: '100px 40px 80px',
                opacity: contentOpacity,
                transform: `translateY(${contentY}px)`,
                display: 'grid',
                gridTemplateColumns: isWide ? '1fr 1fr' : '1fr',
                gap: '40px 56px',
                alignItems: 'center',
            }}>
                {/* ── Left: text ── */}
                <div>
                    {/* Award badge */}
                    {data.award_badge && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 7,
                            marginBottom: 24, padding: '5px 12px 5px 8px', borderRadius: 100,
                            border: `1px solid rgba(201,168,76,0.28)`,
                            background: 'rgba(201,168,76,0.07)',
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'none' : 'translateY(-8px)',
                            transition: `opacity 0.5s ${ease}, transform 0.5s ${ease}`,
                        }}>
                            <div style={{
                                width: 20, height: 20, borderRadius: '50%',
                                background: 'rgba(201,168,76,0.14)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="8 21 12 17 16 21" />
                                    <line x1="12" y1="17" x2="12" y2="11" />
                                    <path d="M7 4H17l-1 7a4 4 0 01-8 0L7 4z" />
                                </svg>
                            </div>
                            <span style={{ fontSize: '12px', color: gold, fontWeight: 600, letterSpacing: '0.04em' }}>
                                {data.eyebrow}
                            </span>
                        </div>
                    )}

                    {/* Title — gradient text */}
                    <h2 style={{
                        fontSize: 'clamp(38px, 5.5vw, 68px)',
                        fontWeight: 900,
                        lineHeight: 0.95,
                        letterSpacing: '-0.04em',
                        margin: '0 0 16px',
                        background: `linear-gradient(140deg, ${gold} 0%, #F2E0A0 45%, ${gold} 85%)`,
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'none' : 'translateY(22px)',
                        transition: `opacity 0.7s 0.1s ${ease}, transform 0.7s 0.1s ${ease}`,
                    }}>
                        {data.title}
                    </h2>

                    {/* Tagline */}
                    {data.tagline && (
                        <div style={{
                            fontSize: 'clamp(15px, 1.8vw, 20px)',
                            fontWeight: 700,
                            color: 'rgba(255,255,255,0.85)',
                            letterSpacing: '-0.02em',
                            lineHeight: 1.3,
                            marginBottom: 18,
                            opacity: visible ? 1 : 0,
                            transform: visible ? 'none' : 'translateY(14px)',
                            transition: `opacity 0.7s 0.22s ${ease}, transform 0.7s 0.22s ${ease}`,
                        }}>
                            {data.tagline}
                        </div>
                    )}

                    {/* Subtitle */}
                    <p style={{
                        fontSize: 'var(--modal-body)', lineHeight: 1.75,
                        color: 'rgba(255,255,255,0.48)',
                        margin: 0, maxWidth: 420,
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'none' : 'translateY(10px)',
                        transition: `opacity 0.8s 0.36s ${ease}, transform 0.8s 0.36s ${ease}`,
                    }}>
                        {data.subtitle}
                    </p>
                </div>

                {/* ── Right: glass performance card ── */}
                {data.perf_stat && (
                    <div style={{
                        opacity: visible ? 1 : 0,
                        transform: visible ? 'none' : 'translateY(28px) scale(0.96)',
                        transition: `opacity 0.9s 0.48s ${ease}, transform 0.9s 0.48s ${ease}`,
                    }}>
                        <div style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid rgba(201,168,76,0.2)`,
                            borderRadius: 22,
                            padding: '26px 26px 20px',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                            position: 'relative', overflow: 'hidden',
                        }}>
                            {/* Inner glow top-right */}
                            <div style={{
                                position: 'absolute', top: 0, right: 0,
                                width: '65%', height: '55%',
                                background: `radial-gradient(ellipse at top right, rgba(16,185,129,0.09), transparent 70%)`,
                                pointerEvents: 'none',
                            }} />

                            {/* Eyebrow */}
                            <div style={{
                                fontSize: '11px', fontWeight: 700,
                                textTransform: 'uppercase', letterSpacing: '0.1em',
                                color: 'rgba(255,255,255,0.38)', marginBottom: 12,
                            }}>
                                {data.perf_stat.label}
                            </div>

                            {/* Return % OR fraction stat, counts up */}
                            <div style={{
                                fontSize: 'clamp(36px, 5vw, 56px)',
                                fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1,
                                marginBottom: 8,
                                background: 'linear-gradient(135deg, #10B981 0%, #6EE7B7 55%, #10B981 100%)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                {data.perf_stat.format === 'fraction'
                                    ? `${Math.round(count as number)}/${data.perf_stat.denominator}`
                                    : `+${(count as number).toFixed(1)}%`}
                            </div>

                            {/* Secondary row: risk score OR text label */}
                            {data.perf_stat.format === 'fraction' ? (
                                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500, marginBottom: 20 }}>
                                    {data.perf_stat.secondary_label}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
                                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
                                        Risk Score
                                    </span>
                                    <span style={{
                                        fontSize: '12px', fontWeight: 700, color: '#10B981',
                                        background: 'rgba(16,185,129,0.13)',
                                        padding: '2px 9px', borderRadius: 20,
                                    }}>
                                        {data.perf_stat.risk} / 100
                                    </span>
                                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.08em' }}>
                                        LOW
                                    </span>
                                </div>
                            )}

                            {/* Sparkline: performance curve or adoption S-curve */}
                            <svg width="100%" height="50" viewBox="0 0 260 50" preserveAspectRatio="none" style={{ display: 'block', marginBottom: 14 }}>
                                <defs>
                                    <linearGradient id="cov-fill" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="rgba(16,185,129,0.22)" />
                                        <stop offset="100%" stopColor="rgba(16,185,129,0)" />
                                    </linearGradient>
                                </defs>
                                {data.perf_stat.format === 'fraction' ? (
                                    <>
                                        <path d="M 0,46 C 40,46 60,44 100,32 C 140,18 160,8 260,4 L 260,50 L 0,50 Z" fill="url(#cov-fill)" />
                                        <path d="M 0,46 C 40,46 60,44 100,32 C 140,18 160,8 260,4" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                                        <circle cx="260" cy="4" r="3.5" fill="#10B981" />
                                    </>
                                ) : (
                                    <>
                                        <path d="M 0,46 C 65,46 130,26 260,4 L 260,50 L 0,50 Z" fill="url(#cov-fill)" />
                                        <path d="M 0,46 C 65,46 130,26 260,4" fill="none" stroke="#10B981" strokeWidth="1.8" strokeLinecap="round" />
                                        <circle cx="260" cy="4" r="3.5" fill="#10B981" />
                                    </>
                                )}
                            </svg>

                            {/* Detail */}
                            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.03em' }}>
                                {data.perf_stat.detail}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Scroll indicator */}
            <div style={{
                position: 'absolute', bottom: 26, left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                opacity: visible && scrollPct < 0.05 ? 0.38 : 0,
                transition: 'opacity 0.5s',
            }}>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>scroll</div>
                <div style={{ width: 1, height: 22, background: `linear-gradient(to bottom, rgba(201,168,76,0.5), transparent)` }} />
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
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#C9A84C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Awarded</div>
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
                {data.label && <div style={{ fontSize: '16px', color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>{data.label}</div>}
                <h3 style={{ fontSize: '17px', fontWeight: 700, lineHeight: 1.25, margin: '0 0 32px', color: 'var(--foreground)', letterSpacing: '-0.02em' }}>{data.title}</h3>
                <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>My Role</div>
                    {data.my_role?.map((r: string) => (
                        <div key={r} style={{ fontSize: 'var(--modal-meta)', color: 'var(--foreground)', marginBottom: 5, lineHeight: 1.4 }}>{r}</div>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 28 }}>
                    {[{ label: 'Client', val: data.client }, { label: 'Year', val: data.year }].map(({ label, val }) => (
                        <div key={label}>
                            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
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
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Overview</div>
                    <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)', margin: 0 }}>{data.overview}</p>
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
            <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 20, opacity: visible ? 1 : 0, transition: 'opacity 0.6s' }}>{data.eyebrow}</div>
            <h3 style={{
                fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 800, lineHeight: 1.1,
                margin: '0 0 28px', color: '#C9A84C', maxWidth: 680, letterSpacing: '-0.03em',
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
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 14px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.title}</h3>
            <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)', margin: '0 0 44px', maxWidth: 640 }}>{data.body}</p>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--foreground)', marginBottom: 22, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Questions to consider</div>
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
                        <div style={{ fontSize: '16px', fontWeight: 700, color: hovered === i ? '#4A7AB5' : 'var(--muted-foreground)', marginBottom: 14, transition: 'color 0.2s', position: 'relative' }}>Q{q.number}</div>
                        <p style={{ margin: 0, fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)', position: 'relative' }}>
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
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 44px', color: 'var(--foreground)', maxWidth: 580, letterSpacing: '-0.025em' }}>{data.title}</h3>
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

// QUOTE — editorial left-border callout
function QuoteSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.25);
    const accent = useContext(ProjectAccentCtx);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    return (
        <div ref={ref} style={{ marginBottom: 72 }}>
            <div style={{
                borderLeft: `3px solid ${accent}`,
                paddingLeft: 28,
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateX(-14px)',
                transition: `opacity 0.65s ${ease}, transform 0.65s ${ease}`,
            }}>
                <div style={{
                    fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.13em',
                    color: accent, marginBottom: 14, opacity: 0.8,
                }}>
                    {data.prefix || 'HMW'}
                </div>
                <p style={{
                    margin: 0,
                    fontSize: 'clamp(17px, 2vw, 24px)',
                    fontWeight: 600, lineHeight: 1.55,
                    color: 'var(--foreground)', letterSpacing: '-0.01em',
                }}>
                    {data.text}
                </p>
                {data.attribution && (
                    <div style={{
                        marginTop: 14, fontSize: 'var(--modal-meta)',
                        color: 'var(--muted-foreground)',
                        opacity: visible ? 1 : 0,
                        transition: `opacity 0.6s 0.3s`,
                    }}>— {data.attribution}</div>
                )}
            </div>
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
                <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, margin: '0 0 24px', color: 'var(--foreground)', lineHeight: 1.25, letterSpacing: '-0.025em' }}>
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
                                fontSize: '16px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em',
                                background: `${accent}20`, color: accent,
                            }}>{item.tag}</span>
                        )}
                        <h4 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 10px', color: 'var(--foreground)', lineHeight: 1.35 }}>{item.title}</h4>
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
                fontSize: 'clamp(22px, 3vw, 36px)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 36px', color: 'var(--foreground)', letterSpacing: '-0.03em',
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
                                    <span style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', background: 'var(--muted)', padding: '2px 8px', borderRadius: 100 }}>{cluster.items.length}</span>
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
                                            fontSize: 'var(--modal-floor)', padding: '5px 13px', borderRadius: 100,
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

// PERSONAS — orbital diagram: multi-persona = click to switch; single persona = attribute orbit
function PersonasSection({ data }: { data: any }) {
    const [active, setActive] = useState(0);
    const stageRef = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const items: any[] = data.items || [];
    const p = items[active];

    useEffect(() => {
        const el = stageRef.current; if (!el) return;
        const obs = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
        }, { threshold: 0.1 });
        obs.observe(el); return () => obs.disconnect();
    }, []);

    if (!p) return null;

    const COLORS = ['#4A7AB5', '#C9A84C', '#059669', '#8B5CF6', '#EF4444'];
    const ORBIT_R = 145;

    const getPos = (i: number, total: number) => {
        const angle = -90 + (360 / total) * i;
        const rad = (angle * Math.PI) / 180;
        return { x: Math.cos(rad) * ORBIT_R, y: Math.sin(rad) * ORBIT_R };
    };

    // Single-persona mode: attribute cards orbit the persona
    const attrCards = items.length === 1 ? [
        { label: 'Goal', text: p.goal },
        { label: 'Needs', text: p.needs },
        { label: 'Frustrations', text: p.frustrations },
        { label: 'In the App', text: p.why_use },
    ].filter(a => a.text).slice(0, 4) : [];

    const orbitItems = items.length === 1 ? attrCards : items;
    const activeColor = COLORS[active % COLORS.length];

    const fields = [
        { key: 'biography', label: 'Biography' },
        { key: 'goal', label: 'Goal' },
        { key: 'needs', label: 'Needs' },
        { key: 'frustrations', label: 'Frustrations' },
    ];

    return (
        <div ref={stageRef} style={{ marginBottom: 72, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `opacity 0.6s ${ease}, transform 0.6s ${ease}` }}>
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 8px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.title}</h3>
            {items.length > 1 && (
                <p style={{ fontSize: 'var(--modal-body)', lineHeight: 1.65, color: 'var(--muted-foreground)', margin: '0 0 36px' }}>
                    Click a persona to explore their perspective.
                </p>
            )}

            {/* ── Orbital stage ── */}
            <div style={{ position: 'relative', height: 400, maxWidth: 560, margin: '0 auto', overflow: 'hidden' }}>

                {/* Orbit ring */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: ORBIT_R * 2 + 48, height: ORBIT_R * 2 + 48,
                    borderRadius: '50%', border: '1px solid var(--border)',
                    transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                }} />
                {/* Inner decorative ring */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    width: 160, height: 160, borderRadius: '50%',
                    border: '1px dashed var(--border)', opacity: 0.5,
                    transform: 'translate(-50%, -50%)', pointerEvents: 'none',
                }} />


                {/* Pulse rings — seamless loop (start+end at opacity:0, no jump) */}
                {[0, 1].map(i => (
                    <div key={i} className="persona-pulse-ring" style={{
                        position: 'absolute', top: '50%', left: '50%',
                        width: 116, height: 116, borderRadius: '50%',
                        border: `1.5px solid ${activeColor}`,
                        animation: `persona-pulse ${6}s ${i * 3}s ease-out infinite`,
                        pointerEvents: 'none', zIndex: 2,
                    }} />
                ))}

                {/* Center circle */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 116, height: 116, borderRadius: '50%',
                    background: 'var(--background)',
                    border: `2px solid ${activeColor}`,
                    boxShadow: `0 0 0 5px ${activeColor}14`,
                    transition: `border-color 0.4s ${ease}, box-shadow 0.4s ${ease}`,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: 3, zIndex: 4, textAlign: 'center', padding: '0 8px',
                }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: `${activeColor}1A`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 15, fontWeight: 800, color: activeColor, marginBottom: 3,
                        transition: `background 0.4s ${ease}, color 0.4s ${ease}`,
                    }}>
                        {p.name.charAt(0)}
                    </div>
                    <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>
                        {p.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--muted-foreground)', lineHeight: 1.1 }}>
                        {p.type.split(' ')[0]}
                    </div>
                </div>

                {/* Connector dot + orbit card for each item */}
                {orbitItems.map((item: any, i: number) => {
                    const pos = getPos(i, orbitItems.length);
                    const isActive = items.length > 1 ? i === active : true;
                    const color = COLORS[i % COLORS.length];
                    const dotR = (ORBIT_R * 2 + 48) / 2;
                    const angle = -90 + (360 / orbitItems.length) * i;
                    const rad = (angle * Math.PI) / 180;
                    const dotX = Math.cos(rad) * dotR;
                    const dotY = Math.sin(rad) * dotR;

                    return (
                        <React.Fragment key={i}>
                            {/* Connector dot on orbit ring */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: `translate(calc(-50% + ${dotX}px), calc(-50% + ${dotY}px))`,
                                width: isActive ? 10 : 7, height: isActive ? 10 : 7,
                                borderRadius: '50%',
                                background: isActive ? color : 'var(--border)',
                                border: `2px solid var(--background)`,
                                boxShadow: isActive ? `0 0 0 3px ${color}28` : 'none',
                                transition: `all 0.4s ${ease}`,
                                zIndex: 5, pointerEvents: 'none',
                            }} />

                            {/* Card — outer div: positioning, inner div: float animation */}
                            <div style={{
                                position: 'absolute', top: '50%', left: '50%',
                                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                                zIndex: 3,
                            }}>
                                <div
                                    onClick={() => items.length > 1 && setActive(i)}
                                    className="float-persona-card"
                                    style={{
                                        width: 140,
                                        padding: '11px 13px',
                                        borderRadius: 12,
                                        background: 'var(--background)',
                                        border: `1.5px solid ${isActive ? color : 'var(--border)'}`,
                                        boxShadow: isActive ? `0 4px 18px ${color}1E` : '0 2px 8px rgba(0,0,0,0.05)',
                                        cursor: items.length > 1 ? 'pointer' : 'default',
                                        transition: `border-color 0.3s ${ease}, box-shadow 0.3s ${ease}`,
                                        animation: `float-persona ${5 + i * 0.7}s ${i * 1.1}s ease-in-out infinite`,
                                    }}
                                >
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color, marginBottom: 7, transition: `background 0.3s ${ease}` }} />
                                    {items.length > 1 ? (
                                        <>
                                            <div style={{ fontSize: 'var(--modal-meta)', fontWeight: 700, color: 'var(--foreground)', marginBottom: 3, lineHeight: 1.2 }}>{item.name}</div>
                                            <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', lineHeight: 1.3 }}>{item.type}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{item.label}</div>
                                            <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--foreground)', lineHeight: 1.45, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.text}</div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </React.Fragment>
                    );
                })}
            </div>

            {/* ── Detail panel (multi-persona only) ── */}
            {items.length > 1 && (
                <div key={active} style={{
                    marginTop: 28,
                    animation: `drift-el-in 0.4s ${ease} both`,
                    border: '1px solid var(--border)',
                    borderTop: `3px solid ${activeColor}`,
                    borderRadius: 14, overflow: 'hidden',
                    transition: `border-top-color 0.35s ${ease}`,
                }}>
                    {/* Identity header row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid var(--border)', background: 'var(--muted)' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                            background: `${activeColor}1A`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 800, color: activeColor,
                            transition: `background 0.35s ${ease}, color 0.35s ${ease}`,
                        }}>
                            {p.name.charAt(0)}
                        </div>
                        <div>
                            <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--foreground)', lineHeight: 1.2 }}>{p.name}</div>
                            <div style={{ fontSize: 'var(--modal-meta)', color: 'var(--muted-foreground)', marginTop: 2 }}>{p.type}</div>
                        </div>
                    </div>

                    {/* Fields — single column for easy reading */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {[...fields, { key: 'why_use', label: 'In the App' }].map((f, fi) => p[f.key] && (
                            <div key={`${active}-${f.key}`} style={{ animation: `m-row-in 0.4s ${fi * 0.05}s ${ease} both` }}>
                                <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, color: activeColor, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, transition: `color 0.35s ${ease}` }}>{f.label}</div>
                                <div style={{ fontSize: 'var(--modal-meta)', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{renderRich(p[f.key])}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Single-persona: why_use strip */}
            {items.length === 1 && p.why_use && (
                <div style={{ marginTop: 28, padding: '20px 24px', borderRadius: 14, background: 'var(--muted)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>In the app</div>
                    <div style={{ fontSize: 'var(--modal-meta)', lineHeight: 1.7, color: 'var(--muted-foreground)' }}>{renderRich(p.why_use)}</div>
                </div>
            )}
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
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 12px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.title}</h3>
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
                            <div style={{ fontSize: '16px', lineHeight: 1.65, color: 'var(--muted-foreground)' }}>{f.rationale}</div>
                        </div>
                        <span style={{
                            fontSize: 'var(--modal-floor)', padding: '3px 10px', borderRadius: 100,
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
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 12px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.title}</h3>
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
                                    fontSize: '16px', fontWeight: isTerminal ? 700 : 500,
                                    whiteSpace: 'nowrap', cursor: 'default',
                                    opacity: visible ? (isDimmed ? 0.35 : 1) : 0,
                                    transform: visible
                                        ? (isHovered ? 'scale(1.1)' : 'scale(1)')
                                        : 'scale(0.6)',
                                    boxShadow: isHovered ? '0 4px 16px rgba(0,0,0,0.18)' : 'none',
                                    transition: `opacity 0.35s ${d}s ${ease}, transform 0.45s ${d}s ${springEase}, background 0.2s, border-color 0.2s, box-shadow 0.25s, color 0.15s`,
                                }}>
                                {!isTerminal && (
                                    <span style={{ color: isHovered ? 'rgba(255,255,255,0.5)' : 'var(--muted-foreground)', marginRight: 5, fontSize: '16px', fontFamily: 'var(--font-mono)', transition: 'color 0.15s' }}>
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
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 36px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>{data.title}</h3>
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
                fontSize: 'clamp(28px, 4.5vw, 56px)', fontWeight: 800, textAlign: 'center',
                color: '#fff', margin: '0 0 60px', lineHeight: 1.05, letterSpacing: '-0.03em',
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
                color: 'rgba(255,255,255,0.75)', textAlign: 'center',
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
                    <div style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>{data.eyebrow}</div>
                    {/* Word-by-word reveal */}
                    <h3 style={{
                        fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 800, margin: '0 0 24px',
                        color: '#fff', lineHeight: 1.0, letterSpacing: '-0.035em',
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
                    <div style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted-foreground)', marginBottom: 32 }}>
                        {data.eyebrow}
                    </div>
                )}
                <p style={{ fontSize: 'clamp(22px, 3.5vw, 40px)', fontWeight: 800, lineHeight: 1.25, margin: 0, letterSpacing: '-0.03em' }}>
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

// ─── Robo Demo Section ────────────────────────────────────────────────────────
function RoboDemoSection({ data }: { data: any }) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    const [counts, setCounts] = useState({ before: 0, after: 0 });
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    useEffect(() => {
        const el = ref.current; if (!el) return;
        const io = new IntersectionObserver(([e]) => {
            if (e.isIntersecting) { setVisible(true); io.disconnect(); }
        }, { threshold: 0.25 });
        io.observe(el); return () => io.disconnect();
    }, []);

    useEffect(() => {
        if (!visible) return;
        const dur = 1100; const start = performance.now();
        const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setCounts({ before: Math.round(74 * e), after: Math.round(28 * e) });
            if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }, [visible]);

    const cards = [
        {
            label: 'Manual Selection',
            metricLabel: 'Portfolio Risk Score',
            hero: counts.before,
            badge: '↑ High Risk',
            badgeColor: '#EF4444',
            delta: '2 funds  ·  1 sector  ·  over-concentrated',
            period: 'Without ROBO',
            accent: '#EF4444',
            fillFrom: 'rgba(239,68,68,0.16)',
            fillTo: 'rgba(239,68,68,0)',
            // Jagged volatile line
            linePath: 'M 0,70 L 28,38 L 48,58 L 68,16 L 88,52 L 108,20 L 130,56 L 152,26 L 172,54 L 200,20',
        },
        {
            label: 'After ROBO Advisor',
            metricLabel: 'Portfolio Risk Score',
            hero: counts.after,
            badge: '↓ 62% lower risk',
            badgeColor: '#10B981',
            delta: '5 funds  ·  4 sectors  ·  AI-diversified',
            period: 'AI optimized',
            accent: '#10B981',
            fillFrom: 'rgba(16,185,129,0.14)',
            fillTo: 'rgba(16,185,129,0)',
            // Smooth upward curve
            linePath: 'M 0,72 C 55,72 110,42 200,12',
        },
    ];

    return (
        <div ref={ref} style={{ marginBottom: 72, opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(20px)', transition: `opacity 0.6s ${ease}, transform 0.6s ${ease}` }}>
            {data.eyebrow && (
                <div style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--muted-foreground)', marginBottom: 8 }}>
                    {data.eyebrow}
                </div>
            )}
            <h3 style={{ fontSize: 'var(--modal-heading)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 6px', color: 'var(--foreground)', letterSpacing: '-0.025em' }}>
                {data.headline}
            </h3>
            {data.subtitle && (
                <p style={{ fontSize: 'var(--modal-body)', color: 'var(--muted-foreground)', lineHeight: 1.65, margin: '0 0 28px' }}>
                    {data.subtitle}
                </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cards.map((card, ci) => {
                    const gradId = `rg-${ci}`;
                    const areaPath = `${card.linePath} L 200,80 L 0,80 Z`;
                    return (
                        <div key={ci} style={{
                            background: 'var(--card)',
                            borderRadius: 18,
                            border: '1px solid var(--border)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.05)',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'stretch',
                            minHeight: 136,
                            animation: visible ? `m-row-in 0.55s ${0.08 + ci * 0.18}s ${ease} both` : 'none',
                        }}>
                            {/* Left — text */}
                            <div style={{ flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <span style={{ fontSize: 'var(--modal-meta)', fontWeight: 500, color: 'var(--muted-foreground)' }}>{card.label}</span>
                                    <span style={{ fontSize: 'var(--modal-floor)', fontWeight: 700, color: card.badgeColor, whiteSpace: 'nowrap' }}>{card.badge}</span>
                                </div>
                                <div>
                                    <div style={{ fontSize: 58, fontWeight: 800, color: 'var(--foreground)', lineHeight: 1, letterSpacing: '-0.04em', marginBottom: 5 }}>
                                        {card.hero}
                                    </div>
                                    <div style={{ fontSize: 'var(--modal-floor)', color: 'var(--muted-foreground)', fontWeight: 500 }}>{card.delta}</div>
                                </div>
                            </div>

                            {/* Right — chart bleeding to edge */}
                            <div style={{ width: '42%', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
                                <svg
                                    width="100%" height="100%"
                                    viewBox="0 0 200 80"
                                    preserveAspectRatio="none"
                                    style={{ display: 'block', position: 'absolute', inset: 0 }}
                                >
                                    <defs>
                                        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor={card.fillFrom} />
                                            <stop offset="100%" stopColor={card.fillTo} />
                                        </linearGradient>
                                    </defs>
                                    <path d={areaPath} fill={`url(#${gradId})`} />
                                    <path d={card.linePath} fill="none" stroke={card.accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    {/* End dot */}
                                    <circle cx={200} cy={ci === 0 ? 20 : 12} r="3.5" fill={card.accent} />
                                </svg>
                                {/* Tooltip pill — bottom-right */}
                                <div style={{
                                    position: 'absolute', right: 12, bottom: 14,
                                    background: 'var(--background)',
                                    border: '1px solid var(--border)',
                                    borderRadius: 8, padding: '4px 10px',
                                    fontSize: '10px', fontWeight: 600,
                                    color: 'var(--foreground)',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.09)',
                                    whiteSpace: 'nowrap', lineHeight: 1.5,
                                }}>
                                    <div>Risk: {card.hero || (ci === 0 ? 74 : 28)}</div>
                                    <div style={{ color: 'var(--muted-foreground)', fontWeight: 400 }}>{card.period}</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ─── DS Tokens — Component X-Ray with layered token chain (Invitrace) ─────────
function DsTokensSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.1);
    const [activeId, setActiveId] = useState<string>(data.tokens?.[0]?.id ?? '');
    const [hoverId, setHoverId] = useState<string | null>(null);
    const accent = useContext(ProjectAccentCtx);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    const displayId = hoverId ?? activeId;
    const tokens: any[] = data.tokens ?? [];
    const activeToken = tokens.find(t => t.id === displayId) ?? tokens[0];
    // Use explicit button_color from data so dark-bg projects don't render invisible buttons
    const btnColor = data.button_color ?? accent;

    // 4-layer color scheme: Raw → Primitive → Semantic → Component
    const layerMeta: Record<string, { color: string; label: string }> = {
        Raw:       { color: '#6B7280', label: 'Raw Value' },
        Primitive: { color: '#A78BFA', label: 'Primitive Token' },
        Semantic:  { color: '#60A5FA', label: 'Semantic Token' },
        Component: { color: '#34D399', label: 'Component Token' },
    };

    // Overlay helpers: show anatomy annotation when a token is selected
    const is = (id: string) => displayId === id;

    const cornerPositions = [
        { top: 0, left: 0 }, { top: 0, right: 0 },
        { bottom: 0, left: 0 }, { bottom: 0, right: 0 },
    ];

    return (
        <section ref={ref} style={{ padding: '80px 0 72px' }}>
            {/* Header */}
            <div style={{ opacity: visible ? 1 : 0, transition: `opacity 0.5s ${ease}` }}>
                <div style={{
                    fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.12em',
                    color: 'var(--muted-foreground)', marginBottom: 10,
                }}>
                    {data.eyebrow}
                </div>
                <h2 style={{
                    fontSize: 'var(--modal-heading)', fontWeight: 800, marginBottom: 10,
                    color: 'var(--foreground)', letterSpacing: '-0.025em', lineHeight: 1.2,
                }}>
                    {data.headline}
                </h2>
                <p style={{
                    fontSize: 'var(--modal-body)', color: 'var(--muted-foreground)',
                    marginBottom: 40, maxWidth: 480, lineHeight: 1.65,
                }}>
                    {data.subtitle}
                </p>
            </div>

            {/* Main: X-Ray canvas + Token chain */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 16,
                opacity: visible ? 1 : 0,
                transform: visible ? 'none' : 'translateY(20px)',
                transition: `opacity 0.6s 0.2s ${ease}, transform 0.6s 0.2s ${ease}`,
            }}>

                {/* ── Left: component preview canvas ── */}
                <div style={{
                    background: 'var(--muted)',
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    padding: '36px 40px 24px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', position: 'relative', overflow: 'hidden',
                }}>
                    {/* Subtle dot-grid */}
                    <div style={{
                        position: 'absolute', inset: 0, pointerEvents: 'none',
                        backgroundImage: 'radial-gradient(circle, var(--border) 1px, transparent 1px)',
                        backgroundSize: '22px 22px',
                    }} />
                    {/* Soft radial glow behind button */}
                    <div style={{
                        position: 'absolute', top: '50%', left: '50%',
                        transform: 'translate(-50%, -60%)',
                        width: 300, height: 200,
                        background: `radial-gradient(ellipse, ${btnColor}20 0%, transparent 70%)`,
                        pointerEvents: 'none',
                    }} />

                    {/* Component frame label */}
                    <div style={{
                        position: 'absolute', top: 14, left: 16,
                        fontSize: '10px', fontFamily: 'var(--font-mono)',
                        color: 'var(--muted-foreground)', letterSpacing: '0.06em', opacity: 0.6,
                    }}>
                        {data.component_name ?? 'Button / Primary'}
                    </div>

                    {/* Button + anatomy overlays */}
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 40px', position: 'relative' }}>
                        <div style={{ position: 'relative', display: 'inline-block' }}>

                            {/* H-Padding anatomy */}
                            {is('space-h') && (
                                <div style={{ position: 'absolute', inset: 0, borderRadius: 8, pointerEvents: 'none' }}>
                                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 20, background: `${btnColor}28`, borderRight: `1.5px dashed ${btnColor}` }} />
                                    <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 20, background: `${btnColor}28`, borderLeft: `1.5px dashed ${btnColor}` }} />
                                </div>
                            )}
                            {/* V-Padding anatomy */}
                            {is('space-v') && (
                                <div style={{ position: 'absolute', inset: 0, borderRadius: 8, pointerEvents: 'none' }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 11, background: `${btnColor}28`, borderBottom: `1.5px dashed ${btnColor}` }} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 11, background: `${btnColor}28`, borderTop: `1.5px dashed ${btnColor}` }} />
                                </div>
                            )}
                            {/* Corner radius anatomy */}
                            {is('radius') && cornerPositions.map((pos, i) => (
                                <div key={i} style={{
                                    position: 'absolute', width: 18, height: 18,
                                    ...pos,
                                    borderTop:    pos.bottom === undefined ? `2px solid ${btnColor}` : undefined,
                                    borderBottom: pos.top    === undefined ? `2px solid ${btnColor}` : undefined,
                                    borderLeft:   pos.right  === undefined ? `2px solid ${btnColor}` : undefined,
                                    borderRight:  pos.left   === undefined ? `2px solid ${btnColor}` : undefined,
                                    borderTopLeftRadius:     (pos.top    !== undefined && pos.left  !== undefined) ? 8 : undefined,
                                    borderTopRightRadius:    (pos.top    !== undefined && pos.right !== undefined) ? 8 : undefined,
                                    borderBottomLeftRadius:  (pos.bottom !== undefined && pos.left  !== undefined) ? 8 : undefined,
                                    borderBottomRightRadius: (pos.bottom !== undefined && pos.right !== undefined) ? 8 : undefined,
                                    pointerEvents: 'none',
                                }} />
                            ))}

                            {/* The button */}
                            <button style={{
                                display: 'block',
                                background: btnColor,
                                color: '#fff',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '11px 20px',
                                fontSize: '14px', fontWeight: 500,
                                fontFamily: 'var(--font-sans)',
                                letterSpacing: '0.01em',
                                cursor: 'default', pointerEvents: 'none',
                                boxShadow: is('bg')
                                    ? `0 0 0 3px ${btnColor}80, 0 0 48px ${btnColor}50`
                                    : `0 4px 24px ${btnColor}38, 0 1px 4px ${btnColor}20`,
                                transition: 'box-shadow 0.25s',
                                position: 'relative',
                            }}>
                                <span style={{
                                    background: is('text') ? 'rgba(255,255,255,0.22)' : is('font') ? 'rgba(255,255,255,0.10)' : 'none',
                                    borderRadius: 3,
                                    padding: (is('text') || is('font')) ? '1px 3px' : '0',
                                    transition: 'all 0.2s',
                                }}>
                                    {data.button_label ?? 'Confirm Review'}
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Token property tabs — bottom of canvas */}
                    <div style={{
                        display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
                        paddingTop: 18, borderTop: '1px solid var(--border)', width: '100%',
                    }}>
                        {tokens.map((token: any) => (
                            <button
                                key={token.id}
                                onClick={() => setActiveId(token.id)}
                                onMouseEnter={() => setHoverId(token.id)}
                                onMouseLeave={() => setHoverId(null)}
                                style={{
                                    padding: '5px 13px', borderRadius: 20,
                                    background: activeId === token.id ? btnColor : 'var(--background)',
                                    border: `1px solid ${activeId === token.id ? btnColor : 'var(--border)'}`,
                                    color: activeId === token.id ? '#fff' : 'var(--muted-foreground)',
                                    fontSize: '10px', fontWeight: 600,
                                    fontFamily: 'var(--font-mono)',
                                    cursor: 'pointer', letterSpacing: '0.06em',
                                    textTransform: 'uppercase', transition: 'all 0.18s',
                                }}
                            >
                                {token.description}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ── Right: 4-layer token chain ── */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 0 4px 4px' }}>
                    {/* Chain label */}
                    <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em',
                        color: 'var(--muted-foreground)', marginBottom: 18,
                    }}>
                        {activeToken?.description} · chain
                    </div>

                    {/* Chain cards — keyed on displayId so they re-animate on switch */}
                    <div key={displayId} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                        {(activeToken?.chain ?? []).map((level: any, i: number) => {
                            const lm = layerMeta[level.layer] ?? { color: '#888', label: level.layer };
                            const isLast = i === (activeToken.chain.length - 1);
                            return (
                                <React.Fragment key={level.layer}>
                                    <div style={{
                                        padding: '13px 16px', borderRadius: 10,
                                        border: `1px solid ${lm.color}28`,
                                        background: `${lm.color}0A`,
                                        animation: 'm-fade-up 0.32s ease-out both',
                                        animationDelay: `${i * 0.07}s`,
                                    }}>
                                        {/* Layer label */}
                                        <div style={{
                                            fontSize: '9px', fontWeight: 800,
                                            textTransform: 'uppercase', letterSpacing: '0.12em',
                                            color: lm.color, marginBottom: 5,
                                        }}>
                                            {lm.label}
                                        </div>
                                        {/* Token name */}
                                        <div style={{
                                            fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600,
                                            color: 'var(--foreground)', marginBottom: level.detail ? 3 : 0,
                                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                        }}>
                                            {level.name}
                                        </div>
                                        {level.detail && (
                                            <div style={{ fontSize: '11px', color: 'var(--muted-foreground)', fontFamily: 'var(--font-mono)' }}>
                                                {level.detail}
                                            </div>
                                        )}
                                    </div>
                                    {/* Arrow connector between layers */}
                                    {!isLast && (
                                        <div style={{ padding: '3px 0 3px 20px', animation: 'm-fade-up 0.3s ease-out both', animationDelay: `${i * 0.07 + 0.04}s` }}>
                                            <svg width="10" height="14" viewBox="0 0 10 14" fill="none">
                                                <path d="M5 0 L5 10 M2 7 L5 12 L8 7"
                                                    stroke={lm.color} strokeWidth="1.5"
                                                    strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
                                            </svg>
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

// ─── DS Atomic — Component portability across products ───────────────────────

function DsAtomicSection({ data }: { data: any }) {
    const [ref, visible] = useInView(0.05);
    const [tick, setTick] = useState(0);
    const hScrollRef = useRef<HTMLDivElement>(null);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [containerW, setContainerW] = useState(0);
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

    // Live tick — drives all animated values
    useEffect(() => {
        const id = setInterval(() => setTick(n => n + 1), 2200);
        return () => clearInterval(id);
    }, []);

    const tx = 'background 0.35s, color 0.35s, border-color 0.35s, box-shadow 0.35s, transform 0.2s';

    // Invitrace palette (single product — showcasing card states)
    const IV_BODY  = '"Space Grotesk", system-ui, sans-serif';
    const IV_TITLE = '"Instrument Serif", Georgia, serif';
    const IV = {
        bg: '#FFFFFF', surface: '#F4F4F5', border: '#E4E4E7',
        brand: '#059669', brandFg: '#FFFFFF', avatarBg: '#ECFDF5',
        text: '#09090B', muted: '#71717A', iconBg: '#F0FDF4',
    };

    type CardState = {
        id: string; colLabel: string; tabLabel: string;
        statusText: string; statusBg: string; statusColor: string;
        cta1: string; cta2: string;
        accentBorder?: string; cardBg?: string; dimmed?: boolean;
        ctaBg?: string; shadow?: string;
        liveStatus?: () => string;
    };

    const CARD_STATES: CardState[] = [
        {
            id: 'upcoming', colLabel: '01 — Upcoming', tabLabel: 'Upcoming',
            statusText: 'Tomorrow · 9:00 AM', statusBg: '#ECFDF5', statusColor: '#059669',
            accentBorder: '#05966950',
            cta1: 'Confirm Appointment', cta2: 'Reschedule',
        },
        {
            id: 'in-session', colLabel: '02 — In Session', tabLabel: 'In Session',
            statusText: '● In Session', statusBg: '#DCFCE7', statusColor: '#16A34A',
            accentBorder: '#059669', shadow: `0 0 0 3px #05966920`,
            cta1: 'Open Notes', cta2: 'End Session',
            liveStatus: () => tick % 2 === 0 ? '● In Session' : '○ In Session',
        },
        {
            id: 'completed', colLabel: '03 — Completed', tabLabel: 'Completed',
            statusText: 'Completed · Apr 1', statusBg: '#F4F4F5', statusColor: '#71717A',
            accentBorder: '#E4E4E7', dimmed: true,
            cta1: 'View Summary', cta2: 'Book Follow-up',
            ctaBg: '#71717A',
        },
        {
            id: 'cancelled', colLabel: '04 — Cancelled', tabLabel: 'Cancelled',
            statusText: 'Cancelled', statusBg: '#FEF2F2', statusColor: '#EF4444',
            accentBorder: '#EF444430', cardBg: '#FFFAFA',
            cta1: 'Rebook', cta2: 'Dismiss',
            ctaBg: '#EF4444',
        },
        {
            id: 'urgent', colLabel: '05 — Urgent', tabLabel: 'Urgent',
            statusText: '⚠ Urgent Review', statusBg: '#FFF7ED', statusColor: '#DC2626',
            accentBorder: '#DC2626', shadow: `0 0 0 2px #DC262630`,
            cta1: 'Review Now', cta2: 'Delegate',
            ctaBg: '#DC2626',
            liveStatus: () => tick % 2 === 0 ? '⚠ Urgent Review' : '⚠ Urgent Review',
        },
    ];

    const STATE_COLORS = ['#A78BFA', '#34D399', '#94A3B8', '#F87171', '#FB923C'];

    const COL_WIDTHS = [360, 360, 360, 360, 360];
    const COL_GAP = 14;
    const PAD_LEFT = 40;
    // Cumulative start positions (in scroll-content coordinates, after paddingLeft)
    const colStarts = COL_WIDTHS.reduce<number[]>((acc, _w, i) => {
        acc.push(i === 0 ? 0 : acc[i - 1] + COL_WIDTHS[i - 1] + COL_GAP);
        return acc;
    }, []);
    const colCenters = COL_WIDTHS.map((w, i) => PAD_LEFT + colStarts[i] + w / 2);

    useEffect(() => {
        const el = hScrollRef.current;
        if (!el) return;
        const onScroll = () => setScrollLeft(el.scrollLeft);
        const onWheel = (e: WheelEvent) => {
            if (el.scrollWidth > el.clientWidth) {
                e.preventDefault();
                el.scrollLeft += e.deltaY + e.deltaX;
            }
        };
        el.addEventListener('scroll', onScroll, { passive: true });
        el.addEventListener('wheel', onWheel, { passive: false });
        const ro = new ResizeObserver(() => setContainerW(el.clientWidth));
        ro.observe(el);
        setContainerW(el.clientWidth);
        return () => {
            el.removeEventListener('scroll', onScroll);
            el.removeEventListener('wheel', onWheel);
            ro.disconnect();
        };
    }, []);

    const getColStyle = (colIndex: number): React.CSSProperties => {
        if (containerW === 0) return {};
        const viewCenter = scrollLeft + containerW / 2;
        const offset = (colCenters[colIndex] - viewCenter) / containerW;
        const abs = Math.abs(offset);
        const scale = Math.max(0.88, 1 - abs * 0.24);
        const opacity = Math.max(0.4, 1 - abs * 0.72);
        const translateY = offset * offset * 20;
        return {
            transform: `scale(${scale.toFixed(4)}) translateY(${translateY.toFixed(2)}px)`,
            opacity,
            transition: `transform 0.07s linear, opacity 0.07s linear, ${tx}`,
        };
    };

    const activeColIdx = containerW > 0
        ? colCenters.reduce((best, center, i) => {
            const viewCenter = scrollLeft + containerW / 2;
            return Math.abs(center - viewCenter) < Math.abs(colCenters[best] - viewCenter) ? i : best;
        }, 0)
        : 0;

    const renderStateCard = (s: CardState) => {
        const statusText = s.liveStatus ? s.liveStatus() : s.statusText;
        const cardBrand = s.ctaBg ?? IV.brand;
        const isSession = s.id === 'in-session';
        const isUrgent = s.id === 'urgent';
        return (
            <div style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.10)', fontFamily: IV_BODY }}>
                {/* App bar */}
                <div style={{ padding: '9px 14px', background: IV.surface, borderBottom: `1px solid ${IV.border}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: IV.brand, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '8px', fontWeight: 800, color: IV.brandFg }}>IV</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: IV.text }}>Invitrace Health</span>
                    <div style={{ marginLeft: 'auto', display: 'flex', gap: 4 }}>
                        {[0,1,2].map(d => <div key={d} style={{ width: 4, height: 4, borderRadius: '50%', background: IV.muted, opacity: 0.35 }} />)}
                    </div>
                </div>
                {/* App body */}
                <div style={{ display: 'flex', background: IV.bg }}>
                    {/* Sidebar */}
                    <div style={{ width: 88, background: IV.surface, borderRight: `1px solid ${IV.border}`, padding: '12px 7px', flexShrink: 0 }}>
                        <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: IV.muted, marginBottom: 8, paddingLeft: 5 }}>Menu</div>
                        {(['Dashboard', 'Appointments', 'Patients', 'Reports'] as const).map(item => {
                            const active = item === 'Appointments';
                            return (
                                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 6px', borderRadius: 6, marginBottom: 2, background: active ? IV.avatarBg : 'transparent' }}>
                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: active ? IV.brand : IV.border, flexShrink: 0 }} />
                                    <span style={{ fontSize: '9px', fontWeight: active ? 600 : 400, color: active ? IV.brand : IV.text }}>{item}</span>
                                </div>
                            );
                        })}
                    </div>
                    {/* Main */}
                    <div style={{ flex: 1, padding: '14px 15px', minHeight: 500, overflowY: 'auto' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: IV.text, marginBottom: 2, fontFamily: IV_TITLE }}>Appointments</div>
                        <div style={{ fontSize: '10px', color: IV.muted, marginBottom: 14 }}>Monday, Apr 1 · 3 scheduled</div>
                        {/* Other dimmed rows */}
                        {[{ init: 'JK', name: 'James K.', time: '11:00 AM' }, { init: 'AL', name: 'Anna L.', time: '2:00 PM' }].map(p => (
                            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', borderRadius: 9, border: `1px solid ${IV.border}`, marginBottom: 7, opacity: 0.4, background: IV.bg }}>
                                <div style={{ width: 26, height: 26, borderRadius: '50%', background: IV.avatarBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: '8px', fontWeight: 700, color: IV.brand }}>{p.init}</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '10px', fontWeight: 500, color: IV.text }}>{p.name}</div>
                                    <div style={{ fontSize: '9px', color: IV.muted }}>{p.time}</div>
                                </div>
                                <span style={{ background: IV.avatarBg, color: IV.brand, borderRadius: 20, padding: '2px 7px', fontSize: '8px', fontWeight: 600 }}>Upcoming</span>
                            </div>
                        ))}
                        {/* Featured card */}
                        <div style={{
                            background: s.cardBg ?? IV.bg,
                            border: `1.5px solid ${s.accentBorder ?? IV.brand + '55'}`,
                            borderRadius: 13,
                            opacity: s.dimmed ? 0.72 : 1,
                            boxShadow: s.shadow ?? '0 2px 14px rgba(0,0,0,0.07)',
                            transition: tx,
                        }}>
                            {/* Card avatar + name + status */}
                            <div style={{ padding: '14px 15px 12px', borderBottom: `1px solid ${IV.border}` }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                                    <div style={{ width: 38, height: 38, borderRadius: 10, background: IV.avatarBg, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${IV.border}` }}>
                                        <span style={{ fontSize: '10px', fontWeight: 700, color: IV.brand }}>SC</span>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700, color: IV.text, lineHeight: 1.25, fontFamily: IV_TITLE, marginBottom: 2 }}>Dr. Sarah Chen</div>
                                        <div style={{ fontSize: '10px', color: IV.muted }}>Cardiologist · MUSC Health</div>
                                    </div>
                                    <span style={{
                                        background: s.statusBg, color: s.statusColor,
                                        borderRadius: 20, padding: '3px 9px', fontSize: '9px', fontWeight: 700,
                                        flexShrink: 0, whiteSpace: 'nowrap',
                                        animation: (isSession || isUrgent) ? 'ds-live-blink 1.4s ease-in-out infinite' : 'none',
                                    }}>
                                        {statusText}
                                    </span>
                                </div>
                            </div>
                            {/* Date + location */}
                            <div style={{ padding: '11px 15px', borderBottom: `1px solid ${IV.border}` }}>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 7, background: IV.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="11" height="11" viewBox="0 0 13 13" fill="none">
                                            <rect x="1" y="2" width="11" height="10" rx="2" stroke={IV.brand} strokeWidth="1.3"/>
                                            <line x1="4" y1="1" x2="4" y2="3.5" stroke={IV.brand} strokeWidth="1.3" strokeLinecap="round"/>
                                            <line x1="9" y1="1" x2="9" y2="3.5" stroke={IV.brand} strokeWidth="1.3" strokeLinecap="round"/>
                                            <line x1="1" y1="5.5" x2="12" y2="5.5" stroke={IV.brand} strokeWidth="1.3"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '11px', fontWeight: 600, color: IV.text }}>Tomorrow, Apr 1</div>
                                        <div style={{ fontSize: '10px', color: IV.muted }}>9:00 AM · 30 min</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <div style={{ width: 24, height: 24, borderRadius: 7, background: IV.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <svg width="9" height="12" viewBox="0 0 11 14" fill="none">
                                            <path d="M5.5 1C3.01 1 1 3.01 1 5.5C1 8.73 5.5 13 5.5 13C5.5 13 10 8.73 10 5.5C10 3.01 7.99 1 5.5 1Z" stroke={IV.brand} strokeWidth="1.3"/>
                                            <circle cx="5.5" cy="5.5" r="1.5" stroke={IV.brand} strokeWidth="1.3"/>
                                        </svg>
                                    </div>
                                    <div style={{ fontSize: '11px', fontWeight: 500, color: IV.text }}>Video Consultation</div>
                                </div>
                            </div>
                            {/* CTAs */}
                            <div style={{ padding: '10px 15px', display: 'flex', gap: 7 }}>
                                <button style={{ flex: 1, background: cardBrand, color: IV.brandFg, border: 'none', borderRadius: 8, padding: '9px 0', fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: IV_BODY }}>{s.cta1}</button>
                                <button style={{ flex: 1, background: 'transparent', color: IV.text, border: `1.5px solid ${IV.border}`, borderRadius: 8, padding: '9px 0', fontSize: '11px', fontWeight: 400, cursor: 'pointer', fontFamily: IV_BODY, opacity: s.dimmed ? 0.5 : 0.75 }}>{s.cta2}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <section ref={ref} style={{ padding: '80px 0 80px', margin: '0 -40px' }}>
            {/* Header + state tab selector */}
            <div style={{
                marginBottom: 32, paddingLeft: 40, paddingRight: 40,
                opacity: visible ? 1 : 0, transition: `opacity 0.5s ${ease}`,
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 24 }}>
                    <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--muted-foreground)', marginBottom: 10 }}>
                            {data.eyebrow}
                        </div>
                        <h2 style={{ fontSize: 'var(--modal-heading)', fontWeight: 800, marginBottom: 8, color: 'var(--foreground)', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
                            {data.headline}
                        </h2>
                        <p style={{ fontSize: 'var(--modal-body)', color: 'var(--muted-foreground)', maxWidth: 480, lineHeight: 1.65 }}>
                            {data.subtitle}
                        </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', border: '1px dashed var(--border)', borderRadius: 20, flexShrink: 0 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#059669' }} />
                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--foreground)', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>AppointmentCard · 5 states</span>
                    </div>
                </div>
                {/* State tab bar */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {CARD_STATES.map((s, i) => {
                        const active = activeColIdx === i;
                        return (
                            <button
                                key={s.id}
                                onClick={() => {
                                    const el = hScrollRef.current;
                                    if (!el) return;
                                    const target = colCenters[i] - el.clientWidth / 2;
                                    el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
                                }}
                                style={{
                                    padding: '7px 16px', borderRadius: 20, cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                                    background: active ? STATE_COLORS[i] : 'transparent',
                                    color: active ? '#fff' : 'var(--muted-foreground)',
                                    border: `1.5px solid ${active ? STATE_COLORS[i] : 'var(--border)'}`,
                                    transition: 'all 0.22s cubic-bezier(0.16,1,0.3,1)',
                                }}
                            >
                                {s.tabLabel}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 5-state horizontal scroll */}
            <div
                ref={hScrollRef}
                className="ds-atomic-scroll"
                style={{
                    display: 'flex', gap: COL_GAP, overflowX: 'auto',
                    paddingLeft: PAD_LEFT, paddingRight: PAD_LEFT,
                    paddingBottom: 28, paddingTop: 10,
                    scrollSnapType: 'x proximity',
                    opacity: visible ? 1 : 0,
                    transition: `opacity 0.65s 0.18s ${ease}`,
                    alignItems: 'flex-start',
                }}
            >
                {CARD_STATES.map((s, i) => (
                    <div key={s.id} style={{ flexShrink: 0, width: 360, scrollSnapAlign: 'start', ...getColStyle(i) }}>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: STATE_COLORS[i], marginBottom: 10 }}>
                            {s.colLabel}
                        </div>
                        {renderStateCard(s)}
                    </div>
                ))}
            </div>

            {/* Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 4 }}>
                {CARD_STATES.map((s, i) => (
                    <div
                        key={i}
                        title={s.tabLabel}
                        onClick={() => {
                            const el = hScrollRef.current;
                            if (!el) return;
                            const target = colCenters[i] - el.clientWidth / 2;
                            el.scrollTo({ left: Math.max(0, target), behavior: 'smooth' });
                        }}
                        style={{
                            width: activeColIdx === i ? 22 : 7, height: 7, borderRadius: 4,
                            background: activeColIdx === i ? STATE_COLORS[i] : 'var(--border)',
                            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                            cursor: 'pointer', flexShrink: 0,
                        }}
                    />
                ))}
            </div>
        </section>
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
        case 'robo_demo': return <RoboDemoSection data={section.data} />;
        case 'ds_tokens': return <DsTokensSection data={section.data} />;
        case 'ds_atomic': return <DsAtomicSection data={section.data} />;
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
                    <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                        Next project
                    </div>
                </div>
                <div style={{ position: 'absolute', bottom: 24, left: 28, right: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                        <div style={{ fontSize: 25, fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 4 }}>
                            {next.title}
                        </div>
                        <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.03em' }}>
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
                        fontSize: 16, color: 'var(--muted-foreground)',
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
                        <span style={{ fontSize: 'var(--text-base)', fontWeight: 500, lineHeight: 1 }}>Nat</span>
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
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '6px 0', fontSize: '16px', color: 'var(--muted-foreground)', marginBottom: 16, fontFamily: 'inherit' }} onMouseEnter={e => e.currentTarget.style.color = 'var(--foreground)'} onMouseLeave={e => e.currentTarget.style.color = 'var(--muted-foreground)'}>Home</button>
                    {sidebarSections.map(s => {
                        const isActive = activeSection === s.id;
                        return (
                            <button key={s.id} onClick={() => sectionRefs.current[s.id]?.scrollIntoView({ behavior: 'smooth', block: 'center' })} style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: '5px 0 5px 10px', fontSize: '16px', fontWeight: isActive ? 600 : 400, color: isActive ? 'var(--foreground)' : 'var(--muted-foreground)', transition: 'color 0.25s, border-color 0.25s', lineHeight: 1.5, fontFamily: 'inherit', borderLeft: `2px solid ${isActive ? (data?.meta.cover_color ?? 'var(--foreground)') : 'transparent'}`, marginLeft: -2 }} onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = 'var(--foreground)'; }} onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)'; }}>
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

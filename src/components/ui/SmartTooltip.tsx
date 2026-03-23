import React, { useRef, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

type Placement = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export interface SmartTooltipProps {
    content: React.ReactNode;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any>;
    /** ms before tooltip appears — default 350 feels intentional, not accidental */
    delay?: number;
    /** wide mode: multi-line card with max-width 260px — for structured content */
    wide?: boolean;
}

const OFFSET   = 14;
const EST_W    = 190;
const EST_W_WD = 260;  // wide mode edge detection
const EST_H    = 58;
const EST_H_WD = 90;   // wide mode estimated height

function choosePlacement(x: number, y: number, wide = false): Placement {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = wide ? EST_W_WD : EST_W;
    const h = wide ? EST_H_WD : EST_H;
    const goLeft  = x + w + OFFSET > vw - 16;
    const goAbove = y + h + OFFSET > vh - 16;
    if (goAbove && goLeft)  return 'top-left';
    if (goAbove)            return 'top-right';
    if (goLeft)             return 'bottom-left';
    return 'bottom-right';
}

interface BubbleState {
    x: number;
    y: number;
    placement: Placement;
    visible: boolean;
}

function TooltipBubble({ content, state, wide }: { content: React.ReactNode; state: BubbleState; wide?: boolean }) {
    const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';
    const { x, y, placement, visible } = state;
    const isAbove = placement.startsWith('top');
    const isLeft  = placement.endsWith('left');
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Tooltip corner nearest to cursor aligns with cursor + OFFSET
    const pos: React.CSSProperties = { position: 'fixed', zIndex: 99999, pointerEvents: 'none' };
    if (isAbove) pos.bottom = vh - y + OFFSET;
    else         pos.top    = y  + OFFSET;
    if (isLeft)  pos.right  = vw - x + OFFSET;
    else         pos.left   = x  + OFFSET;

    // Scale origin = corner nearest cursor (where the tail is)
    const origin =
        placement === 'bottom-right' ? 'top left'     :
        placement === 'bottom-left'  ? 'top right'    :
        placement === 'top-right'    ? 'bottom left'  :
                                       'bottom right';

    const enterY = isAbove ? '5px' : '-5px';


    return (
        <div style={{
            ...pos,
            opacity: visible ? 1 : 0,
            transform: visible
                ? 'scale(1) translateY(0)'
                : `scale(0.84) translateY(${enterY})`,
            transformOrigin: origin,
            transition: `opacity 0.16s ${ease}, transform 0.2s ${ease}`,
            willChange: 'opacity, transform',
        }}>
            <div style={{ position: 'relative' }}>
                <div style={{
                    background: 'var(--foreground)',
                    color: 'var(--background)',
                    borderRadius: wide ? 12 : 'var(--radius)',
                    padding: wide ? '12px 16px' : '10px 16px',
                    fontSize: 'var(--text-base)',
                    fontFamily: 'var(--font-sans)',
                    lineHeight: 1.55,
                    whiteSpace: wide ? 'normal' : 'nowrap',
                    maxWidth: wide ? 260 : undefined,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18), 0 2px 6px rgba(0,0,0,0.1)',
                }}>
                    {content}
                </div>
            </div>

        </div>
    );
}

export function SmartTooltip({ content, children, delay = 350, wide = false }: SmartTooltipProps) {
    const timerRef  = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const cursorRef = useRef({ x: 0, y: 0 }); // tracks latest cursor pos while waiting for delay
    const [mounted, setMounted]   = useState(false);
    const [state, setState] = useState<BubbleState>({
        x: 0, y: 0, placement: 'bottom-right', visible: false,
    });

    const show = useCallback((x: number, y: number) => {
        cursorRef.current = { x, y };
        if (timerRef.current !== undefined) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            const { x: cx, y: cy } = cursorRef.current;
            setMounted(true);
            setState({ x: cx, y: cy, placement: choosePlacement(cx, cy, wide), visible: true });
        }, delay);
    }, [delay]);

    // While delay is pending, keep updating cursor pos so it fires at latest position
    const updatePending = useCallback((x: number, y: number) => {
        cursorRef.current = { x, y };
    }, []);

    const move = useCallback((x: number, y: number) => {
        cursorRef.current = { x, y };
        setState(s => s.visible
            ? { ...s, x, y, placement: choosePlacement(x, y, wide) }
            : s
        );
    }, []);

    const hide = useCallback(() => {
        if (timerRef.current !== undefined) clearTimeout(timerRef.current);
        setState(s => ({ ...s, visible: false }));
    }, []);

    useEffect(() => () => {
        if (timerRef.current !== undefined) clearTimeout(timerRef.current);
    }, []);

    const child = React.cloneElement(children, {
        onMouseEnter: (e: React.MouseEvent) => {
            children.props.onMouseEnter?.(e);
            show(e.clientX, e.clientY);
        },
        onMouseMove: (e: React.MouseEvent) => {
            children.props.onMouseMove?.(e);
            if (state.visible) move(e.clientX, e.clientY);
            else updatePending(e.clientX, e.clientY);
        },
        onMouseLeave: (e: React.MouseEvent) => {
            children.props.onMouseLeave?.(e);
            hide();
        },
    });

    return (
        <>
            {child}
            {mounted && createPortal(
                <TooltipBubble content={content} state={state} wide={wide} />,
                document.body
            )}
        </>
    );
}

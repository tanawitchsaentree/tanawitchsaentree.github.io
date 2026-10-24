// One icon set for the Invitrace surface: 24px grid, 1.5px stroke, round caps and joins,
// optically centred (the alert and lock glyphs sit 0.5px low to balance their weight).
import type { ReactNode, SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }
// The stroke is scaled so it renders at 1.5 CSS px whatever the icon size.
const Svg = ({ size = 14, children, ...rest }: P & { children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={(1.5 * 24) / size}
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...rest}>{children}</svg>
)

export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5.5v13M5.5 12h13" /></Svg>
export const IconAlert = (p: P) => <Svg {...p}><path d="M12 3.75l9 15.75H3z" /><path d="M12 10v4" /><path d="M12 17h.01" strokeWidth={(2.5 * 24) / (p.size ?? 14)} /></Svg>
export const IconCross = (p: P) => <Svg {...p}><path d="M7.5 7.5l9 9M16.5 7.5l-9 9" /></Svg>
export const IconErr = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.25" /><path d="M9.5 9.5l5 5M14.5 9.5l-5 5" /></Svg>
export const IconCheck = (p: P) => <Svg {...p}><path d="M6 12.5l4 4 8-9" /></Svg>
export const IconLock = (p: P) => <Svg {...p}><rect x="5.5" y="11" width="13" height="9" rx="2" /><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" /></Svg>
export const IconChevron = (p: P) => <Svg {...p}><path d="M9.5 6.5l5.5 5.5-5.5 5.5" /></Svg>
export const IconLink = (p: P) => <Svg {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></Svg>

import Link from 'next/link'
import { cn } from '@/lib/cn'

export function BackButton({ className }: { className?: string }) {
  return (
    <Link
      href="/#work"
      aria-label="Back to selected work"
      className={cn(
        'inline-flex items-center gap-2 no-underline',
        'font-mono text-base',
        'text-[var(--fg-muted)] hover:text-[var(--fg)]',
        'transition-colors duration-[var(--duration-fast)]',
        'p-4 -ml-4',
        className,
      )}
    >
      <span aria-hidden="true">←</span> Selected work
    </Link>
  )
}

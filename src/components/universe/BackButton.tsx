'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/cn'

export function BackButton({ className }: { className?: string }) {
  const router = useRouter()

  const handleBack = useCallback(() => {
    // router.back() restores the SPA state (fold open) from bfcache.
    // Fallback (no history, cross-browser nav, some mobile browsers):
    // navigate to /?view=work — HomeClient reads that param on mount
    // and opens the work fold directly, so this never lands on a
    // dead-end collapsed bio.
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/?view=work')
    }
  }, [router])

  return (
    <button
      type="button"
      onClick={handleBack}
      aria-label="Back"
      className={cn(
        'inline-flex items-center',
        'font-mono text-base',
        'text-[var(--fg-muted)] hover:text-[var(--fg)]',
        'transition-colors duration-[var(--duration-fast)]',
        'cursor-pointer border-none bg-transparent',
        'p-4 -ml-4',
        className,
      )}
    >
      ←
    </button>
  )
}

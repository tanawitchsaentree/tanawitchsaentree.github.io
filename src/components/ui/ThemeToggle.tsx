'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'

export function ThemeToggle({ className }: { className?: string }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  function toggle() {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {}

    // View Transitions API cross-fade between themes
    if ((document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition) {
      (document as Document & { startViewTransition: (cb: () => void) => void })
        .startViewTransition(() => {})
    }
  }

  // Render a placeholder on SSR to avoid hydration mismatch
  if (!mounted) {
    return (
      <div
        className={cn('w-8 h-8 rounded-full', className)}
        aria-hidden="true"
      />
    )
  }

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center',
        'border border-[var(--border)] bg-[var(--bg-elevated)]',
        'text-[var(--fg-muted)] hover:text-[var(--fg)]',
        'transition-colors duration-[var(--duration-fast)]',
        'focus-visible:outline-2 focus-visible:outline-[var(--fg)] focus-visible:outline-offset-2',
        className
      )}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  )
}

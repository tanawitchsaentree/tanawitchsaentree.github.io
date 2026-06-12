'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { DecodeText } from '@/components/ui/DecodeText'

const EMAIL = 'tanawitch.saentree@gmail.com'

// TODO: Verify availability status with Nat before publishing
const AVAILABILITY = 'Open to Senior / Staff roles · Q3 2026'

const RESUME_PATH = '/tanawitch-saentree-resume.pdf'

const SOCIAL = [
  { label: 'LinkedIn', href: 'https://linkedin.com/in/tanawitchsaentree' },
  { label: 'Behance',  href: 'https://behance.net/tanawitchsaentree' },
  { label: 'GitHub',   href: 'https://github.com/tanawitchsaentree' },
] as const

export function Contact() {
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: open mailto
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="w-full text-center"
    >
      <div className="flex flex-col items-center gap-8">
        <h2
          id="contact-heading"
          className={cn(
            'font-display font-medium',
            'text-[var(--type-base)] leading-[1.35] tracking-[0.005em]',
            'text-[var(--fg)]'
          )}
        >
          <DecodeText text="Let’s work together." />
        </h2>

        {/* Email copy-to-clipboard */}
        <button
          type="button"
          onClick={copyEmail}
          aria-label={copied ? 'Email address copied' : `Copy email address: ${EMAIL}`}
          className={cn(
            'group inline-flex items-baseline gap-2',
            'text-[var(--type-sm)] text-[var(--fg)]',
            'no-underline hover:text-[var(--fg-muted)]',
            'transition-colors duration-[var(--duration-fast)] cursor-pointer'
          )}
        >
          <span className="font-mono">{EMAIL}</span>
          <span
            className={cn(
              'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
              'tracking-[0.1em] uppercase',
              'group-hover:text-[var(--fg-muted)]'
            )}
            aria-live="polite"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </span>
        </button>

        {/* Resume download + social links */}
        <ul className="flex flex-wrap justify-center gap-6 list-none m-0 p-0">
          <li>
            <a
              href={RESUME_PATH}
              download="tanawitch-saentree-resume.pdf"
              aria-label="Download resume PDF"
              className={cn(
                'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em]',
                'no-underline transition-colors duration-[var(--duration-fast)]',
                'text-[var(--fg)] border-b border-[var(--accent)]',
                'hover:text-[var(--fg-muted)]'
              )}
            >
              Resume ↓
            </a>
          </li>
          {SOCIAL.map(link => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-muted)]',
                  'no-underline hover:text-[var(--fg)]',
                  'transition-colors duration-[var(--duration-fast)]'
                )}
              >
                {link.label}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Availability */}
        <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
          {AVAILABILITY}
        </p>

        {/* Colophon */}
        <div className="mt-8 flex flex-col items-center gap-1.5">
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
            Set in JetBrains Mono. Built with Next.js. Hosted on GitHub Pages.
          </p>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
            © {new Date().getFullYear()} Tanawitch Saentree
          </p>
        </div>
      </div>
    </section>
  )
}

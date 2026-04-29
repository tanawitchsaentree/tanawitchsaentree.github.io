'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'

const EMAIL = 'tanawitch.saentree@gmail.com'

// TODO: Verify availability status with Nat before publishing
const AVAILABILITY = 'Open to Senior / Staff roles · Q3 2026'

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
      className="py-24 md:py-32 px-6 md:px-12 lg:px-20 xl:px-[7.5rem] border-t border-[var(--border)]"
    >
      <div className="max-w-[80rem]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-8">
            <h2
              id="contact-heading"
              className={cn(
                'font-display font-normal',
                'text-[var(--type-3xl)] leading-[1.1] tracking-[-0.028em]',
                'text-[var(--fg)] mb-8'
              )}
            >
              Let&apos;s work together.
            </h2>

            {/* Email copy-to-clipboard */}
            <button
              type="button"
              onClick={copyEmail}
              aria-label={copied ? 'Email address copied' : `Copy email address: ${EMAIL}`}
              className={cn(
                'group flex items-baseline gap-3',
                'text-[var(--type-lg)] text-[var(--fg)]',
                'no-underline hover:text-[var(--fg-muted)]',
                'transition-colors duration-[var(--duration-fast)]',
                'mb-10',
                'cursor-pointer'
              )}
            >
              <span className="font-mono tracking-tight">{EMAIL}</span>
              <span
                className={cn(
                  'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
                  'tracking-widest uppercase',
                  'transition-opacity duration-[var(--duration-fast)]',
                  'group-hover:text-[var(--fg-muted)]'
                )}
                aria-live="polite"
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </span>
            </button>

            {/* Social links */}
            <ul className="flex flex-wrap gap-6 list-none m-0 p-0">
              {SOCIAL.map(link => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'font-mono text-[var(--type-sm)] text-[var(--fg-muted)]',
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
          </div>

          {/* Availability */}
          <aside className="md:col-span-4" aria-label="Availability status">
            <p
              className={cn(
                'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
                'tracking-widest uppercase mb-3'
              )}
            >
              Availability
            </p>
            <p className="text-[var(--type-sm)] text-[var(--fg-muted)] leading-[1.6]">
              {AVAILABILITY}
            </p>
          </aside>
        </div>

        {/* Colophon */}
        <div
          className={cn(
            'mt-16 pt-8 border-t border-[var(--border)]',
            'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'
          )}
        >
          <p
            className={cn(
              'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
              'tracking-wide'
            )}
          >
            Set in Fraunces and Inter. Built with Next.js. Hosted on GitHub Pages.
          </p>
          <p
            className={cn(
              'font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]',
              'tracking-wide'
            )}
          >
            © {new Date().getFullYear()} Tanawitch Saentree
          </p>
        </div>
      </div>
    </section>
  )
}

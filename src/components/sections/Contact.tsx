'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { DecodeText } from '@/components/ui/DecodeText'

const EMAIL        = 'tanawitch.saentree@gmail.com'
const AVAILABILITY = 'Open to Senior / Staff roles · Q3 2026'
const RESUME_PATH  = '/tanawitch-saentree-resume.pdf'

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
      window.location.href = `mailto:${EMAIL}`
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="w-full text-center">

      <div className="flex flex-col items-center gap-10">

        {/* Heading + availability — tightest cluster */}
        <div className="flex flex-col items-center gap-4">
          <h2
            id="contact-heading"
            className="font-display font-normal text-[var(--type-2xl)] leading-[1.2] tracking-[-0.01em] text-[var(--fg)]"
          >
            <DecodeText text="Let's work together." />
          </h2>
          <p className="font-mono text-[var(--type-xs)] uppercase tracking-[0.14em] text-[var(--fg-subtle)]">
            {AVAILABILITY}
          </p>
        </div>

        {/* Email — primary action */}
        <button
          type="button"
          onClick={copyEmail}
          aria-label={copied ? 'Email address copied' : `Copy email: ${EMAIL}`}
          className={cn(
            'group inline-flex items-baseline gap-2',
            'font-mono text-[var(--type-sm)] text-[var(--fg)]',
            'no-underline cursor-pointer bg-transparent border-none p-0',
            'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]',
            'hover:text-[var(--fg-muted)]',
          )}
        >
          <span>{EMAIL}</span>
          <span
            className="text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-subtle)] group-hover:text-[var(--fg-muted)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
            aria-live="polite"
          >
            {copied ? 'Copied ✓' : 'Copy'}
          </span>
        </button>

        {/* Secondary links */}
        <ul className="flex items-center justify-center flex-wrap gap-6 list-none m-0 p-0">
          <li>
            <a
              href={RESUME_PATH}
              download="tanawitch-saentree-resume.pdf"
              className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg)] border-b border-[var(--accent)] no-underline hover:text-[var(--fg-muted)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
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
                className="font-mono text-[var(--type-xs)] uppercase tracking-[0.1em] text-[var(--fg-muted)] no-underline hover:text-[var(--fg)] transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-quick)]"
              >
                {link.label}
                <span className="sr-only"> (opens in new tab)</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Colophon */}
        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
            Set in Inter · Built with Next.js · GitHub Pages
          </p>
          <p className="font-mono text-[var(--type-xs)] text-[var(--fg-subtle)]">
            © {new Date().getFullYear()} Tanawitch Saentree
          </p>
        </div>

      </div>
    </section>
  )
}

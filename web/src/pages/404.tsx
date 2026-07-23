import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Home, Music, AudioLines, BookOpen, Hash } from 'lucide-react'

interface IDestination {
  href: string
  label: string
  hint: string
  icon: React.ReactNode
}

// The five surfaces worth offering someone who has landed nowhere. Deliberately the browse roots
// and not a deep link: a reader who mistyped a URL has no context we can guess at, so the kindest
// thing is to hand them the front doors rather than a clever guess.
const DESTINATIONS: IDestination[] = [
  { href: '/', label: 'Home', hint: 'Start over', icon: <Home size={18} /> },
  { href: '/songs', label: 'Songs', hint: 'The whole songbook', icon: <Music size={18} /> },
  { href: '/tracks', label: 'Tracks', hint: 'Every recording', icon: <AudioLines size={18} /> },
  { href: '/books', label: 'Books', hint: 'Songs by collection', icon: <BookOpen size={18} /> },
  { href: '/topics', label: 'Topics', hint: 'Songs by theme', icon: <Hash size={18} /> },
]

/**
 * Branded not-found page. Every destination uses next/link rather than a bare anchor: a real
 * document load would tear down the app-root PlayerProvider and cut off whatever is playing, and
 * arriving at a 404 is already annoying enough without also silencing the kīrtana.
 */
const NotFound: React.FC = () => (
  <>
    <Head>
      <title>Page not found — Gaudiya Kirtan</title>
      <meta name="robots" content="noindex" />
    </Head>

    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center md:py-24">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/sri-gaudiya-kirtan.svg" alt="Gaudiya Kirtan" className="brand-logo h-8" />

      <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-[var(--neutral)]">
        404 — not in the songbook
      </p>
      <h1 className="mt-3 text-3xl font-bold text-[var(--primary)]">This page has wandered off</h1>

      <p className="mt-5 text-[var(--neutral)]">
        We looked through every song, book and topic we have, and there is simply nothing at this
        address. Most likely the link picked up a stray character on its travels, or we moved
        something and forgot to leave a note — either way, the fault is ours and not yours.
      </p>
      <p className="mt-3 text-[var(--neutral)]">
        The good news is that everything else is exactly where you left it.
      </p>

      <div className="mt-10 grid w-full grid-cols-1 gap-3 text-left sm:grid-cols-2">
        {DESTINATIONS.map((destination) => (
          <Link
            key={destination.href}
            href={destination.href}
            className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background-offset)] px-4 py-3 transition-colors hover:border-[var(--highlight)]"
          >
            <span className="flex h-9 w-9 flex-none items-center justify-center rounded-lg bg-[var(--highlight)] text-[var(--on-highlight)]">
              {destination.icon}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-[var(--primary)]">
                {destination.label}
              </span>
              <span className="block truncate text-xs text-[var(--neutral)]">{destination.hint}</span>
            </span>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-sm text-[var(--neutral)]">
        Looking for one particular song? Press{' '}
        <kbd className="rounded border border-[var(--border)] bg-[var(--background)] px-1.5 py-0.5 text-[11px]">
          ⌘K
        </kbd>{' '}
        and search for it by name.
      </p>
    </div>
  </>
)

export default NotFound

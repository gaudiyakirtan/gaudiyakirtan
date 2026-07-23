import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, Music, AudioLines, BookOpen, Hash } from 'lucide-react'
import { resolvePath, type ISearchEntry } from '../services/urlResolver'

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
 * How long to wait on /search-index.json before giving up and showing the 404. The index is ~140 kB
 * and served from the same origin, so this is generous; the point is that a stalled request must
 * never leave a reader staring at a spinner where a page full of links would do.
 */
const RESOLVE_TIMEOUT_MS = 2500

type IResolveState = 'resolving' | 'redirecting' | 'not-found'

/**
 * Branded not-found page, with a client-side attempt to rescue the URL first.
 *
 * The site is a static export, so there is no server to answer /songs/n9 with a 301 — but the
 * information needed to do it is already shipped to the browser in /search-index.json, the same
 * file the command palette searches. Resolution therefore happens here, on mount, before any 404
 * copy is shown. See src/services/urlResolver.ts for the matching rules and their thresholds.
 *
 * Every destination below uses next/link rather than a bare anchor: a real document load would tear
 * down the app-root PlayerProvider and cut off whatever is playing, and arriving at a 404 is
 * already annoying enough without also silencing the kīrtana.
 */
const NotFound: React.FC = () => {
  const router = useRouter()
  const [state, setState] = useState<IResolveState>('resolving')

  useEffect(() => {
    let abandoned = false
    // Reading window.location rather than router.asPath: this page is also served as a static
    // 404.html for URLs the router never routed to, and the raw address is the only thing that is
    // reliably the one the reader actually typed.
    const pathname = window.location.pathname

    const giveUp = setTimeout(() => {
      if (!abandoned) setState('not-found')
    }, RESOLVE_TIMEOUT_MS)

    fetch('/search-index.json')
      .then((response) => response.json())
      .then((entries: ISearchEntry[]) => {
        if (abandoned) return
        const resolved = resolvePath(pathname, entries)
        if (!resolved) return setState('not-found')
        clearTimeout(giveUp)
        setState('redirecting')
        // replace, not push: the mistyped URL should not sit in the back stack, or "back" from the
        // song would bounce the reader straight into this page again.
        router.replace(resolved.href)
      })
      .catch(() => {
        if (!abandoned) setState('not-found')
      })

    return () => {
      abandoned = true
      clearTimeout(giveUp)
    }
  }, [router])

  return (
    <>
      <Head>
        <title>Page not found — Gaudiya Kirtan</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center md:py-24">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/sri-gaudiya-kirtan.svg" alt="Gaudiya Kirtan" className="brand-logo h-8" />

        {state !== 'not-found' ? (
          // Deliberately neutral and short-lived: for the many URLs that do resolve, telling
          // someone their page is missing and then immediately navigating away would be a lie
          // with a flash attached.
          <p className="mt-10 text-sm text-[var(--neutral)]" role="status" data-resolver-status>
            {state === 'redirecting' ? 'Found it — taking you there…' : 'Looking for that page…'}
          </p>
        ) : (
          <>
            <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-[var(--neutral)]">
              404 — not in the songbook
            </p>
            <h1 className="mt-3 text-3xl font-bold text-[var(--primary)]">
              This page has wandered off
            </h1>

            <p className="mt-5 text-[var(--neutral)]">
              We looked through every song, book and topic we have, and there is simply nothing at
              this address. Most likely the link picked up a stray character on its travels, or we
              moved something and forgot to leave a note — either way, the fault is ours and not
              yours.
            </p>
            <p className="mt-3 text-[var(--neutral)]">
              The good news is that everything else is exactly where you left it.
            </p>
          </>
        )}

        {/* Without scripting the resolver can never run, so the prerendered "looking for it…"
            status would hang there forever - swap it for the plain verdict instead. */}
        <noscript>
          <style>{'[data-resolver-status]{display:none}'}</style>
          <p className="mt-10 text-xs font-medium uppercase tracking-[0.2em] text-[var(--neutral)]">
            404 — this page has wandered off
          </p>
        </noscript>

        {/* The links stay mounted through every state - they are the whole point of the page, and
            a reader who arrives while the index is still loading should never see a bare spinner. */}
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
                <span className="block truncate text-xs text-[var(--neutral)]">
                  {destination.hint}
                </span>
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
}

export default NotFound

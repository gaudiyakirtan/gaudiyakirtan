import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Search, CornerDownLeft, Home, Music, User, Hash, BookOpen, Settings, Info, Mail,
  AudioLines, Type, Volume2, Tag as TagIcon, FileText, Mic2, ListMusic, ArrowLeft, X,
} from 'lucide-react'
import { buildDuet, searchDuet, type IDuetDoc } from '../services/duet'
import { NAV_ENTRIES } from '../services/urlResolver'
import { useSettings } from '../utils/SettingsContext'
import { lockScroll } from '../utils/bodyScrollLock'
import { searchViewportStyle } from '../utils/searchViewport'
import { useSearchViewport } from '../utils/useSearchViewport'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

type EntryType = 'page' | 'song' | 'book' | 'topic' | 'author' | 'tag' | 'reciter'
interface Entry {
  type: EntryType
  label: string
  subtitle?: string
  href: string
  /** Song uid, so typing a code (e.g. "A10") jumps to the song. */
  code?: string
  /** Title (or author name, on `author` rows) renderings by script code, non-Latin, so a row can
   *  display in the reader's listLanguage rather than always romanized. Latn is `label`; a missing
   *  script falls back to it. A song's author renderings are looked up from its `author` entry. */
  scripts?: Record<string, string>
  icon?: React.ReactNode
}

// Per-page icons, keyed by href. The page *list* itself lives in services/urlResolver (NAV_ENTRIES)
// so the palette and the URL rescuer search exactly the same set — they used to keep separate
// copies, and the resolver's shorter one is why /setings 404'd while ⌘K found Settings instantly.
const PAGE_ICON: Record<string, React.ReactNode> = {
  '/': <Home size={16} />,
  '/songs': <Music size={16} />,
  '/tracks': <ListMusic size={16} />,
  '/authors': <User size={16} />,
  '/topics': <Hash size={16} />,
  '/books': <BookOpen size={16} />,
  '/settings': <Settings size={16} />,
  '/about': <Info size={16} />,
  '/contact': <Mail size={16} />,
  '/resources/meters': <AudioLines size={16} />,
  '/resources/diacritics': <Type size={16} />,
  '/resources/pronunciation': <Volume2 size={16} />,
}
const PAGES: Entry[] = NAV_ENTRIES.map((e) => ({ ...e, icon: PAGE_ICON[e.href] }))

const TYPE_ICON: Record<EntryType, React.ReactNode> = {
  page: <FileText size={16} />,
  song: <Music size={16} />,
  book: <BookOpen size={16} />,
  topic: <Hash size={16} />,
  author: <User size={16} />,
  tag: <TagIcon size={16} />,
  reciter: <Mic2 size={16} />,
}
// Type priority for tie-breaking (nav/library entities surface above individual songs).
const TYPE_RANK: Record<EntryType, number> = { page: 7, book: 6, topic: 5, author: 4, reciter: 3, tag: 2, song: 1 }

/**
 * Universal command palette (docs/screens/search.md). Finds **everything**: pages/nav, songs,
 * books, topics, authors, and tags — each ranked by the shared offline fuzzy matcher and shown with
 * a type icon. Data entities are fetched once from /search-index.json (emitted at build).
 *
 * **One component, two presentations** (spec v9), chosen by media query alone — never by a
 * JavaScript width check, so the server-rendered markup is already the right shape:
 * - `≥ md` (768 px): the centered command-palette card over a dimmed backdrop, unchanged since v2.
 * - `< md`: a **full-screen search page** — edge to edge, no card, a back button instead of a
 *   backdrop to tap, and a results region that takes the leftover height and scrolls internally.
 *   Its height comes from `.gk-search-surface` (globals.css): `100dvh` refined by the measured
 *   visual viewport, because `dvh` does not shrink for the on-screen keyboard.
 */
/**
 * Below this Duet score a hit is a lone shared trigram, not a match worth showing. Duet only ever
 * returns docs that shared at least one gram, so this trims that long noisy tail; a real title or
 * content match clears it comfortably (a reranked title match scores in the low single digits).
 */
const SCORE_FLOOR = 0.35

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const router = useRouter()
  const { settings } = useSettings()
  const [entities, setEntities] = useState<Entry[] | null>(null)
  const [content, setContent] = useState<Record<string, string[]> | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const viewport = useSearchViewport(open)

  // Focus via the ref callback, not a timer: the input only exists while the surface is open, so
  // this runs exactly once per open — synchronously during commit, which keeps it inside the tap
  // that opened search. That is what makes iOS raise the keyboard; a setTimeout lands after the
  // gesture has ended and is ignored.
  const attachInput = useCallback((node: HTMLInputElement | null) => {
    inputRef.current = node
    node?.focus()
  }, [])

  useEffect(() => {
    if (!open || entities) return
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: Entry[]) => setEntities(data))
      .catch(() => setEntities([]))
  }, [open, entities])

  // Verse text is ~210 KB gzipped, so it loads SEPARATELY and in the background on first open —
  // title/entity search is live immediately off the 22 KB index, and content search lights up a
  // moment later when this lands (docs/screens/search.md v5). Nobody pays for it just to jump to a song.
  useEffect(() => {
    if (!open || content) return
    fetch('/search-content.json')
      .then((r) => r.json())
      .then((data: Record<string, string[]>) => setContent(data))
      .catch(() => setContent({}))
  }, [open, content])

  // Clear the query whenever the palette opens or closes, so it always starts fresh.
  useEffect(() => {
    setQuery('')
    setSelected(0)
  }, [open])

  // Lock the page behind the surface. The release is the effect's cleanup, so EVERY exit path —
  // close button, Escape, backdrop, tapping a result, a route change, an unmount mid-navigation —
  // goes through it; there is no path that can leak a locked page. The lock is reference-counted
  // and restores the previous inline value, so React's dev-mode double-invoke and the
  // `overflow-x: clip` body rule both survive it (see utils/bodyScrollLock).
  useEffect(() => {
    if (!open) return
    return lockScroll(document.body)
  }, [open])

  // Escape at the document, not on the panel: on the full-screen presentation focus can sit on the
  // back/clear button or a result row, and the key should close search from all of them.
  useEffect(() => {
    if (!open) return
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open, onClose])

  // A navigation that did not come from `go()` — a hardware/browser back button, or any other link
  // — must close search too, or the reader lands on a new page underneath an open search surface.
  useEffect(() => {
    if (!open) return
    router.events.on('routeChangeStart', onClose)
    return () => router.events.off('routeChangeStart', onClose)
  }, [open, onClose, router.events])

  const all = useMemo(() => [...PAGES, ...(entities ?? [])], [entities])

  // A song's author name in the reader's script is looked up from the `author` entries (which carry
  // `scripts`), keyed by the shared romanized name — so those renderings live once, not per song row.
  const authorScriptsByName = useMemo(() => {
    const m = new Map<string, Record<string, string>>()
    for (const e of all) if (e.type === 'author' && e.scripts) m.set(e.label, e.scripts)
    return m
  }, [all])

  // Display in the reader's chosen script, falling back to the romanized label — matching still runs
  // on the Latin label + a romanized query, so only what the reader SEES changes with listLanguage.
  const displayTitle = (e: Entry) => e.scripts?.[settings.listLanguage] ?? e.label
  const displayAuthor = (e: Entry) =>
    e.type === 'song'
      ? authorScriptsByName.get(e.subtitle ?? '')?.[settings.listLanguage] ?? e.subtitle
      : e.subtitle

  // Build the Duet index once per data change (not per keystroke). It rebuilds when the content
  // index arrives, upgrading title-only search into title+content in place.
  const index = useMemo(() => {
    const docs: IDuetDoc[] = all.map((e, ref) => ({
      ref,
      // A song's author (subtitle) and uid (code) are searchable title text; other entities carry
      // only their label (their subtitle is a count like "Book · 8 songs", not something to match).
      title: e.type === 'song' ? [e.label, e.subtitle ?? '', e.code ?? ''].filter(Boolean) : [e.label],
      content: e.type === 'song' && e.code ? content?.[e.code] ?? [] : [],
    }))
    return buildDuet(docs)
  }, [all, content])

  const results = useMemo(() => {
    const q = query.trim()
    if (!q) return []
    return searchDuet(index, q, 40)
      .filter((r) => r.score >= SCORE_FLOOR)
      // `line` is set when the CONTENT path won — the song matched on its verse text, not its title.
      .map((r) => ({ e: all[r.ref], s: r.score, line: r.line }))
      .sort((a, b) => b.s - a.s || TYPE_RANK[b.e.type] - TYPE_RANK[a.e.type] || a.e.label.localeCompare(b.e.label))
      .map((x) => ({ e: x.e, line: x.line }))
  }, [index, all, query])

  useEffect(() => setSelected(0), [query])

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  // Escape is handled by the document listener above; this covers list navigation only.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const p = results[selected]; if (p) go(p.e.href) }
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${selected}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  const activeId = results.length ? `search-result-${selected}` : undefined

  return (
    // The outer layer is the mobile surface AND the desktop backdrop. On a phone the panel covers
    // it completely, so `onClick={onClose}` is unreachable there (a full-screen search page has no
    // backdrop to dismiss — that is what the back button is for); on desktop it is the dimmed
    // backdrop and keeps its click-to-dismiss. Sizing lives in `.gk-search-surface`, which is why
    // there is no `top-0`/`h-*` utility here to fight with it.
    <div
      className="gk-search-surface fixed left-0 right-0 z-[60] flex flex-col bg-[var(--background)] md:bottom-0 md:flex-row md:items-start md:justify-center md:bg-black/50 md:px-4 md:pt-[12vh] md:backdrop-blur-sm"
      style={searchViewportStyle(viewport)}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        data-testid="search-panel"
        className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--background)] pt-[env(safe-area-inset-top)] md:h-auto md:max-w-xl md:flex-none md:rounded-2xl md:border md:border-[var(--border)] md:pt-0 md:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex flex-none items-center gap-2 border-b border-[var(--border)] px-2 md:gap-3 md:px-4">
          {/* Mobile: a back arrow, the convention for a full-screen search surface. Desktop: the
              magnifier stays decorative — the backdrop and Esc are the dismissals there. */}
          <button
            type="button"
            aria-label="Close search"
            onClick={onClose}
            className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-[var(--neutral)] transition-colors hover:text-[var(--primary)] md:hidden"
          >
            <ArrowLeft size={20} />
          </button>
          <Search size={18} className="hidden flex-none text-[var(--neutral)] md:block" />
          <input
            ref={attachInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, authors, books, topics, pages…"
            aria-label="Search"
            role="combobox"
            aria-expanded={results.length > 0}
            aria-controls="search-results"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            // `text-base` is load-bearing on iOS: anything under 16px makes Safari zoom the page in
            // on focus, which would break the measured full-screen surface.
            className="w-full min-w-0 bg-transparent py-3.5 text-base text-[var(--primary)] placeholder:text-[var(--neutral)] focus:outline-none md:py-4"
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => { setQuery(''); inputRef.current?.focus() }}
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-[var(--neutral)] transition-colors hover:text-[var(--primary)] md:hidden"
            >
              <X size={18} />
            </button>
          ) : null}
          <kbd className="hidden flex-none rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--neutral)] md:inline">Esc</kbd>
        </div>

        {/* Mobile: takes every remaining pixel and scrolls inside itself — `overscroll-contain` stops
            a fling at the end of the list from chaining into the page behind. Desktop: the v2 55vh
            cap on an auto-height card. */}
        <div
          ref={listRef}
          id="search-results"
          // Only a region that actually holds `option` rows is a listbox — with the idle or
          // no-matches copy inside it, it is just a paragraph in a box.
          role={results.length ? 'listbox' : undefined}
          aria-label={results.length ? 'Search results' : undefined}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] md:max-h-[55vh] md:flex-none md:pb-2"
        >
          {!query.trim() ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--neutral)]">
              Search everything — songs, authors, books, topics, tags, and pages.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--neutral)]">No matches for “{query.trim()}”.</p>
          ) : (
            results.map(({ e, line }, i) => (
              <button
                key={`${e.type}-${e.href}-${i}`}
                type="button"
                id={`search-result-${i}`}
                role="option"
                aria-selected={i === selected}
                data-idx={i}
                onMouseEnter={() => setSelected(i)}
                onClick={() => go(e.href)}
                // `py-2.5` on mobile keeps a row at ~44px, the minimum comfortable touch target.
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors md:py-2 ${
                  i === selected ? 'bg-[var(--background-offset)]' : ''
                }`}
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--background-offset)] text-[var(--neutral)]">
                  {e.icon ?? TYPE_ICON[e.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--primary)]">{displayTitle(e)}</span>
                  {/* A content match shows the matched verse line (italic, quoted) instead of the
                      author, so it reads as "found in the text" rather than a title/author hit;
                      otherwise the author/subtitle, in the reader's script. */}
                  {line ? (
                    <span className="block truncate text-xs italic text-[var(--neutral)]">“{line}”</span>
                  ) : displayAuthor(e) ? (
                    <span className="block truncate text-xs text-[var(--neutral)]">{displayAuthor(e)}</span>
                  ) : null}
                </span>
                <span className="flex-none text-[10px] font-medium uppercase tracking-wide text-[var(--neutral)]/70">
                  {line ? 'in text' : e.type}
                </span>
              </button>
            ))
          )}
        </div>

        {/* Keyboard hints name physical keys, so they are desktop-only — on the full-screen mobile
            surface they would be a permanent lie taking a row of the results' height. */}
        <div className="hidden flex-none items-center gap-4 border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--neutral)] md:flex">
          <span className="flex items-center gap-1"><CornerDownLeft size={12} /> open</span>
          <span>↑↓ navigate</span>
          <span className="ml-auto">{results.length ? `${results.length} results` : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default SearchModal

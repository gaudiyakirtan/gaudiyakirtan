import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Search, Home, Music, User, Hash, BookOpen, Settings, Info, Mail,
  AudioLines, Type, Volume2, Tag as TagIcon, FileText, Mic2, ListMusic, ArrowLeft, X,
} from 'lucide-react'
import { buildDuet, searchDuet, type IDuetDoc } from '../services/duet'
import { NAV_ENTRIES } from '../services/urlResolver'
import { useSettings } from '../utils/SettingsContext'
import { lockScroll } from '../utils/bodyScrollLock'
import { LAYER } from '../utils/layers'
import { searchViewportStyle } from '../utils/searchViewport'
import { useSearchViewport } from '../utils/useSearchViewport'
import type { IShortcutRevealState } from '../utils/keyboardShortcuts'
import { ShortcutHint } from './ShortcutHint'

interface SearchModalProps {
  open: boolean
  onClose: () => void
  shortcutReveal: IShortcutRevealState
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
 *   It is **two layers with two heights** (spec v10, sized in globals.css): `.gk-search-panel`, the
 *   part the reader touches, is the measured *visual* viewport so the keyboard never covers it;
 *   `.gk-search-underlay`, the part the reader sees, is the *layout* viewport and beyond, because
 *   iOS draws its keyboard accessory bar over the page and would otherwise show it.
 */
/**
 * Below this Duet score a hit is a lone shared trigram, not a match worth showing. Duet only ever
 * returns docs that shared at least one gram, so this trims that long noisy tail; a real title or
 * content match clears it comfortably (a reranked title match scores in the low single digits).
 */
const SCORE_FLOOR = 0.35

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose, shortcutReveal }) => {
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
    // The outer layer is the mobile surface AND the desktop backdrop. On a phone the underlay
    // covers it completely, so `onClick={onClose}` is unreachable there (a full-screen search page
    // has no backdrop to dismiss — that is what the back button is for); on desktop it is the
    // dimmed backdrop and keeps its click-to-dismiss. It spans the whole LAYOUT viewport
    // (`inset-0`) in both presentations — only the panel inside it is sized to what the keyboard
    // leaves usable.
    <div
      className="fixed inset-0 flex flex-col bg-[var(--background)] md:flex-row md:items-start md:justify-center md:bg-black/50 md:px-4 md:pt-[12vh] md:backdrop-blur-sm"
      style={{ ...searchViewportStyle(viewport), zIndex: LAYER.searchModal }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      aria-keyshortcuts="Escape"
    >
      {/* Opaque coverage, and nothing else — it takes no taps and says nothing to a screen reader.
          iOS paints the keyboard's password/autofill accessory bar OVER THE PAGE, so every pixel
          below the visual viewport would otherwise be the song the reader came from (spec v10).
          `.gk-search-underlay` is therefore sized to the layout viewport and past it, never to the
          measured visual viewport that sizes the panel. Mobile only: up at `md` this same overlay
          is meant to be a see-through dim. */}
      <div
        aria-hidden="true"
        data-testid="search-underlay"
        className="gk-search-underlay pointer-events-none absolute inset-x-0 bg-[var(--background)] md:hidden"
      />
      <div
        data-testid="search-panel"
        // `relative` is load-bearing: the underlay is positioned, so without a position of its own
        // the panel would paint *under* it (positioned boxes paint above in-flow ones) and the
        // whole search UI would disappear behind its own background.
        className="gk-search-panel relative flex min-h-0 w-full flex-none flex-col overflow-hidden bg-[var(--background)] pt-[env(safe-area-inset-top)] md:h-auto md:max-w-xl md:rounded-2xl md:border md:border-[var(--border)] md:pt-0 md:shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex flex-none items-center gap-2 border-b border-[var(--border)] px-2 md:gap-3 md:px-4">
          {/* Mobile: a back arrow, the convention for a full-screen search surface. Desktop: the
              magnifier stays decorative — the backdrop and Esc are the dismissals there. */}
          <button
            type="button"
            aria-label="Close search"
            aria-keyshortcuts="Escape"
            onClick={onClose}
            className="relative inline-flex h-10 w-10 flex-none items-center justify-center rounded-full text-[var(--neutral)] transition-colors hover:text-[var(--primary)] md:hidden"
          >
            <ArrowLeft size={20} />
            <ShortcutHint
              compact
              visible={shortcutReveal.active}
              label="Esc"
              testId="mobile-search-close-shortcut"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2"
            />
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
            aria-keyshortcuts="ArrowDown ArrowUp Enter"
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
          <ShortcutHint
            visible={shortcutReveal.active}
            label="Esc"
            testId="desktop-search-close-shortcut"
            className="hidden min-w-9 flex-none md:inline-flex"
          />
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
                <span className="relative flex h-5 min-w-12 flex-none items-center justify-end text-[10px] font-medium uppercase tracking-wide text-[var(--neutral)]/70">
                  <span className={shortcutReveal.active && i === selected ? 'opacity-0' : 'opacity-100'}>
                    {line ? 'in text' : e.type}
                  </span>
                  <ShortcutHint
                    compact
                    visible={shortcutReveal.active && i === selected}
                    label="Enter"
                    testId={i === selected ? 'search-open-shortcut' : undefined}
                    className="absolute right-0 normal-case tracking-normal"
                  />
                </span>
              </button>
            ))
          )}
        </div>

        {/* This floats over the results rather than reserving a footer, so revealing keyboard help
            never changes either presentation's height. It can only appear after a hardware
            keyboard produces a modifier event, including on mobile. */}
        <ShortcutHint
          visible={shortcutReveal.active && results.length > 0}
          label="↑  ↓"
          testId="search-navigate-shortcut"
          className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 bg-[var(--background-offset)]"
        />
      </div>
    </div>
  )
}

export default SearchModal

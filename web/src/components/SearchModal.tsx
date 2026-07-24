import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import {
  Search, CornerDownLeft, Home, Music, User, Hash, BookOpen, Settings, Info, Mail,
  AudioLines, Type, Volume2, Tag as TagIcon, FileText, Mic2, ListMusic,
} from 'lucide-react'
import { buildDuet, searchDuet, type IDuetDoc } from '../services/duet'
import { NAV_ENTRIES } from '../services/urlResolver'

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
 */
/**
 * Below this Duet score a hit is a lone shared trigram, not a match worth showing. Duet only ever
 * returns docs that shared at least one gram, so this trims that long noisy tail; a real title or
 * content match clears it comfortably (a reranked title match scores in the low single digits).
 */
const SCORE_FLOOR = 0.35

export const SearchModal: React.FC<SearchModalProps> = ({ open, onClose }) => {
  const router = useRouter()
  const [entities, setEntities] = useState<Entry[] | null>(null)
  const [content, setContent] = useState<Record<string, string[]> | null>(null)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

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
    if (open) setTimeout(() => inputRef.current?.focus(), 20)
  }, [open])

  const all = useMemo(() => [...PAGES, ...(entities ?? [])], [entities])

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
      .map((r) => ({ e: all[r.ref], s: r.score }))
      .sort((a, b) => b.s - a.s || TYPE_RANK[b.e.type] - TYPE_RANK[a.e.type] || a.e.label.localeCompare(b.e.label))
      .map((x) => x.e)
  }, [index, all, query])

  useEffect(() => setSelected(0), [query])

  const go = (href: string) => {
    onClose()
    router.push(href)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') return onClose()
    if (!results.length) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); const p = results[selected]; if (p) go(p.href) }
  }

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${selected}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [selected])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--background)] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] px-4">
          <Search size={18} className="flex-none text-[var(--neutral)]" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search songs, authors, books, topics, pages…"
            className="w-full bg-transparent py-4 text-[var(--primary)] placeholder:text-[var(--neutral)] focus:outline-none"
          />
          <kbd className="hidden rounded border border-[var(--border)] px-1.5 py-0.5 text-[10px] text-[var(--neutral)] sm:inline">Esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2">
          {!query.trim() ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--neutral)]">
              Search everything — songs, authors, books, topics, tags, and pages.
            </p>
          ) : results.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-[var(--neutral)]">No matches for “{query.trim()}”.</p>
          ) : (
            results.map((e, i) => (
              <button
                key={`${e.type}-${e.href}-${i}`}
                type="button"
                data-idx={i}
                onMouseEnter={() => setSelected(i)}
                onClick={() => go(e.href)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors ${
                  i === selected ? 'bg-[var(--background-offset)]' : ''
                }`}
              >
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-[var(--background-offset)] text-[var(--neutral)]">
                  {e.icon ?? TYPE_ICON[e.type]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm text-[var(--primary)]">{e.label}</span>
                  {e.subtitle && <span className="block truncate text-xs text-[var(--neutral)]">{e.subtitle}</span>}
                </span>
                <span className="flex-none text-[10px] font-medium uppercase tracking-wide text-[var(--neutral)]/70">{e.type}</span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-[var(--border)] px-4 py-2 text-[11px] text-[var(--neutral)]">
          <span className="flex items-center gap-1"><CornerDownLeft size={12} /> open</span>
          <span>↑↓ navigate</span>
          <span className="ml-auto">{results.length ? `${results.length} results` : ''}</span>
        </div>
      </div>
    </div>
  )
}

export default SearchModal

import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { IScriptText } from '../models/Common'
import { pickScriptText } from '../services/textDisplay'
import { useSettings } from '../utils/SettingsContext'
import { ISongListing } from '../services/songListingView'
import { SongListItem } from './SongListItem'

export interface ISongGroupView {
  uid: string
  kind: 'book' | 'topic' | 'collection'
  /** Pre-picked Latin title (SSR / <Head> / fallback). */
  title: string
  /** All title renderings, so the header re-picks by the reader's List-language. */
  titles?: IScriptText[]
  color?: string | null
  count: number
}

interface SongGroupScreenProps {
  group: ISongGroupView
  songs: ISongListing[]
}

const KIND_LABEL: Record<ISongGroupView['kind'], string> = {
  book: 'Book',
  topic: 'Topic',
  collection: 'Collection',
}

const BACK_HREF: Record<ISongGroupView['kind'], string> = {
  book: '/books',
  topic: '/topics',
  collection: '/',
}

export const SongGroupScreen: React.FC<SongGroupScreenProps> = ({ group, songs }) => {
  const router = useRouter()
  const { settings } = useSettings()
  const accent = group.color || 'var(--highlight)'
  // Header title in the reader's List-language (books/topics carry per-script names now).
  const title = pickScriptText(group.titles, [settings.listLanguage, 'Latn', 'Beng']) || group.title

  return (
    <div className="mx-auto w-full max-w-screen-lg px-4 pb-16 md:px-0">
      <Link
        href={BACK_HREF[group.kind]}
        className="mb-4 inline-flex items-center gap-1 text-sm text-[var(--neutral)] hover:text-[var(--primary)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
        {group.kind === 'book' ? 'All books' : group.kind === 'topic' ? 'All topics' : 'Home'}
      </Link>

      {/* Header banner tinted by the group accent */}
      <div
        className="mb-6 flex items-end gap-4 rounded-2xl p-6"
        style={{ background: `linear-gradient(135deg, ${accent}, transparent)` }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
            {KIND_LABEL[group.kind]}
          </p>
          <h1 className="mt-1 text-3xl font-bold text-white drop-shadow-sm">{title}</h1>
          <p className="mt-1 text-sm text-white/80">{group.count} songs</p>
        </div>
      </div>

      {songs.length === 0 ? (
        <p className="px-4 py-16 text-center text-[var(--neutral)]">No songs in this {group.kind}.</p>
      ) : (
        <div className="space-y-1 px-2">
          {songs.map((song) => (
            <SongListItem key={song.uid} song={song} onClick={() => router.push(`/songs/${song.uid}`)} />
          ))}
        </div>
      )}
    </div>
  )
}

export default SongGroupScreen

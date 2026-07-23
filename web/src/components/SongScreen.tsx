import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ISong } from '../models/Song'
import type { ISongMembership } from '../services/songGroupRepository'
import { UNKNOWN_AUTHOR_UID } from '../models/Common'
import { pickScriptText, pickTranslation, pickWordToWord } from '../services/textDisplay'
import { effectiveDisplayScript } from '../services/scripts'
import { useSettings } from '../utils/SettingsContext'
import { usePlayer } from '../utils/PlayerContext'
import { VerseListItem } from './VerseListItem'
import { ReaderOptions } from './ReaderOptions'
import { MusicNote } from './icons/MusicNote'

interface SongScreenProps {
  song: ISong
  /** Book/topic groups this song belongs to — rendered as chips beside the tags. */
  memberships?: ISongMembership[]
}

export const SongScreen: React.FC<SongScreenProps> = ({ song, memberships = [] }) => {
  const { settings, updateSetting } = useSettings()
  const { arm, playSong } = usePlayer()
  const router = useRouter()

  // Arm this song for the corner player widget while the reader is open (so its idle FAB starts
  // *this* song); clear on leave. Only when the song actually has audio.
  useEffect(() => {
    arm(song.audioAvailable ? song : null)
    return () => arm(null)
  }, [song, arm])

  // Shared deep link: /songs/<uid>?play=<trackUid|1> cues + plays that recording on arrival
  // (autoplay may be blocked without a prior gesture → the player cues it paused, ready to tap).
  useEffect(() => {
    const p = router.query.play
    if (!p || !song.audioAvailable) return
    const wantTrack = typeof p === 'string' && p !== '1' && p !== 'true' ? p : undefined
    playSong(song, wantTrack)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song, router.query.play])
  const {
    displayScript,
    transliterationScript,
    romanStandard,
    listLanguage,
    showSource,
    showTransliteration,
    showWordToWord,
    wordToWordLanguage,
    showTranslation,
    translationLanguage,
  } = settings

  // `displayScript` may be `auto` ("Default (source language)") — resolve it to this song's own
  // native script from its language_of_origin before rendering the verses.
  const effDisplayScript = effectiveDisplayScript(displayScript, song.languageOfOrigin)

  const hasWordToWord = useMemo(
    () => song.verses.some((v) => pickWordToWord(v.wordToWords, wordToWordLanguage)),
    [song, wordToWordLanguage]
  )
  const hasTranslation = useMemo(
    () => song.verses.some((v) => pickTranslation(v.translations, translationLanguage)),
    [song, translationLanguage]
  )

  // The header title/author follow the reader's **List language** (how the song appears in lists /
  // browse), independent of the per-verse Display/Transliteration scripts — so the header stays
  // consistent app-wide while the verse body honors the reading scripts.
  const title = pickScriptText(song.titleMain, [listLanguage, 'Latn', 'Beng'])
  const author = pickScriptText(song.authorDisplay, [listLanguage, 'Latn', 'Beng']) || song.authorUid
  // Tapping the author opens the author-filtered song list (docs/screens/song-detail.md's deferred
  // author-tap, now unlocked by the Library-Author variant), unless authorship is unknown ('?').
  const authorLinkable = song.authorUid !== UNKNOWN_AUTHOR_UID

  return (
    <div className="px-4 pt-2 pb-12 md:px-0">
      {/* Reader display options — collapsible, outlined panel at the content-area TOP-LEFT. Its
          options are an absolute dropdown, so opening/closing overlays and never moves the page. */}
      <div className="mb-4">
        <ReaderOptions
          showSource={showSource}
          onToggleSource={() => updateSetting('showSource', !showSource)}
          showTransliteration={showTransliteration}
          onToggleTransliteration={() => updateSetting('showTransliteration', !showTransliteration)}
          showWordToWord={showWordToWord}
          onToggleWordToWord={() => updateSetting('showWordToWord', !showWordToWord)}
          showTranslation={showTranslation}
          onToggleTranslation={() => updateSetting('showTranslation', !showTranslation)}
          hasWordToWord={hasWordToWord}
          hasTranslation={hasTranslation}
        />
      </div>

      <div className="mx-auto w-full max-w-4xl">
      {/* Header - centered per the Song / song view frames */}
      <div className="flex flex-col items-center gap-1 mb-6 text-center">
        <h1 className="text-4xl text-[var(--highlight)] capitalize">{title}</h1>

        <div className="flex items-center gap-2">
          {authorLinkable ? (
            <Link
              href={`/songs?author=${encodeURIComponent(song.authorUid)}`}
              className="text-2xl text-[var(--primary)] hover:text-[var(--highlight)] transition-colors"
              title="See all songs by this author"
            >
              {author}
            </Link>
          ) : (
            <p className="text-2xl text-[var(--primary)]">{author}</p>
          )}
          {song.audioAvailable && <MusicNote size={18} className="text-[var(--neutral)]" />}
        </div>

        {/* Song code, then its memberships and tags on one centered row. Books (a named work, the
            strongest membership) render in the accent and link to the book; topics are outlined and
            link to the topic; tags are plain, non-navigating labels. Membership comes from
            song_groups.json, not song.tags — the two are different things (see getSongMemberships). */}
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full bg-[var(--neutral)]/25 px-2.5 py-1 text-[11px] font-semibold uppercase text-[var(--neutral)]">
            {song.uid}
          </span>
          {memberships.map((m) => (
            <Link
              key={m.uid}
              href={`/${m.kind === 'book' ? 'books' : 'topics'}/${m.uid}`}
              title={m.kind === 'book' ? 'Book' : 'Topic'}
              className={
                m.kind === 'book'
                  ? 'rounded-full bg-[var(--highlight)]/15 px-2.5 py-1 text-xs font-medium text-[var(--highlight)] transition-colors hover:bg-[var(--highlight)]/25'
                  : 'rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--neutral)] transition-colors hover:text-[var(--primary)]'
              }
            >
              {pickScriptText(m.titles, [settings.listLanguage, 'Latn', 'Beng'])}
            </Link>
          ))}
          {song.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--background-offset)] px-2.5 py-1 text-xs text-[var(--neutral)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Verses - render order is array order, never sorted by verseNumber (docs/data/song.md).
          Script + show/hide toggles re-render every verse. */}
      <div>
        {song.verses.map((verse, index) => (
          <VerseListItem
            key={`verse-${index}`}
            verse={verse}
            displayScript={effDisplayScript}
            transliterationScript={transliterationScript}
            romanStandard={romanStandard}
            wordToWordLanguage={wordToWordLanguage}
            translationLanguage={translationLanguage}
            showSource={showSource}
            showTransliteration={showTransliteration}
            showWordToWord={showWordToWord}
            showTranslation={showTranslation}
          />
        ))}
      </div>
      </div>
    </div>
  )
}

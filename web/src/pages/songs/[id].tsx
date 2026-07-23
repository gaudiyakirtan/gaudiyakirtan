import React from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import { ISong } from '../../models/Song'
import { SongScreen } from '../../components/SongScreen'
import { Seo } from '../../components/Seo'
import { getAllSongUids, getSongByUid } from '../../services'
import { getSongMemberships, ISongMembership } from '../../services/songGroupRepository'
import { pickScriptText } from '../../services/textDisplay'
import { deriveQueueForSong } from '../../services/queueContext'
import { recordSongVisit } from '../../utils/useRecents'
import { usePlayer } from '../../utils/PlayerContext'
import { audioUrlFor, canonical, SITE_NAME, SITE_URL } from '../../config'

/** ISO-639 language_of_origin → BCP-47, for `inLanguage`. */
const BCP47: Record<string, string> = { ben: 'bn', san: 'sa', hin: 'hi', asa: 'as', ori: 'or', eng: 'en' }

/** A meaningful meta description: the song's first English translation (the words a searcher wants),
 *  trimmed to ~155 chars; falls back to a generic line when the verse is not yet translated. */
function songDescription(song: ISong, title: string, author: string): string {
  const first = song.verses?.find((v) => v.translations?.length)?.translations
    ?.find((t) => t.languageCode === 'eng')?.text
  const gloss = first?.join(' ').replace(/\s+/g, ' ').trim()
  if (gloss) {
    const clipped = gloss.length > 155 ? `${gloss.slice(0, 152).trimEnd()}…` : gloss
    return `${title} by ${author} — ${clipped}`
  }
  return `Lyrics, transliteration${song.audioAvailable ? ', recordings' : ''} and translation for ${title}, a Gauḍīya Vaiṣṇava song by ${author}.`
}

interface SongPageProps {
  song: ISong
  subtitle: string
  /** Book/topic groups this song belongs to, for the membership chips (source: song_groups.json). */
  memberships: ISongMembership[]
}

const SongPage: React.FC<SongPageProps> = ({ song, memberships }) => {
  const router = useRouter()
  const { armQueue, consumeAutoplay, playSong } = usePlayer()

  // Record the visit for home's "Continue" region (docs/screens/home.md §2). Device-local only —
  // never transmitted. Declared BEFORE the fallback/not-found early returns below, so the hook
  // order stays stable across renders.
  React.useEffect(() => {
    if (song?.uid) recordSongVisit(song.uid)
  }, [song?.uid])

  // Continuous play through a book/topic (docs/screens/player.md feature 2): arm this song's
  // containing book/topic as the "next song" queue for as long as this page is open, exactly
  // parallel to how SongScreen arms the song itself for the idle FAB. Cleared on leave so a queue
  // never outlives the page that armed it.
  React.useEffect(() => {
    if (!song?.audioAvailable) {
      armQueue(null)
      return
    }
    armQueue(deriveQueueForSong(song))
    return () => armQueue(null)
  }, [song, armQueue])

  // The other half of PlayerContext's queue-advance (and next/previous): when this page was
  // navigated to as a continuation rather than a plain visit, consumeAutoplay(uid) returns true
  // exactly once, and this page (not PlayerContext, which has no song data of its own to fetch)
  // is what actually starts playback.
  React.useEffect(() => {
    if (!song?.audioAvailable) return
    if (consumeAutoplay(song.uid)) playSong(song)
  }, [song, consumeAutoplay, playSong])

  if (router.isFallback) {
    return <div className="p-8 text-center">Loading...</div>
  }

  if (!song) {
    return (
      <div className="flex flex-col items-center p-8">
        <h1 className="mb-4 text-2xl font-bold text-[var(--primary)]">Song not found</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 text-[var(--on-highlight)] rounded-lg bg-[var(--highlight)]"
        >
          Return to home
        </button>
      </div>
    )
  }

  const title = pickScriptText(song.titleMain, ['Latn'])
  const author = pickScriptText(song.authorDisplay, ['Latn', 'Beng']) || song.authorUid
  const path = `/songs/${song.uid}`

  // MusicComposition for the song, each recording as a MusicRecording (contentUrl → the S3 mp3), so
  // search engines can surface the piece and its audio; plus a breadcrumb for the Home → Songs trail.
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'MusicComposition',
      name: title,
      inLanguage: BCP47[song.languageOfOrigin] ?? song.languageOfOrigin,
      composer: { '@type': 'Person', name: author },
      url: canonical(path),
      ...(song.audioFiles?.length
        ? {
            recordedAs: song.audioFiles.map((t) => ({
              '@type': 'MusicRecording',
              name: title,
              ...(t.artist ? { byArtist: { '@type': 'MusicGroup', name: t.artist } } : {}),
              audio: { '@type': 'AudioObject', contentUrl: audioUrlFor(t.filename), encodingFormat: 'audio/mpeg' },
            })),
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: SITE_NAME, item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Songs', item: canonical('/songs') },
        { '@type': 'ListItem', position: 3, name: title, item: canonical(path) },
      ],
    },
  ]

  return (
    <>
      <Seo
        title={`${title} — ${author} | Gaudiya Kirtan`}
        description={songDescription(song, title, author)}
        path={path}
        type="article"
        jsonLd={jsonLd}
      />

      <SongScreen song={song} memberships={memberships} />
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = getAllSongUids().map((uid) => ({
    params: { id: uid },
  }))

  return {
    paths,
    fallback: false, // All 703 uids are known at build time - no runtime backend to fall back to.
  }
}

export const getStaticProps: GetStaticProps<SongPageProps> = async ({ params }) => {
  const uid = params?.id as string
  const song = getSongByUid(uid)

  if (!song) {
    return { notFound: true }
  }

  const title = pickScriptText(song.titleMain, ['Latn'])

  return {
    props: {
      song,
      subtitle: title,
      // Derived from song_groups.json at build time — the source of truth for membership, since
      // ISong.topics is intentionally never populated (see songGroupRepository.getSongMemberships).
      memberships: getSongMemberships(uid),
    },
  }
}

export default SongPage

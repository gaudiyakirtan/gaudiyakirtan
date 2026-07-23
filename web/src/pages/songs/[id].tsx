import React from 'react'
import { useRouter } from 'next/router'
import { GetStaticPaths, GetStaticProps } from 'next'
import Head from 'next/head'
import { ISong } from '../../models/Song'
import { SongScreen } from '../../components/SongScreen'
import { getAllSongUids, getSongByUid } from '../../services'
import { pickScriptText } from '../../services/textDisplay'
import { recordSongVisit } from '../../utils/useRecents'

interface SongPageProps {
  song: ISong
  subtitle: string
}

const SongPage: React.FC<SongPageProps> = ({ song }) => {
  const router = useRouter()

  // Record the visit for home's "Continue" region (docs/screens/home.md §2). Device-local only —
  // never transmitted. Declared BEFORE the fallback/not-found early returns below, so the hook
  // order stays stable across renders.
  React.useEffect(() => {
    if (song?.uid) recordSongVisit(song.uid)
  }, [song?.uid])

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

  return (
    <>
      <Head>
        <title>{title} by {author} - Gaudiya Kirtan</title>
        <meta name="description" content={`Lyrics, transliteration and translation for ${title} by ${author}`} />
      </Head>

      <SongScreen song={song} />
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
    },
  }
}

export default SongPage

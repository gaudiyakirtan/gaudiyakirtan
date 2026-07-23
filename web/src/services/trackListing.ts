// Server-only builder for the Tracks list (/tracks). Unlike the song list, this cannot be built
// from the Manifest: the Manifest carries only `audio_available` (a boolean), not the takes
// themselves, so the recordings have to come from the full Songs. Each song is then trimmed to the
// slice the screen + player need (ITrackSong) before it leaves getStaticProps.
import { ISong } from '../models/Song'
import { getAllSongs } from './songRepository'
import { pickScriptText } from './textDisplay'
import { AuthorNames, ITrackSong } from './trackListingView'

// The client-safe view model + pickers live in trackListingView.ts; re-export the types here for
// convenience. The builders below are server-only (read songs via fs) and belong in
// getStaticProps, never the client bundle.
export type { ITrackSong, ITrackRow, AuthorNames } from './trackListingView'

const hasAudio = (song: ISong) => (song.audioFiles?.length ?? 0) > 0

/**
 * Every song that has at least one recording, trimmed to the player's slice and sorted by the
 * fixed Latin title. Author *renderings* are excluded on purpose — see `getTrackAuthors`.
 */
export function getTrackSongs(): ITrackSong[] {
  return getAllSongs()
    .filter(hasAudio)
    .map((song) => ({
      uid: song.uid,
      titleMain: song.titleMain,
      authorUid: song.authorUid,
      authorName: pickScriptText(song.authorDisplay, ['Latn', 'Beng']),
      // Rebuild each take explicitly: getStaticProps rejects a literal `undefined` value even for
      // an optional key, so `artist` is spread in only when present (see services/decode.ts).
      tracks: (song.audioFiles ?? []).map((track) => ({
        uid: track.uid,
        filename: track.filename,
        ...(track.artist ? { artist: track.artist } : {}),
      })),
      title: pickScriptText(song.titleMain, ['Latn', 'Beng']),
    }))
    .sort((a, b) => a.title.localeCompare(b.title))
}

/**
 * The author-name renderings referenced by the track songs, keyed by `authorUid`.
 *
 * Shipped once instead of inlined per song: the 244 songs with audio share only 43 authors, so
 * inlining duplicated ~206 kB of identical script arrays into the page payload. The player needs
 * the full renderings for its credit line, so they are rejoined client-side via `toPlayable`.
 */
export function getTrackAuthors(): AuthorNames {
  const authors: AuthorNames = {}
  for (const song of getAllSongs()) {
    if (!hasAudio(song) || authors[song.authorUid]) continue
    authors[song.authorUid] = song.authorDisplay ?? []
  }
  return authors
}

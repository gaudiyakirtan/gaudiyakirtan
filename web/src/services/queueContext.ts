// Derives the "continuous play" queue for a song from the book/topic groups it belongs to
// (docs/screens/player.md feature 2). Books are ordered and preferred - a songbook has a natural
// listening order - falling back to the first topic that actually has more than one song (a
// group of 1 has nothing to advance to). Runs entirely off song_groups.json via
// songGroupRepository, which is explicitly client-safe (imported as a JSON module, not read via
// fs - see that module's header comment), so this can be called from a page component with no
// server round-trip.
//
// Deliberately does NOT read ISong.topics: the shipped corpus never actually populates that field
// (every song ships `topics: []`/absent - topic membership only exists the other way round, as
// each topic group's own `song_uids`). So topic membership below is a reverse-lookup scan over
// `getSongGroups('topic')`, exactly like the book lookup, rather than trusting the song's own field.
import { getSongGroups } from './songGroupRepository'
import { pickScriptText } from './textDisplay'
import { Uid } from '../models/Common'
import { IPlayerQueue } from './playerQueue'

/** The minimal shape this needs from an ISong - avoids importing the full model for just one field. */
export interface IQueueableSong {
  uid: Uid
}

/**
 * The book or topic queue a song page should arm for the given song, or null when the song
 * belongs to neither (or only to single-song groups with nothing to continue to). A song in
 * multiple books/topics gets the first match, in `song_groups.json` order - deterministic, though
 * arbitrary when a song genuinely spans several (there is no "which list did the reader come
 * from" signal available to a statically-generated song-detail page).
 */
export function deriveQueueForSong(song: IQueueableSong): IPlayerQueue | null {
  const book = getSongGroups('book').find((group) => group.songUids.includes(song.uid))
  if (book && book.songUids.length > 1) {
    return {
      context: {
        kind: 'book',
        groupUid: book.uid,
        title: pickScriptText(book.titles, ['Latn', 'Beng']),
      },
      uids: book.songUids,
    }
  }

  const topic = getSongGroups('topic').find(
    (group) => group.songUids.includes(song.uid) && group.songUids.length > 1
  )
  if (topic) {
    return {
      context: {
        kind: 'topic',
        groupUid: topic.uid,
        title: pickScriptText(topic.titles, ['Latn', 'Beng']),
      },
      uids: topic.songUids,
    }
  }

  return null
}

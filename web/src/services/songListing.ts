// Joins Manifest entries with their resolved author display name - the "list card" view-model
// used by SongListItem/SongsSection/the Songs table. Per docs/data/manifest.md platform notes,
// list screens read the Manifest and never load a full Song; the Manifest itself only carries
// `author_uid` (a ref), so resolving it to a human-readable name is this repository's job.
import { IManifestEntry } from '../models/Manifest'
import { IScriptText } from '../models/Common'
import { getManifest } from './manifestRepository'
import { getAuthors } from './authorRepository'
import { pickScriptText } from './textDisplay'
import { ISongListing } from './songListingView'

// The client-safe view model + title picker live in songListingView.ts; re-export the type here
// for callers that were importing it from this module. `getSongListings` below is server-only
// (reads the manifest via fs) and belongs in getStaticProps, never the client bundle.
export type { ISongListing } from './songListingView'
export { pickListTitle } from './songListingView'

let cachedAuthors: Map<string, { name: string; names: IScriptText[] }> | null = null

function getAuthorByUid(uid: string): { name: string; names: IScriptText[] } {
  if (!cachedAuthors) {
    cachedAuthors = new Map(
      getAuthors().map(({ author }) => [
        author.uid,
        { name: pickScriptText(author.names, ['Latn', 'Beng']), names: author.names },
      ])
    )
  }
  return cachedAuthors.get(uid) ?? { name: uid, names: [] }
}

function toListing(entry: IManifestEntry): ISongListing {
  const author = getAuthorByUid(entry.authorUid)
  return {
    uid: entry.uid,
    title: entry.primaryTitle.text,
    titles: entry.titles?.length ? entry.titles : [entry.primaryTitle],
    authorUid: entry.authorUid,
    authorName: author.name,
    authorNames: author.names,
    languageOfOrigin: entry.languageOfOrigin,
    audioAvailable: entry.audioAvailable,
    // Conditional spread, not `firstLetter: entry.firstLetter` - getStaticProps rejects a
    // literal `undefined` value even when the key is optional (see services/decode.ts).
    ...(entry.firstLetter ? { firstLetter: entry.firstLetter } : {}),
  }
}

/** All 703 songs as list-view rows, joined with a resolved author display name. */
export function getSongListings(): ISongListing[] {
  return getManifest().map(toListing)
}

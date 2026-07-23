// Repository for Author (docs/data/author.md). The shipped corpus has no standalone
// authors dataset, so Authors are DERIVED from the song set by grouping on `author_uid` and
// taking the first `author_display` seen for that uid - this matches the spec's invariant
// that "Authors are derived from / consistent with the shipped song set; no orphan authors".
//
// Data-quality note (surfaced in the slice-1 report): about half of the corpus's distinct
// `author_uid` values are short codes with a proper `author_display` (e.g. uid 'ldt' ->
// "শ্রীল লোচন দাস ঠাকুর"), but the other half use the author's full Bengali name AS the uid
// with an empty `author_display`. We fall back to the uid itself as the display name in that
// case so every author still resolves to a non-empty `names` list per the spec invariant.
import { IAuthor } from '../models/Author'
import { IScriptText } from '../models/Common'
import { getAllSongs } from './songRepository'

export interface IAuthorListing {
  author: IAuthor
  songCount: number
}

let cachedListings: IAuthorListing[] | null = null

export function getAuthors(): IAuthorListing[] {
  if (cachedListings) return cachedListings

  const byUid = new Map<string, { names: IScriptText[]; count: number }>()
  for (const song of getAllSongs()) {
    const existing = byUid.get(song.authorUid)
    if (existing) {
      existing.count += 1
    } else {
      byUid.set(song.authorUid, { names: song.authorDisplay, count: 1 })
    }
  }

  cachedListings = Array.from(byUid.entries()).map(([uid, { names, count }]) => {
    const resolvedNames = names.length ? names : [{ scriptCode: 'Beng', text: uid }]
    return { author: { uid, names: resolvedNames }, songCount: count }
  })
  return cachedListings
}

export function getAuthorByUid(uid: string): IAuthor | null {
  return getAuthors().find((listing) => listing.author.uid === uid)?.author ?? null
}

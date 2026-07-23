// Conforms to docs/data/collections.md, spec v1.
// Book, Topic, and Collection are all instances of the common SongGroup shape.
import { IScriptText, Uid } from './Common'

export type SongGroupKind = 'book' | 'topic' | 'collection'

/**
 * A titled set of song references. `kind` distinguishes a published songbook (ordered),
 * a thematic Topic tag (unordered), or a curated Collection (unordered).
 *
 * The shipped corpus ships 93 groups (19 books + 74 topics) via `song_groups.json`; no
 * `collection`-kind entries yet - see src/services/songGroupRepository.ts.
 */
export interface ISongGroup {
  uid: Uid
  kind: SongGroupKind
  /** Group name across scripts. At least one. */
  titles: IScriptText[]
  /** Member songs. When kind === 'book', order is authoritative for display. */
  songUids: Uid[]
  ordered: boolean
  /** Display accent, e.g. used by Topic tags. */
  color?: string
}

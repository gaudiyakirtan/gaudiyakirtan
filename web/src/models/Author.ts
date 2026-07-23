// Conforms to docs/data/author.md, spec v1.
import { IScriptText, Uid } from './Common'

/**
 * The acarya / composer of one or more Songs. Songs reference an author by uid.
 * Note: the shipped corpus has no standalone authors dataset - see
 * src/services/authorRepository.ts for how this is derived from the song set.
 */
export interface IAuthor {
  /** Stable identifier, e.g. 'ldt', 'bt'. '?' is the reserved sentinel for unknown authorship. */
  uid: Uid
  /** The author's name across scripts. At least one. */
  names: IScriptText[]
  /** Optional short biography lines. Not present in the current corpus. */
  bio?: string[]
}

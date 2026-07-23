// Conforms to docs/data/manifest.md, spec v1.
import { IScriptText, LanguageCode, Uid } from './Common'

/**
 * The lightweight catalog index of the whole song set. List/search/browse screens read this
 * instead of loading full ISong objects; a full Song is loaded only on the detail screen.
 */
export interface IManifestEntry {
  uid: Uid
  /** The title to show in lists (script chosen per app default). */
  primaryTitle: IScriptText
  /** All titles, so search can match any script. */
  titles?: IScriptText[]
  authorUid: Uid
  languageOfOrigin: LanguageCode
  /** Badges songs that have recordings. */
  audioAvailable: boolean
  /** Normalized leading character for the alphabetical scroll index. */
  firstLetter?: string
  /** Content hash of the canonical song file, for change detection / offline sync. */
  md5: string
}

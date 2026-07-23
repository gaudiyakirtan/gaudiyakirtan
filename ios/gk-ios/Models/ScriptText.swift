import Foundation

/// A piece of text in one script (docs/data/README.md "Shared Conventions" + song.md
/// "Value objects owned by Song"). Used for `Song.titleMain`, `Song.authorDisplay`,
/// `Author.names`, `SongGroup.titles`, and `ManifestEntry.primaryTitle`/`titles`.
struct ScriptText: Codable, Hashable {
    /// ISO 15924 script code, e.g. "Beng", "Latn", "Deva".
    let scriptCode: String
    /// Only meaningful when `scriptCode == "Latn"`. The spec (docs/data/README.md) documents
    /// `ISO15919`/`IAST`, but the shipped corpus also emits `BBT_Roman` / `GVP_Roman` for
    /// alternate Latin transliteration conventions — kept as a plain `String` (not a closed enum)
    /// so decoding never breaks as more standards are added.
    let standard: String?
    /// The raw text as stored on disk. May contain inline master-text flags (`[FLAG_*]`, see
    /// docs/data/README.md) when this `ScriptText` was not run through the pipeline's
    /// flag-resolution step (true for `title_main` / `author_display` / `SongGroup.titles`, which
    /// have no `display_scripts`-style generated/resolved counterpart). Use `displayText` for
    /// anything shown in the UI.
    let text: String

    enum CodingKeys: String, CodingKey {
        case scriptCode = "script_code"
        case standard
        case text
    }

    /// `text` with inline master-text flags resolved for safe display (see
    /// `StringUtils.resolveMasterTextFlags`).
    var displayText: String {
        StringUtils.resolveMasterTextFlags(text)
    }
}

/// A single recording of a Song (song.md v2, "Value objects owned by Song": AudioTrack).
///
/// Matches the shipped corpus exactly: a stable track id, the filename of the streamed audio asset
/// (resolved against `AudioConfig.audioBaseURL` — see `AudioConfig.playableURL(for:)` and
/// docs/screens/player.md), and an optional performing artist/singer used for the now-playing
/// credit and the take/artist picker when a song has more than one recording.
struct AudioTrack: Codable, Hashable {
    let uid: String
    let filename: String
    let artist: String?
}

/// A `Song.notes` entry — one localized annotation/glossary line (song.md v2, "Value objects owned
/// by Song": Note).
struct Note: Codable, Hashable {
    let languageCode: String
    let text: String

    enum CodingKeys: String, CodingKey {
        case languageCode = "language_code"
        case text
    }
}

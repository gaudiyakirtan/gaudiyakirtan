import Foundation

/// Canonical `ManifestEntry` — see docs/data/manifest.md (spec v1).
///
/// The lightweight catalog index of the whole song set. Every list/search/browse screen decodes
/// only the Manifest (`SongRepository.manifest`), never full `Song` objects — a full `Song` is
/// loaded by `uid` only when the reader opens the detail screen (manifest.md "Purpose").
struct ManifestEntry: Codable, Identifiable, Hashable {
    let uid: String
    let primaryTitle: ScriptText
    let titles: [ScriptText]
    let authorUid: String
    let languageOfOrigin: String
    let audioAvailable: Bool
    let firstLetter: String?
    let md5: String

    enum CodingKeys: String, CodingKey {
        case uid
        case primaryTitle = "primary_title"
        case titles
        case authorUid = "author_uid"
        case languageOfOrigin = "language_of_origin"
        case audioAvailable = "audio_available"
        case firstLetter = "first_letter"
        case md5
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        uid = try c.decode(String.self, forKey: .uid)
        primaryTitle = try c.decode(ScriptText.self, forKey: .primaryTitle)
        titles = try c.decodeIfPresent([ScriptText].self, forKey: .titles) ?? []
        authorUid = try c.decode(String.self, forKey: .authorUid)
        languageOfOrigin = try c.decode(String.self, forKey: .languageOfOrigin)
        audioAvailable = try c.decode(Bool.self, forKey: .audioAvailable)
        firstLetter = try c.decodeIfPresent(String.self, forKey: .firstLetter)
        md5 = try c.decode(String.self, forKey: .md5)
    }

    var id: String { uid }

    /// `primaryTitle`, flag-resolved for display (see `ScriptText.displayText`).
    var displayTitle: String { primaryTitle.displayText }

    /// The list title in the reader's chosen list-language script (settings.md `listLanguage`),
    /// mirroring `Song.title(inScript:)`: exact script → Latin → any available → `primaryTitle`.
    /// This is what makes the "Try Settings › List Language" hint song switch scripts in lists.
    func title(inScript scriptCode: String) -> String {
        let match = titles.first(where: { $0.scriptCode == scriptCode })
            ?? titles.first(where: { $0.scriptCode == "Latn" })
            ?? titles.first
        return (match ?? primaryTitle).displayText
    }

    /// The stable A–Z section key for the Song List index (docs/screens/songs-list.md: "keyed to
    /// `first_letter` … so the index does not reshuffle when `listLanguage` changes"). Uses the
    /// pipeline-computed `first_letter` (which strips leading punctuation/quotes the raw title may
    /// carry — e.g. `‘namo…` → `N`, `.Try…` → `T`), independent of the localized display title.
    /// Falls back to deriving from the Latin `primaryTitle` only if `first_letter` is absent.
    var sectionKey: String {
        if let firstLetter, !firstLetter.isEmpty { return firstLetter.uppercased() }
        return StringUtils.firstNormalizedLetter(displayTitle)
    }
}

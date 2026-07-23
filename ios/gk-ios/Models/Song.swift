import Foundation

/// Canonical `Song` entity — see docs/data/song.md (spec v1).
///
/// Aggregate root: one complete kirtan/bhajan. Carries identity, multi-script titles, an author
/// reference + denormalized display name, groupings, ordered verses, notes, and audio. Songs are
/// read-only content shipped with the app (offline-first, bundled JSON); never edited at runtime.
///
/// Field names/types mirror the spec's snake_case JSON keys via `CodingKeys`. A few fields the spec
/// marks optional (`topics`, `tags`, `notes`, `audio_files`) are decoded to non-optional empty
/// collections here for convenience — absence and emptiness mean the same thing per the spec.
struct Song: Codable, Identifiable, Hashable {
    let uid: String
    let languageOfOrigin: String
    let titleMain: [ScriptText]
    let authorUid: String
    let authorDisplay: [ScriptText]
    let topics: [String]
    let tags: [String]
    let verses: [Verse]
    let notes: [Note]
    let audioAvailable: Bool
    let audioFiles: [AudioTrack]

    enum CodingKeys: String, CodingKey {
        case uid
        case languageOfOrigin = "language_of_origin"
        case titleMain = "title_main"
        case authorUid = "author_uid"
        case authorDisplay = "author_display"
        case topics
        case tags
        case verses
        case notes
        case audioAvailable = "audio_available"
        case audioFiles = "audio_files"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        uid = try c.decode(String.self, forKey: .uid)
        languageOfOrigin = try c.decode(String.self, forKey: .languageOfOrigin)
        titleMain = try c.decode([ScriptText].self, forKey: .titleMain)
        authorUid = try c.decode(String.self, forKey: .authorUid)
        authorDisplay = try c.decodeIfPresent([ScriptText].self, forKey: .authorDisplay) ?? []
        topics = try c.decodeIfPresent([String].self, forKey: .topics) ?? []
        tags = try c.decodeIfPresent([String].self, forKey: .tags) ?? []
        verses = try c.decode([Verse].self, forKey: .verses)
        notes = try c.decodeIfPresent([Note].self, forKey: .notes) ?? []
        audioAvailable = try c.decode(Bool.self, forKey: .audioAvailable)
        audioFiles = try c.decodeIfPresent([AudioTrack].self, forKey: .audioFiles) ?? []
    }

    var id: String { uid }

    // MARK: - UI display bridge
    //
    // The Views/ViewModels in this slice were written against a flat sample model (title/author
    // strings, an `audio` bool). These computed properties derive that same shape from the
    // canonical fields above so the existing UI keeps working unmodified where possible. Slice 2
    // (UI work) may read the canonical fields directly instead.

    /// Best display title: prefers the Latin/IAST rendering, falls back to the first available
    /// script, with inline master-text flags resolved (see `ScriptText.displayText`).
    var title: String {
        (titleMain.first(where: { $0.scriptCode == "Latn" }) ?? titleMain.first)?.displayText ?? uid
    }

    /// Best display author name from this song's denormalized `authorDisplay` (song.md: "for
    /// display without a join"). Falls back to the raw `authorUid` if no display name was shipped.
    var author: String {
        (authorDisplay.first(where: { $0.scriptCode == "Latn" }) ?? authorDisplay.first)?.displayText ?? authorUid
    }

    var audio: Bool { audioAvailable }

    // MARK: - Script-aware header text (docs/screens/song-detail.md — "title/author in the current script")

    /// Title in the reader's chosen script, with the same fallback chain as the verse body: exact
    /// script → IAST/Latin → first available. Flags resolved for display. In the canonical corpus
    /// `title_main` carries a native (Beng) + IAST rendering, so this yields the native title when a
    /// native script is chosen and the romanization otherwise.
    func title(inScript scriptCode: String) -> String {
        let match = titleMain.first(where: { $0.scriptCode == scriptCode })
            ?? titleMain.first(where: { $0.scriptCode == "Latn" })
            ?? titleMain.first
        return match?.displayText ?? uid
    }

    /// Author name in the reader's chosen script, falling back across scripts and finally to the raw
    /// `authorUid` (which, for much of this corpus, is itself a readable native-script name).
    func author(inScript scriptCode: String) -> String {
        let match = authorDisplay.first(where: { $0.scriptCode == scriptCode })
            ?? authorDisplay.first(where: { $0.scriptCode == "Latn" })
            ?? authorDisplay.first
        return match?.displayText ?? authorUid
    }
}

import Foundation

/// `kind` discriminator for `SongGroup` (docs/data/collections.md, spec v1).
enum SongGroupKind: String, Codable {
    case book
    case topic
    case collection
}

/// Canonical `SongGroup` entity — see docs/data/collections.md (spec v1).
///
/// The shared shape behind Book / Topic / Collection: a titled set of song references,
/// discriminated by `kind`. `Book.swift`, `Topic.swift`, and `Collection.swift` are thin
/// UI-facing projections of this type (kept so the existing Library/Home/Collections Views, which
/// predate this spec, keep compiling with their original field names).
///
/// The corpus generation (pipeline/converted) now ships `song_groups.json` alongside the 703
/// song files: 19 `book` + 74 `topic` groupings (184 distinct songs), generated from the Śrī
/// Gauḍīya Gīti-guccha songbook's Contents hierarchy. `SongRepository.songGroups(kind:)` decodes it
/// and filters by `kind`; no `collection`-kind entries ship, so that kind still resolves to `[]`.
struct SongGroup: Codable, Identifiable, Hashable {
    let uid: String
    let kind: SongGroupKind
    let titles: [ScriptText]
    let songUids: [String]
    let ordered: Bool
    let color: String?

    enum CodingKeys: String, CodingKey {
        case uid, kind, titles
        case songUids = "song_uids"
        case ordered, color
    }

    var id: String { uid }

    var primaryTitle: String {
        (titles.first(where: { $0.scriptCode == "Latn" }) ?? titles.first)?.displayText ?? uid
    }
}

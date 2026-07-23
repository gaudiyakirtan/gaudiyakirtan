import Foundation

enum CollectionType: String, CaseIterable, Identifiable {
    case bookmark = "Bookmark"
    case playlist = "Playlist"

    var id: String { self.rawValue }
}

/// UI-facing projection of a `SongGroup` with `kind == .collection` (docs/data/collections.md).
/// The canonical spec-conformant model is `SongGroup` (Models/SongGroup.swift); `type` (bookmark vs.
/// playlist) is a UI-only distinction with no equivalent on `SongGroup`. `song_groups.json` ships
/// only `book`/`topic` entries (no `collection`-kind groupings — those are user-curated, not
/// songbook-derived), so `SongRepository.songGroups(kind: .collection)` — and therefore this list —
/// stays empty for now; the Collections tab correctly shows its empty state until that ships.
struct Collection: Identifiable, Hashable {
    let id: String
    let name: String
    let type: CollectionType
    let songIds: [String]

    init(songGroup: SongGroup, type: CollectionType) {
        self.id = songGroup.uid
        self.name = songGroup.primaryTitle
        self.type = type
        self.songIds = songGroup.songUids
    }
}

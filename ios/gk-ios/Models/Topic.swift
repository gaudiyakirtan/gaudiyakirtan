import Foundation

/// UI-facing projection of a `SongGroup` with `kind == .topic` (docs/data/collections.md). The
/// canonical spec-conformant model is `SongGroup` (Models/SongGroup.swift). 74 topics now ship in
/// `song_groups.json`, so `SongRepository.songGroups(kind: .topic)` — and therefore this list —
/// resolves to real thematic groupings (e.g. "Prayers For Mercy", "The Glories of Śrī Guru").
struct Topic: Identifiable, Hashable {
    let id: String
    let name: String
    let songUids: [String]

    init(songGroup: SongGroup) {
        self.id = songGroup.uid
        self.name = songGroup.primaryTitle
        self.songUids = songGroup.songUids
    }

    /// Deterministic placeholder count, kept only as a defensive fallback so `TopicCard`'s badge
    /// still shows something if a topic with zero member songs is ever rendered (every topic in the
    /// current `song_groups.json` generation has ≥1 song, so this path is not exercised today).
    var demoSongCount: Int {
        (name.count * 3) % 20 + 1
    }
}

import Foundation

/// UI-facing projection of a `SongGroup` with `kind == .book` (docs/data/collections.md). The
/// canonical spec-conformant model is `SongGroup` (Models/SongGroup.swift); this type keeps the
/// field names `BookCard`/`BooksScrollView`/`LibraryView` already expect (author/image/year, which
/// have no equivalent on `SongGroup`). 19 books now ship in `song_groups.json`
/// (`SongRepository.songGroups(kind: .book)`); `image` is populated by the caller from
/// `ImageConfig.bookCoverURL(forTitle:)` where the title matches a known cover slug, `nil`
/// otherwise (falls back to `BookCard`'s themed accent color).
struct Book: Identifiable, Hashable {
    let id: String
    let title: String
    let author: String?
    let slug: String
    let uid: String
    let image: String?
    let songCount: Int?
    let year: String?

    init(songGroup: SongGroup, author: String? = nil, image: String? = nil, year: String? = nil) {
        self.id = songGroup.uid
        self.uid = songGroup.uid
        self.title = songGroup.primaryTitle
        self.slug = songGroup.uid
        self.author = author
        self.image = image
        self.songCount = songGroup.songUids.isEmpty ? nil : songGroup.songUids.count
        self.year = year
    }
}

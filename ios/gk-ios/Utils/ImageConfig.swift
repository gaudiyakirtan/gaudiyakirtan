import Foundation

/// Image asset configuration (docs/screens/player.md "Related assets on the same bucket" +
/// docs/data/collections.md "Cover images").
///
/// Both artist portraits and book covers live on the same public `gaudiyakirtan` S3 bucket as the
/// audio (see `AudioConfig`), under their own prefixes. **Most of these assets 404** — only a
/// handful of artist codes and three book-cover slugs (`gaura`, `nitai`, `radha`) actually exist on
/// the bucket today — so every URL this type returns is a *best-effort guess*, and callers must
/// always degrade gracefully (an `AsyncImage` placeholder), never crash or block on the load.
enum ImageConfig {
    /// The public `gaudiyakirtan` S3 bucket root — same host as `AudioConfig.audioBaseURL`, no auth.
    static let imageBaseURL = "https://gaudiyakirtan.s3.amazonaws.com/"

    // MARK: - Artist portraits (docs/screens/player.md "Now Playing" artwork)

    /// The best-effort portrait URL for the artist performing `trackUid`, or `nil` if a code can't
    /// be derived. E.g. `"bvsm-1"` → `.../artists/bvsm.jpg`.
    static func artistPortraitURL(forTrackUid trackUid: String) -> URL? {
        let code = artistCode(fromTrackUid: trackUid)
        guard !code.isEmpty,
              let encoded = code.addingPercentEncoding(withAllowedCharacters: .urlPathAllowed) else {
            return nil
        }
        return URL(string: imageBaseURL + "artists/" + encoded + ".jpg")
    }

    /// Every shipped `AudioTrack.uid` in the corpus is `"<code>-<take-number>"` (e.g. `"bvsm-1"`,
    /// `"tama-2"`, verified across all 76 distinct track uids) — the artist code is everything
    /// before the trailing numeric take. Falls back to the whole uid if it doesn't carry a
    /// trailing `-<digits>` suffix, so a future differently-shaped uid still yields *something*
    /// rather than an empty code.
    static func artistCode(fromTrackUid trackUid: String) -> String {
        var parts = trackUid.split(separator: "-")
        if let last = parts.last, !last.isEmpty, last.allSatisfy({ $0.isASCII && $0.isNumber }) {
            parts.removeLast()
        }
        return parts.joined(separator: "-")
    }

    // MARK: - Book covers (docs/data/collections.md "Cover images")

    /// The best-effort cover URL for a book titled `title`, or `nil` when the title doesn't match
    /// one of the three known cover slugs — `BookCard` already falls back to its themed accent
    /// color in that case (collections.md "others use color").
    static func bookCoverURL(forTitle title: String) -> URL? {
        guard let slug = bookCoverSlug(forTitle: title) else { return nil }
        return URL(string: imageBaseURL + "collections/" + slug + ".jpg")
    }

    /// Matches a book title to one of the bucket's three known deity-portrait cover slugs
    /// (collections.md: "gaura, nitai, radha") by keyword, diacritic/case-insensitively. Checked
    /// against the shipped 19 books: only "Śrī Gaurāṅga" → `gaura` and the two Rādhā books
    /// ("Śrī Rādhā", "Śrī Śrī Rādhā-kṛṣṇa") → `radha` match today; `nitai` has no current book
    /// title match but is kept so a future Nityānanda-titled book picks it up automatically.
    static func bookCoverSlug(forTitle title: String) -> String? {
        let normalized = StringUtils.normalizeForSearch(title)
        if normalized.contains("gaura") { return "gaura" }
        if normalized.contains("nitai") || normalized.contains("nityananda") { return "nitai" }
        if normalized.contains("radha") { return "radha" }
        return nil
    }
}

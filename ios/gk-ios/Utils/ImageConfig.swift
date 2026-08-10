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

    // MARK: - Month banner artwork (docs/screens/home.md §1 "Artwork")

    /// Bundled banner artwork for a Gaudiya lunar month, or `nil` when this month ships no file.
    ///
    /// The one image path in this type that is deliberately **not** on the S3 bucket. Two reasons:
    /// the bucket has no `months/` prefix at all, and web self-hosts these files precisely so they
    /// are never hotlinked (`web/public/assets/months/CREDITS.md`). An offline-first app has no
    /// business fetching its hero artwork over the radio either, so the same files ride in the app
    /// bundle — Android does the same from `assets/months/`.
    ///
    /// **Most months ship no file, and that is the normal path** — only Vāmana has artwork today.
    /// Callers draw their gradient in that case; it is never an error state.
    static func monthArtworkURL(forGaudiyaMonth gaudiyaMonth: String) -> URL? {
        let slug = monthSlug(forGaudiyaMonth: gaudiyaMonth)
        guard !slug.isEmpty else { return nil }
        // Loose resources are flattened to the bundle root by the project's file-system-synchronized
        // group (see `SongRepository`'s bundling note), so the root lookup is the one that hits
        // today; the `months` probe is a cheap guard in case that behavior ever changes.
        return Bundle.main.url(forResource: slug, withExtension: "jpg")
            ?? Bundle.main.url(forResource: slug, withExtension: "jpg", subdirectory: "months")
    }

    /// `"Śrīdhara"` → `"sridhara"`. Mirrors web's `monthImageUrlFor()` (`web/src/config.ts`) and
    /// Android's `ImageConfig.monthSlug` exactly — strip diacritics, lowercase, drop everything
    /// non-alphanumeric — so all three platforms look for the same filename and one dropped-in image
    /// serves them all.
    ///
    /// Deliberately **not** `StringUtils.normalizeForSearch`: that additionally folds v→b and j→y for
    /// Gauḍīya transliteration search, which would turn `"Viṣṇu"` into `"bisnu"` and miss the file.
    static func monthSlug(forGaudiyaMonth gaudiyaMonth: String) -> String {
        let folded = gaudiyaMonth.folding(options: .diacriticInsensitive, locale: nil).lowercased()
        var slug = ""
        slug.reserveCapacity(folded.count)
        for character in folded where slugAllowedCharacters.contains(character) {
            slug.append(character)
        }
        return slug
    }

    private static let slugAllowedCharacters: Set<Character> = Set("abcdefghijklmnopqrstuvwxyz0123456789")
}

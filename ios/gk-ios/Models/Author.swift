import Foundation

/// Canonical `Author` entity — see docs/data/author.md (spec v1).
///
/// The ācārya/composer of one or more Songs. The shipped corpus (pipeline/converted) has no
/// standalone author registry file — an author's display name only exists denormalized on each
/// Song as `author_display`. `SongRepository` derives the Author list by scanning bundled songs for
/// `(author_uid, author_display)` pairs (author.md "Platform notes": "Authors are derived from /
/// consistent with the shipped song set"). This type stays `Codable` for spec fidelity and in case
/// a future pipeline slice ships a dedicated authors file.
struct Author: Codable, Identifiable, Hashable {
    let uid: String
    let names: [ScriptText]
    let bio: [String]

    enum CodingKeys: String, CodingKey {
        case uid, names, bio
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        uid = try c.decode(String.self, forKey: .uid)
        names = try c.decode([ScriptText].self, forKey: .names)
        bio = try c.decodeIfPresent([String].self, forKey: .bio) ?? []
    }

    /// Direct constructor used by `SongRepository` when deriving authors from songs (no on-disk
    /// author registry to decode from — see the type doc above).
    init(uid: String, names: [ScriptText], bio: [String] = []) {
        self.uid = uid
        self.names = names
        self.bio = bio
    }

    var id: String { uid }

    /// Best display name: prefers Latin/IAST, falls back to the first available script.
    var name: String {
        (names.first(where: { $0.scriptCode == "Latn" }) ?? names.first)?.displayText ?? uid
    }

    /// The spec has no author-image field, and the corpus carries no author imagery. Kept so
    /// `AuthorCard`'s existing `AsyncImage(url:)` call keeps compiling unmodified; an empty string
    /// already renders the card's placeholder.
    var image: String { "" }
}

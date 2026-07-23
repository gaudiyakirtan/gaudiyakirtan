package com.gaudiyakirtan.data

/**
 * Single config object for remote images on the public `gaudiyakirtan` S3 bucket, per
 * docs/screens/player.md ("Related assets on the same bucket... artist portraits
 * `artists/<artist_code>.jpg`, collection covers `collections/<name>.jpg`") and
 * docs/data/collections.md ("Cover images... `collections/<slug>.jpg`"). Mirrors [AudioConfig]'s
 * single-constant pattern so the bucket layout can change in one place.
 *
 * Both paths are explicitly **best-effort** -- collections.md: "a few books have covers... others
 * use color"; "most slugs 404" -- so every caller must render a graceful placeholder/fallback on
 * load failure (Coil's `error =` painter), never crash or block on these URLs resolving.
 */
object ImageConfig {
    const val IMAGE_BASE: String = "https://gaudiyakirtan.s3.amazonaws.com/"

    /** `artists/<code>.jpg` -- the performing artist's portrait for the Now-Playing credit. */
    fun artistImageUrl(code: String): String = "${IMAGE_BASE}artists/$code.jpg"

    /** `collections/<slug>.jpg` -- a book's optional cover art. */
    fun bookCoverUrl(slug: String): String = "${IMAGE_BASE}collections/$slug.jpg"

    /**
     * Derives the artist "code" from an [com.gaudiyakirtan.myapplication.models.AudioTrack.uid]
     * (e.g. `"bvsm-1"` -> `"bvsm"`, per docs/screens/player.md): strips a trailing `-<digits>`
     * take-number suffix. Falls back to the raw uid when it doesn't end in one.
     */
    fun artistCode(trackUid: String): String {
        val idx = trackUid.lastIndexOf('-')
        if (idx <= 0) return trackUid
        val suffix = trackUid.substring(idx + 1)
        return if (suffix.isNotEmpty() && suffix.all { it.isDigit() }) {
            trackUid.substring(0, idx)
        } else {
            trackUid
        }
    }

    /**
     * Best-effort book-cover slug derived from a book [com.gaudiyakirtan.myapplication.models.SongGroup]'s
     * `uid` (e.g. `"book-sri-radha"` -> `"radha"`): strips the `"book-"` prefix and repeated
     * honorific prefixes (`"sri-"`, `"srila-"`, `"sri-sri-"`).
     *
     * NOTE: this is **not** a documented uid->slug mapping -- docs/data/collections.md only names
     * three known bucket slugs (`gaura`, `nitai`, `radha`) without specifying how every book uid
     * maps to one. This heuristic degrades gracefully (an unmatched slug 404s -> caller falls back
     * to [com.gaudiyakirtan.myapplication.ui.theme.getMediaColor]), so a wrong guess never breaks
     * anything, but it will only actually hit a real cover for uids it happens to match (confirmed:
     * `"book-sri-radha"` -> `"radha"`).
     */
    fun bookSlugFromGroupUid(groupUid: String): String {
        var slug = groupUid.removePrefix("book-")
        var changed = true
        while (changed) {
            changed = false
            for (prefix in HONORIFIC_PREFIXES) {
                if (slug.startsWith(prefix)) {
                    slug = slug.removePrefix(prefix)
                    changed = true
                }
            }
        }
        return slug
    }

    private val HONORIFIC_PREFIXES = listOf("sri-sri-", "srila-", "sri-")
}

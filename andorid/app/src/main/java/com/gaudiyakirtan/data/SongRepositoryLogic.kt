package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.ScriptText
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.SongGroup

/**
 * Pure, `Context`/IO-free derivation logic shared by [SongRepository] and exercised directly by JVM
 * unit tests (`SongRepositoryLogicTest`) that cannot construct a real `android.content.Context` (no
 * Robolectric in this offline build). Each function here mirrors exactly what the repository does
 * once its asset reads have already produced decoded data -- the repository itself only adds the
 * asset-reading/caching plumbing around these.
 */
object SongRepositoryLogic {

    /**
     * The [Author] catalog derived from the manifest, per [SongRepository.getAuthors]'s doc
     * comment: the shipped corpus has no standalone authors dataset, so one representative full
     * [Song] per distinct `author_uid` is resolved (via [songForUid]) to obtain its
     * `author_display`; a song with no resolvable display name falls back to the bare `author_uid`
     * (per docs/data/author.md's "uid fallback when empty" rule).
     */
    fun buildAuthors(manifest: List<ManifestEntry>, songForUid: (String) -> Song?): List<Author> =
        manifest
            .distinctBy { it.authorUid }
            .map { entry ->
                val song = songForUid(entry.uid)
                Author(
                    uid = entry.authorUid,
                    names = song?.authorDisplay?.takeIf { it.isNotEmpty() }
                        ?: listOf(ScriptText(scriptCode = "Latn", text = entry.authorUid))
                )
            }

    /**
     * The member songs of [group], resolved against [manifest] and following `song_uids` order --
     * authoritative when `ordered == true` (docs/data/collections.md invariant: "song_uids order is
     * authoritative for display"), and a perfectly reasonable stable order when `ordered == false`
     * (topics) since order isn't meaningful there either way. A `song_uids` entry with no matching
     * manifest row is silently skipped -- a group referencing a uid outside the shipped set should
     * never crash a browse surface.
     */
    fun songsInGroup(group: SongGroup, manifest: List<ManifestEntry>): List<ManifestEntry> {
        val byUid = manifest.associateBy { it.uid }
        return group.songUids.mapNotNull { byUid[it] }
    }
}

package com.gaudiyakirtan.data

import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.models.SongGroupKind
import java.io.File
import kotlinx.serialization.decodeFromString
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * Unit tests for [SongRepositoryLogic] -- the pure derivation logic behind
 * [SongRepository.getAuthors] and [SongRepository.getSongsInGroup] -- run against the real bundled
 * manifest/song_groups data (via plain `File` reads, since a JVM unit test has no
 * `android.content.Context`/`AssetManager` and this offline build has no Robolectric).
 */
class SongRepositoryLogicTest {

    private val assetsDir = TestAssets.dir

    private val manifest: List<ManifestEntry> by lazy {
        SongJson.instance.decodeFromString(File(assetsDir, "manifest.json").readText())
    }

    private val groups: List<SongGroup> by lazy {
        SongJson.instance.decodeFromString(File(assetsDir, "song_groups.json").readText())
    }

    private fun songByUid(uid: String): Song? {
        val file = File(assetsDir, "songs/$uid.json")
        if (!file.exists()) return null
        return SongJson.instance.decodeFromString(file.readText())
    }

    @Test
    fun `buildAuthors resolves exactly one Author per distinct author_uid`() {
        val authors = SongRepositoryLogic.buildAuthors(manifest) { uid -> songByUid(uid) }

        val distinctAuthorUids = manifest.map { it.authorUid }.distinct()
        assertEquals(distinctAuthorUids.size, authors.size)
        assertEquals(distinctAuthorUids.toSet(), authors.map { it.uid }.toSet())

        // Every author resolves to at least one display name -- real author_display, or (per
        // docs/data/author.md "uid fallback when empty") the bare uid.
        assertTrue(authors.all { it.names.isNotEmpty() })
    }

    @Test
    fun `buildAuthors falls back to the bare uid when songForUid resolves nothing`() {
        val manifestSubset = manifest.take(1)
        val authors = SongRepositoryLogic.buildAuthors(manifestSubset) { null }

        assertEquals(1, authors.size)
        assertEquals(manifestSubset.first().authorUid, authors.first().uid)
        assertEquals(manifestSubset.first().authorUid, authors.first().names.first().text)
    }

    @Test
    fun `songsInGroup preserves shipped order for every ordered book`() {
        // Was pinned to a `book-sri-guru` uid that the corpus does not ship (the Sri Guru grouping
        // is `topic-sriguru`, and it is unordered), so this threw NoSuchElementException rather
        // than testing anything. The invariant worth holding is the spec one
        // (docs/data/collections.md): for an `ordered` group, song_uids order is authoritative.
        val books = groups.filter { it.kind == SongGroupKind.BOOK && it.ordered }
        assertTrue("the corpus should ship at least one ordered book", books.isNotEmpty())

        books.forEach { book ->
            val resolved = SongRepositoryLogic.songsInGroup(book, manifest)
            assertTrue("${book.uid} should resolve to at least one song", resolved.isNotEmpty())
            assertEquals(
                "${book.uid} must resolve in its shipped song_uids order",
                book.songUids.filter { uid -> manifest.any { it.uid == uid } },
                resolved.map { it.uid }
            )
        }
    }

    @Test
    fun `songsInGroup silently skips a song_uid outside the shipped manifest`() {
        val fakeGroup = SongGroup(
            uid = "topic-test",
            kind = SongGroupKind.TOPIC,
            titles = emptyList(),
            songUids = listOf(manifest.first().uid, "NOT-A-REAL-UID"),
            ordered = false
        )
        val resolved = SongRepositoryLogic.songsInGroup(fakeGroup, manifest)

        assertEquals(1, resolved.size)
        assertEquals(manifest.first().uid, resolved.first().uid)
    }
}

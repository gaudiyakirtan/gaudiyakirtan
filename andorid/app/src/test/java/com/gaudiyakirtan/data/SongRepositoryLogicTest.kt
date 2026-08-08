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
    fun `songsInGroup resolves the Sri Namastaka book to its NM-prefixed songs in shipped order`() {
        // docs/data/collections.md: "verified against the songs' uid prefixes"; this book is
        // `ordered = true`, so song_uids order is authoritative per the spec invariant.
        val namastaka = groups.first { it.uid == "book-srinamastaka" }
        val resolved = SongRepositoryLogic.songsInGroup(namastaka, manifest)

        assertEquals(namastaka.songUids.size, resolved.size)
        assertTrue(resolved.isNotEmpty())
        assertTrue(
            "every Sri Namastaka book song should have an NM-prefixed uid",
            resolved.all { it.uid.startsWith("NM") }
        )
        assertEquals(namastaka.songUids, resolved.map { it.uid })
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

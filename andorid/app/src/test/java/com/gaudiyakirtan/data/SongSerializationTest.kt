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
 * Exercises [SongJson] (the exact production kotlinx.serialization config) against the *real*
 * bundled corpus files in `app/src/main/assets/` -- not synthetic fixtures -- so a schema drift
 * between docs/data specs and the shipped pipeline output (see Song.kt's doc comments on
 * `AudioTrack`/`Note` being modeled after the real corpus rather than the literal spec text) would
 * fail this test.
 */
class SongSerializationTest {

    private val assetsDir = TestAssets.dir

    @Test
    fun `decodes a multi-take song with correct SerialName mapping`() {
        // R8 ships 19 audio_files -- the most takes of any song in the corpus -- a good stress case
        // for the multi-take AudioTrack list decode (docs/screens/player.md "a song may have
        // multiple takes, up to ~9" -- R8 is the real outlier well past that).
        val text = File(assetsDir, "songs/R8.json").readText()
        val song = SongJson.instance.decodeFromString<Song>(text)

        assertEquals("R8", song.uid)
        assertTrue("R8 should have audio_available = true", song.audioAvailable)
        assertEquals(19, song.audioFiles.size)

        val first = song.audioFiles.first()
        assertEquals("brsm-1", first.uid)
        assertEquals("R8-brsm-1.mp3", first.filename)
        assertEquals("Srila BR Sridhara Gosvami Maharaja", first.artist)

        // Multiple takes by the same artist share a code prefix with an incrementing take number
        // -- the exact pattern ImageConfig.artistCode strips to derive an artist portrait code.
        val tamaTakes = song.audioFiles.filter { it.uid.startsWith("tama-") }
        assertEquals(6, tamaTakes.size)
        assertTrue(tamaTakes.all { it.artist == "Tamal Krsna das" })

        // author_uid / author_display / title_main snake_case -> camelCase @SerialName mapping.
        assertTrue(song.authorUid.isNotBlank())
        assertTrue("author_display should decode to at least one ScriptText", song.authorDisplay.isNotEmpty())
        assertTrue("title_main should decode to at least one ScriptText", song.titleMain.isNotEmpty())

        // verses decode too, with source_text_master -> sourceTextMaster.
        assertTrue(song.verses.isNotEmpty())
        assertTrue(song.verses.first().sourceTextMaster.isNotEmpty())
    }

    @Test
    fun `decodes the manifest's 703 ManifestEntry rows with snake_case fields`() {
        val text = File(assetsDir, "manifest.json").readText()
        val manifest = SongJson.instance.decodeFromString<List<ManifestEntry>>(text)

        assertEquals(703, manifest.size)
        val r8 = manifest.first { it.uid == "R8" }
        assertTrue(r8.audioAvailable)
        assertTrue(r8.md5.isNotBlank())
        assertTrue(r8.primaryTitle.text.isNotBlank())
    }

    @Test
    fun `decodes song_groups json into 93 SongGroups with kind and song_uids`() {
        val text = File(assetsDir, "song_groups.json").readText()
        val groups = SongJson.instance.decodeFromString<List<SongGroup>>(text)

        assertEquals(93, groups.size)
        assertEquals(19, groups.count { it.kind == SongGroupKind.BOOK })
        assertEquals(74, groups.count { it.kind == SongGroupKind.TOPIC })

        val sriGuru = groups.first { it.uid == "book-sri-guru" }
        assertEquals(SongGroupKind.BOOK, sriGuru.kind)
        assertTrue(sriGuru.ordered)
        assertEquals(listOf("G2", "G3", "G6", "G7", "G8", "G9"), sriGuru.songUids)
    }
}

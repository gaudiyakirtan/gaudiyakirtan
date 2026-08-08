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
    fun `decodes every manifest row with snake_case fields`() {
        val text = File(assetsDir, "manifest.json").readText()
        val manifest = SongJson.instance.decodeFromString<List<ManifestEntry>>(text)

        // Deliberately NOT a hardcoded row count. CLAUDE.md: corpus totals are not hand-written,
        // they go stale -- this assertion used to read `assertEquals(703, ...)` against a corpus
        // that ships 702 and failed for a year without indicating any real defect. What matters is
        // that the whole file decodes and every row carries the fields the repository depends on.
        assertTrue("manifest should not be empty", manifest.isNotEmpty())
        assertTrue(
            "every manifest row needs a uid, an md5 and a non-blank primary title",
            manifest.all { it.uid.isNotBlank() && it.md5.isNotBlank() && it.primaryTitle.text.isNotBlank() }
        )
        assertEquals(
            "manifest uids must be unique -- the repository keys on them",
            manifest.size,
            manifest.map { it.uid }.toSet().size
        )

        val r8 = manifest.first { it.uid == "R8" }
        assertTrue(r8.audioAvailable)
        assertTrue(r8.md5.isNotBlank())
        assertTrue(r8.primaryTitle.text.isNotBlank())
    }

    @Test
    fun `decodes song_groups json into SongGroups with kind and song_uids`() {
        val text = File(assetsDir, "song_groups.json").readText()
        val groups = SongJson.instance.decodeFromString<List<SongGroup>>(text)

        // Structural invariants, not counts (see the manifest test above for why).
        assertTrue("song_groups should not be empty", groups.isNotEmpty())
        assertTrue("both group kinds should be present", groups.any { it.kind == SongGroupKind.BOOK })
        assertTrue("both group kinds should be present", groups.any { it.kind == SongGroupKind.TOPIC })
        assertEquals(
            "every group's kind must decode -- no group may fall outside book|topic",
            groups.size,
            groups.count { it.kind == SongGroupKind.BOOK || it.kind == SongGroupKind.TOPIC }
        )
        assertTrue("every group needs a uid", groups.all { it.uid.isNotBlank() })
        assertTrue("every group should resolve to at least one song", groups.all { it.songUids.isNotEmpty() })

        // Books are the ordered kind: song_uids order is authoritative (docs/data/collections.md).
        assertTrue(
            "every book should be ordered",
            groups.filter { it.kind == SongGroupKind.BOOK }.all { it.ordered }
        )
    }
}

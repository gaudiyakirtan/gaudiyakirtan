package com.gaudiyakirtan.data

import android.content.Context
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.SongGroup
import java.io.IOException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString

private const val MANIFEST_ASSET_PATH = "manifest.json"
private const val SONGS_ASSET_DIR = "songs"
private const val SONG_GROUPS_ASSET_PATH = "song_groups.json"

/**
 * Offline-first data access for the canonical Gaudiya Kirtan corpus.
 *
 * Per docs/data/README.md + docs/WORKFLOW.md, the app never fetches song data over the network --
 * the entire corpus (703 songs + the manifest) ships inside `assets/`, copied verbatim from
 * pipeline/converted (every song JSON file plus the manifest). This repository is a pure asset reader:
 *  - [getManifest] loads `assets/manifest.json` once for every list/search/browse screen.
 *  - [getSongByUid] loads one `assets/songs/<uid>.json` file, only when a detail screen is opened.
 *  - [getAuthors] derives the Author catalog from the song set itself, since the corpus does not
 *    ship a standalone authors dataset (see the Author model's doc comment + slice-1 report).
 *  - [getSongGroups] loads `assets/song_groups.json` (93 groups: 19 books + 74 topics, per
 *    docs/data/collections.md) once and caches it; [getSongsInGroup] resolves a group's member
 *    songs against the manifest.
 *
 * All public functions are `suspend` and do their file/JSON work on [Dispatchers.IO]; nothing here
 * touches the main thread. Room/disk caching is intentionally not added this slice -- decoded
 * results are cached in memory only, which is sufficient for offline reads of bundled assets.
 */
class SongRepository private constructor(context: Context) {

    private val appContext = context.applicationContext

    private val json = SongJson.instance

    private val manifestMutex = Mutex()
    private var manifestCache: List<ManifestEntry>? = null

    private val authorsMutex = Mutex()
    private var authorsCache: List<Author>? = null

    private val songGroupsMutex = Mutex()
    private var songGroupsCache: List<SongGroup>? = null

    private val songCache = java.util.concurrent.ConcurrentHashMap<String, Song>()

    /** The full catalog index (one entry per shipped song). Cached after the first read. */
    suspend fun getManifest(): List<ManifestEntry> = withContext(Dispatchers.IO) {
        manifestCache?.let { return@withContext it }
        manifestMutex.withLock {
            manifestCache?.let { return@withLock it }
            val text = appContext.assets.open(MANIFEST_ASSET_PATH)
                .bufferedReader(Charsets.UTF_8)
                .use { it.readText() }
            val entries = json.decodeFromString<List<ManifestEntry>>(text)
            manifestCache = entries
            entries
        }
    }

    /**
     * The full [Song] for one `uid`, or `null` if no such song is bundled. Loaded on demand (the
     * song-detail screen) and cached in memory afterward.
     */
    suspend fun getSongByUid(uid: String): Song? = withContext(Dispatchers.IO) {
        songCache[uid]?.let { return@withContext it }
        try {
            val text = appContext.assets.open("$SONGS_ASSET_DIR/$uid.json")
                .bufferedReader(Charsets.UTF_8)
                .use { it.readText() }
            val song = json.decodeFromString<Song>(text)
            songCache[uid] = song
            song
        } catch (e: IOException) {
            null
        }
    }

    /**
     * The Author catalog, derived from the shipped song set (one representative full [Song] per
     * distinct `author_uid` is loaded to obtain its `author_display`, rather than every song, since
     * the manifest does not carry `author_display`). Cached after the first computation.
     */
    suspend fun getAuthors(): List<Author> = withContext(Dispatchers.IO) {
        authorsCache?.let { return@withContext it }
        authorsMutex.withLock {
            authorsCache?.let { return@withLock it }
            val manifest = getManifest()
            // getSongByUid is suspend, so resolve every representative song up front, then hand the
            // synchronous lookup to the pure SongRepositoryLogic.buildAuthors.
            val songsByUid = manifest.distinctBy { it.authorUid }
                .associate { it.uid to getSongByUid(it.uid) }
            val authors = SongRepositoryLogic.buildAuthors(manifest) { uid -> songsByUid[uid] }
            authorsCache = authors
            authors
        }
    }

    /**
     * Book / Topic / Collection groupings (docs/data/collections.md `SongGroup`; 93 groups: 19
     * books + 74 topics). Loaded from `assets/song_groups.json` once and cached in memory.
     */
    suspend fun getSongGroups(): List<SongGroup> = withContext(Dispatchers.IO) {
        songGroupsCache?.let { return@withContext it }
        songGroupsMutex.withLock {
            songGroupsCache?.let { return@withLock it }
            val groups = try {
                val text = appContext.assets.open(SONG_GROUPS_ASSET_PATH)
                    .bufferedReader(Charsets.UTF_8)
                    .use { it.readText() }
                json.decodeFromString<List<SongGroup>>(text)
            } catch (e: IOException) {
                emptyList()
            }
            songGroupsCache = groups
            groups
        }
    }

    /**
     * [group]'s member songs, resolved against the manifest and following `song_uids` order --
     * authoritative for `ordered` groups (books), and a fine stable order for unordered ones
     * (topics). See [SongRepositoryLogic.songsInGroup].
     */
    suspend fun getSongsInGroup(group: SongGroup): List<ManifestEntry> =
        SongRepositoryLogic.songsInGroup(group, getManifest())

    companion object {
        @Volatile private var instance: SongRepository? = null

        fun getInstance(context: Context): SongRepository =
            instance ?: synchronized(this) {
                instance ?: SongRepository(context).also { instance = it }
            }
    }
}

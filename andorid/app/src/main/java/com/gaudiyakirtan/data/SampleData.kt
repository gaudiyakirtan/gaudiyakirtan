package com.gaudiyakirtan.data

import android.content.Context
import com.gaudiyakirtan.myapplication.models.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import java.util.UUID

/**
 * Data provider for the Gaudiya Kirtan application
 * Loads data from bundled songs.json asset file
 */
object SampleData {

    private val json = Json { ignoreUnknownKeys = true }
    private var seedData: SeedDataJson? = null

    /** Initialize with app context to load from assets */
    fun init(context: Context) {
        if (seedData != null) return
        try {
            val jsonString = context.assets.open("songs.json").bufferedReader().readText()
            seedData = json.decodeFromString<SeedDataJson>(jsonString)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    val authors: List<Author> get() = seedData?.authors?.map {
        Author(name = it.name, image = it.image ?: "")
    } ?: emptyList()

    val topics: List<Topic> get() = seedData?.topics?.map {
        Topic(name = it.topic)
    } ?: emptyList()

    val books: List<Book> get() = seedData?.books?.map {
        Book(title = it.title, author = it.author, slug = it.slug, uid = it.uid, image = it.image)
    } ?: emptyList()

    val songs: List<Song> get() = seedData?.songs?.map {
        Song(title = it.title, author = it.author ?: "Unknown", uid = it.uid, audio = it.audio ?: false, tags = it.tags ?: emptyList())
    } ?: emptyList()

    val verses: List<Verse> get() = seedData?.songs?.flatMap { song ->
        song.verses?.map { it.toVerse() } ?: emptyList()
    } ?: emptyList()

    /** Get verses for a specific song uid */
    fun versesForSong(uid: String): List<Verse> {
        val song = seedData?.songs?.find { it.uid == uid }
        return song?.verses?.map { it.toVerse() } ?: verses
    }

    // Collections (not in JSON, kept as defaults)
    val collections = listOf(
        Collection(name = "Favorites", type = CollectionType.BOOKMARK, songIds = listOf("N3", "S1", "E4")),
        Collection(name = "Kartik Songs", type = CollectionType.PLAYLIST, songIds = listOf("SQ2", "L5")),
        Collection(name = "IPBYS", type = CollectionType.PLAYLIST, songIds = listOf("E4", "N3")),
        Collection(name = "Memorize", type = CollectionType.BOOKMARK, songIds = listOf("S1", "SQ2", "L5"))
    )
}

// JSON data models for deserialization
@Serializable
data class SeedDataJson(
    val songs: List<SeedSongJson>,
    val authors: List<SeedAuthorJson>? = null,
    val topics: List<SeedTopicJson>? = null,
    val books: List<SeedBookJson>? = null
)

@Serializable
data class SeedSongJson(
    val uid: String,
    val title: String,
    val author: String? = null,
    val audio: Boolean? = null,
    val tags: List<String>? = null,
    val topics: List<String>? = null,
    val verses: List<SeedVerseJson>? = null
)

@Serializable
data class SeedVerseJson(
    val index: Int = 0,
    val language: String? = null,
    val original: List<String> = emptyList(),
    val transliterations: List<SeedTransliterationJson> = emptyList(),
    val wordToWords: List<SeedWordToWordJson> = emptyList(),
    val translations: List<SeedTranslationJson> = emptyList()
) {
    fun toVerse(): Verse = Verse(
        language = language,
        original = original,
        transliterations = transliterations.map {
            Transliteration(id = UUID.randomUUID(), language = it.language, text = it.text)
        },
        wordToWords = wordToWords.map {
            WordToWord(id = UUID.randomUUID(), language = it.language, words = it.words)
        },
        translations = translations.map {
            Translation(id = UUID.randomUUID(), language = it.language, text = it.text)
        }
    )
}

@Serializable
data class SeedTransliterationJson(val language: String, val text: List<String>)

@Serializable
data class SeedWordToWordJson(val language: String, val words: List<List<String>>)

@Serializable
data class SeedTranslationJson(val language: String, val text: String)

@Serializable
data class SeedAuthorJson(
    val uid: String, val name: String, val slug: String,
    val image: String? = null, val songs: List<String>? = null, val books: List<String>? = null
)

@Serializable
data class SeedTopicJson(
    val uid: String, val topic: String, val slug: String, val songs: List<String>? = null
)

@Serializable
data class SeedBookJson(
    val uid: String, val title: String, val author: String? = null,
    val slug: String, val image: String? = null
)

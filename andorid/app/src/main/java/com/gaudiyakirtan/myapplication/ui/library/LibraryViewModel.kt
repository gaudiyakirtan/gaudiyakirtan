package com.gaudiyakirtan.myapplication.ui.library

import android.app.Application
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.models.SongGroupKind
import com.gaudiyakirtan.myapplication.models.name
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.utils.StringUtils
import kotlinx.coroutines.flow.launchIn
import kotlinx.coroutines.flow.onEach
import kotlinx.coroutines.launch

/**
 * ViewModel for the Library screen
 * Manages data and state for different categories (Songs, Authors, Topics, Books).
 *
 * Backed by [SongRepository]: songs come from the manifest (docs/data/manifest.md), never full
 * [com.gaudiyakirtan.myapplication.models.Song] objects, since this screen only needs list fields.
 * Topics/Books are the `SongGroup` groupings (docs/data/collections.md; 93 groups: 19 books + 74
 * topics) filtered by [SongGroupKind].
 */
class LibraryViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)

    /** Reader's chosen list-title script (docs/screens/settings.md `listLanguage`), observed live. */
    var listLanguage: String by mutableStateOf(settingsRepository.settings.value.listLanguage)
        private set

    // Categories
    enum class Category(val title: String) {
        SONGS("Songs"),
        AUTHORS("Authors"),
        TOPICS("Topics"),
        BOOKS("Books")
    }

    // State
    var selectedCategory by mutableStateOf(Category.SONGS)
        private set

    var searchText by mutableStateOf("")
        private set

    // Data, loaded from the repository (see init below)
    var songs: List<ManifestEntry> by mutableStateOf(emptyList())
        private set

    var authors: List<Author> by mutableStateOf(emptyList())
        private set

    /** `author_uid` -> display name, for resolving a [ManifestEntry.authorUid] in list rows. */
    var authorNames: Map<String, String> by mutableStateOf(emptyMap())
        private set

    /**
     * `author_uid` -> number of songs by that author, over the full (unfiltered) manifest.
     * Used by the Authors tab (docs/screens/browse.md: "header is name + song count only").
     */
    val authorSongCounts: Map<String, Int>
        get() = songs.groupingBy { it.authorUid }.eachCount()

    /** Book/Topic `SongGroup`s (docs/data/collections.md), filtered by [SongGroupKind]. */
    var topics: List<SongGroup> by mutableStateOf(emptyList())
        private set

    var books: List<SongGroup> by mutableStateOf(emptyList())
        private set

    init {
        viewModelScope.launch {
            songs = repository.getManifest()
        }
        viewModelScope.launch {
            val loadedAuthors = repository.getAuthors()
            authors = loadedAuthors
            authorNames = loadedAuthors.associate { it.uid to it.name }
        }
        viewModelScope.launch {
            val groups = repository.getSongGroups()
            books = groups.filter { it.kind == SongGroupKind.BOOK }
            topics = groups.filter { it.kind == SongGroupKind.TOPIC }
        }
        settingsRepository.settings
            .onEach { listLanguage = it.listLanguage }
            .launchIn(viewModelScope)
    }

    // Filtered data based on search text
    val filteredSongs: List<ManifestEntry>
        get() {
            return if (searchText.isEmpty()) {
                songs
            } else {
                songs.filter { song ->
                    song.title.contains(searchText, ignoreCase = true) ||
                    (authorNames[song.authorUid] ?: "").contains(searchText, ignoreCase = true)
                }
            }
        }

    val filteredAuthors: List<Author>
        get() {
            return if (searchText.isEmpty()) {
                authors
            } else {
                authors.filter { it.name.contains(searchText, ignoreCase = true) }
            }
        }

    val filteredTopics: List<SongGroup>
        get() {
            return if (searchText.isEmpty()) {
                topics
            } else {
                topics.filter { it.title.contains(searchText, ignoreCase = true) }
            }
        }

    val filteredBooks: List<SongGroup>
        get() {
            return if (searchText.isEmpty()) {
                books
            } else {
                books.filter { it.title.contains(searchText, ignoreCase = true) }
            }
        }

    // Creates a map of first letters to their positions for alphabetical scrolling
    fun createSectionMap(items: List<Any>, keySelector: (Any) -> String): Map<String, Int> {
        val result = mutableMapOf<String, Int>()
        val grouped = items.groupBy { StringUtils.firstNormalizedLetter(keySelector(it)) }

        var index = 0
        grouped.keys.sorted().forEach { letter ->
            result[letter] = index
            index += grouped[letter]?.size ?: 0
        }

        return result
    }

    // State changing methods
    fun setCategory(category: Category) {
        selectedCategory = category
    }

    fun updateSearchText(text: String) {
        searchText = text
    }

    // Helper for getting the appropriate search placeholder
    fun getSearchPlaceholder(): String {
        return "Search ${selectedCategory.title}"
    }
}

package com.gaudiyakirtan.myapplication.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel for the Home screen.
 * Loads the real, offline-bundled corpus via [SongRepository] -- no more [com.gaudiyakirtan.data.SampleData].
 * Lists (songs/authors) are backed by the lightweight [ManifestEntry]/[Author] catalog rather than
 * full [Song] objects, per docs/data/manifest.md; only the "Featured Song" block loads one full
 * [Song] (by uid), since it needs verses.
 */
class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)

    /** Reader's chosen list-title script (docs/screens/settings.md `listLanguage`). */
    val listLanguage: StateFlow<String> = settingsRepository.settings
        .map { it.listLanguage }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = settingsRepository.settings.value.listLanguage
        )

    /** uid of the song shown in the "Featured Song" block. */
    private val featuredUid = "N9"

    private val _songs = MutableStateFlow<List<ManifestEntry>>(emptyList())
    private val _authors = MutableStateFlow<List<Author>>(emptyList())
    private val _topics = MutableStateFlow<List<SongGroup>>(emptyList())
    private val _books = MutableStateFlow<List<SongGroup>>(emptyList())
    private val _featuredSong = MutableStateFlow<Song?>(null)
    private val _searchQuery = MutableStateFlow("")
    private val _authorNames = MutableStateFlow<Map<String, String>>(emptyMap())

    val songs: StateFlow<List<ManifestEntry>> = _songs
    val authors: StateFlow<List<Author>> = _authors
    val topics: StateFlow<List<SongGroup>> = _topics
    val books: StateFlow<List<SongGroup>> = _books
    val featuredSong: StateFlow<Song?> = _featuredSong
    val searchQuery: StateFlow<String> = _searchQuery

    /** `author_uid` -> display name, for resolving a [ManifestEntry.authorUid] in list rows. */
    val authorNames: StateFlow<Map<String, String>> = _authorNames

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            _songs.value = repository.getManifest()
            _featuredSong.value = repository.getSongByUid(featuredUid)
        }
        viewModelScope.launch {
            val loadedAuthors = repository.getAuthors()
            _authors.value = loadedAuthors
            _authorNames.value = loadedAuthors.associate { it.uid to it.name }
        }
        viewModelScope.launch {
            // Book/Topic groupings (docs/data/collections.md `SongGroup`; 93 groups shipped: 19
            // books + 74 topics). Sections render only when non-empty (see HomeScreen).
            val groups = repository.getSongGroups()
            _books.value = groups.filter { it.kind == SongGroupKind.BOOK }
            _topics.value = groups.filter { it.kind == SongGroupKind.TOPIC }
        }
    }

    /** Updates the search query. */
    fun updateSearchQuery(query: String) {
        _searchQuery.value = query
        // In a real app, this would filter the data based on the query
        // For now, we're just storing the query for use in the UI
    }

    /** Reloads from the repository. */
    fun refreshData() {
        loadData()
    }
}

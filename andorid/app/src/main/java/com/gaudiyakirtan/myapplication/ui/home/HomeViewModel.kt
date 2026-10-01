package com.gaudiyakirtan.myapplication.ui.home

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gaudiyakirtan.data.CalendarRepository
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import kotlinx.coroutines.Job
import java.time.LocalDate

/**
 * ViewModel for the Home screen.
 * Loads the real, offline-bundled corpus via [SongRepository] -- no more [com.gaudiyakirtan.data.SampleData].
 * Lists (songs/authors) are backed by the lightweight [ManifestEntry]/[Author] catalog rather than
 * full [Song] objects. The featured reading loads N9 with its verses; the v6 listening suggestion
 * resolves one real recording from the seasonal list, falling back to the bundled manifest.
 */
class HomeViewModel(application: Application) : AndroidViewModel(application) {

    private val repository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)
    private val calendarRepository = CalendarRepository.getInstance(application)

    val settings: StateFlow<AppSettings> = settingsRepository.settings
    private var calendarRefreshJob: Job? = null
    private var manifestLoaded = false

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
    private val _listenSong = MutableStateFlow<Song?>(null)
    private val _searchQuery = MutableStateFlow("")
    private val _authorNames = MutableStateFlow<Map<String, String>>(emptyMap())

    /**
     * The lunar month for today and its songs (docs/screens/home.md region 1, "Welcome + this
     * month"). Null while loading, and null for good when the date falls outside the calendar's
     * precomputed window range -- the spec says hide the region rather than show a wrong month.
     */
    private val _thisMonth = MutableStateFlow<CalendarToday?>(null)
    private val _thisMonthSongs = MutableStateFlow<List<ManifestEntry>>(emptyList())

    val songs: StateFlow<List<ManifestEntry>> = _songs
    val authors: StateFlow<List<Author>> = _authors
    val topics: StateFlow<List<SongGroup>> = _topics
    val books: StateFlow<List<SongGroup>> = _books
    val featuredSong: StateFlow<Song?> = _featuredSong
    val listenSong: StateFlow<Song?> = _listenSong
    val thisMonth: StateFlow<CalendarToday?> = _thisMonth
    val thisMonthSongs: StateFlow<List<ManifestEntry>> = _thisMonthSongs
    val searchQuery: StateFlow<String> = _searchQuery

    /** `author_uid` -> display name, for resolving a [ManifestEntry.authorUid] in list rows. */
    val authorNames: StateFlow<Map<String, String>> = _authorNames

    init {
        loadData()
    }

    private fun loadData() {
        viewModelScope.launch {
            val manifest = repository.getManifest()
            _songs.value = manifest
            manifestLoaded = true
            // The month overlay resolves against the same manifest, so it rides this load rather
            // than reading the catalog a second time.
            refreshCalendar()
            _featuredSong.value = repository.getSongByUid(featuredUid)
        }
        viewModelScope.launch {
            val loadedAuthors = repository.getAuthors()
            _authors.value = loadedAuthors
            _authorNames.value = loadedAuthors.associate { it.uid to it.name }
        }
        viewModelScope.launch {
            // Preserve every bundled book/topic destination; empty sections are omitted by Home.
            val groups = repository.getSongGroups()
            _books.value = groups.filter { it.kind == SongGroupKind.BOOK }
            _topics.value = groups.filter { it.kind == SongGroupKind.TOPIC }
        }
    }

    /** Resolve context and songs against the same local date; cancel any obsolete clock request. */
    fun refreshCalendar(date: LocalDate = LocalDate.now()) {
        // The first resume usually arrives before the manifest: every reference would be
        // unresolved and read as a false empty month. loadData() refreshes once it lands.
        if (!manifestLoaded) return
        calendarRefreshJob?.cancel()
        calendarRefreshJob = viewModelScope.launch {
            val today = calendarRepository.getToday(date)
            val monthSongs = today?.let {
                com.gaudiyakirtan.data.CalendarRepositoryLogic.monthSongs(it.month, _songs.value)
            }.orEmpty()
            _thisMonth.value = today
            _thisMonthSongs.value = monthSongs
            // The v6 suggestion follows the same seasonal order, then the bundled manifest.
            // Verify full audio files rather than treating the manifest flag as a playable take.
            var suggestion: Song? = null
            for (entry in (monthSongs + _songs.value).distinctBy { it.uid }) {
                if (!entry.audioAvailable) continue
                val song = repository.getSongByUid(entry.uid)
                if (song != null && song.audioFiles.isNotEmpty()) {
                    suggestion = song
                    break
                }
            }
            _listenSong.value = suggestion
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

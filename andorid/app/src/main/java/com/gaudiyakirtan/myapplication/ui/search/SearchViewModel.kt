package com.gaudiyakirtan.myapplication.ui.search

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.gaudiyakirtan.data.FuzzySongSearchEngine
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.data.SongSearchEngine
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.name
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel for the Search screen (docs/screens/search.md). Builds an offline [SongSearchEngine]
 * over the bundled manifest + resolved author names once, then live-filters (debounced) as the user
 * types. Results are [ManifestEntry] rows ordered by score (the engine ranks; this maps uids back).
 */
class SearchViewModel(application: Application) : AndroidViewModel(application) {

    private val songRepository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _results = MutableStateFlow<List<ManifestEntry>>(emptyList())
    val results: StateFlow<List<ManifestEntry>> = _results.asStateFlow()

    private val _authorNames = MutableStateFlow<Map<String, String>>(emptyMap())
    val authorNames: StateFlow<Map<String, String>> = _authorNames.asStateFlow()

    /** Reader's chosen list-title script (docs/screens/settings.md `listLanguage`). */
    val listLanguage: StateFlow<String> = settingsRepository.settings
        .map { it.listLanguage }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = settingsRepository.settings.value.listLanguage
        )

    private var engine: SongSearchEngine? = null
    private var manifestByUid: Map<String, ManifestEntry> = emptyMap()
    private var searchJob: Job? = null

    init {
        viewModelScope.launch {
            val manifest = songRepository.getManifest()
            val authorNameMap = songRepository.getAuthors().associate { it.uid to it.name }
            _authorNames.value = authorNameMap
            manifestByUid = manifest.associateBy { it.uid }
            engine = FuzzySongSearchEngine.build(manifest, authorNameMap)
            // If the user typed while the index was loading, run that query now.
            if (_query.value.isNotBlank()) runSearch(_query.value)
        }
    }

    /** Live-filter with a short debounce (docs/screens/search.md: "type -> live-filter, debounced"). */
    fun updateQuery(newQuery: String) {
        _query.value = newQuery
        searchJob?.cancel()
        if (newQuery.isBlank()) {
            _results.value = emptyList()
            return
        }
        searchJob = viewModelScope.launch {
            delay(DEBOUNCE_MS)
            runSearch(newQuery)
        }
    }

    private fun runSearch(query: String) {
        val activeEngine = engine ?: return
        _results.value = activeEngine.search(query).mapNotNull { manifestByUid[it] }
    }

    fun clearQuery() = updateQuery("")

    companion object {
        private const val DEBOUNCE_MS = 150L
    }
}

package com.gaudiyakirtan.myapplication.ui.author

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.name
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel for the author-filtered song list (docs/screens/songs-list.md, `Library (Author)`
 * variant). Reads the offline [SongRepository] manifest, keeps only the songs whose `author_uid`
 * matches [authorUid], and resolves the author's display name from the derived Author catalog. This
 * is the target of song-detail's author-tap and the Authors tab.
 */
class AuthorSongsViewModel(
    application: Application,
    private val authorUid: String
) : AndroidViewModel(application) {

    private val songRepository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)

    private val _songs = MutableStateFlow<List<ManifestEntry>>(emptyList())
    val songs: StateFlow<List<ManifestEntry>> = _songs.asStateFlow()

    private val _authorName = MutableStateFlow("")
    val authorName: StateFlow<String> = _authorName.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    /** `author_uid` -> display name, for the row author line (all rows share this author here). */
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

    init {
        viewModelScope.launch {
            _isLoading.value = true
            _songs.value = songRepository.getManifest().filter { it.authorUid == authorUid }
            val author = songRepository.getAuthors().firstOrNull { it.uid == authorUid }
            val resolvedName = author?.name?.takeIf { it.isNotBlank() } ?: authorUid
            _authorName.value = resolvedName
            _authorNames.value = mapOf(authorUid to resolvedName)
            _isLoading.value = false
        }
    }

    companion object {
        fun factory(authorUid: String) = viewModelFactory {
            initializer {
                val application = this[APPLICATION_KEY] as Application
                AuthorSongsViewModel(application, authorUid)
            }
        }
    }
}

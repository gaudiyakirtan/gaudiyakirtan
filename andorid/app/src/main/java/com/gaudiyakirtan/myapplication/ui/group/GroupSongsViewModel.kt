package com.gaudiyakirtan.myapplication.ui.group

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.ManifestEntry
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.models.name
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * ViewModel for one Book/Topic's song list (docs/data/collections.md `SongGroup`) -- the group
 * analogue of [com.gaudiyakirtan.myapplication.ui.author.AuthorSongsViewModel]'s author-filtered
 * list: same manifest-driven song list, filtered to one group's `song_uids` instead of one author.
 * Reached from the Library Books/Topics tabs and the Home Books/Topics sections tapping a card.
 */
class GroupSongsViewModel(
    application: Application,
    private val groupUid: String
) : AndroidViewModel(application) {

    private val songRepository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)

    private val _group = MutableStateFlow<SongGroup?>(null)
    val group: StateFlow<SongGroup?> = _group.asStateFlow()

    private val _songs = MutableStateFlow<List<ManifestEntry>>(emptyList())
    val songs: StateFlow<List<ManifestEntry>> = _songs.asStateFlow()

    /** `author_uid` -> display name, for each row's author line. */
    private val _authorNames = MutableStateFlow<Map<String, String>>(emptyMap())
    val authorNames: StateFlow<Map<String, String>> = _authorNames.asStateFlow()

    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

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
            val resolvedGroup = songRepository.getSongGroups().firstOrNull { it.uid == groupUid }
            _group.value = resolvedGroup
            _songs.value = resolvedGroup?.let { songRepository.getSongsInGroup(it) } ?: emptyList()
            val authors = songRepository.getAuthors()
            _authorNames.value = authors.associate { it.uid to it.name }
            _isLoading.value = false
        }
    }

    companion object {
        fun factory(groupUid: String) = viewModelFactory {
            initializer {
                val application = this[APPLICATION_KEY] as Application
                GroupSongsViewModel(application, groupUid)
            }
        }
    }
}

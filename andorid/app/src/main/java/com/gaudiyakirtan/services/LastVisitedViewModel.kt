package com.gaudiyakirtan.services

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.gaudiyakirtan.data.LastVisitedRepository
import com.gaudiyakirtan.data.SettingsRepository
import com.gaudiyakirtan.data.SongRepository
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

/**
 * Rehydrates the mini-player's **resting state** from the one persisted uid
 * (docs/screens/player.md v15): [LastVisitedRepository] stores `last_visited_song_uid`, and this
 * turns it into a renderable [LastVisitedSong] by reading the bundled corpus -- so nothing
 * denormalized can go stale against a pipeline resync.
 *
 * Sits alongside [PlayerViewModel] at the navigation root rather than inside `MiniPlayerBar`: the bar
 * takes its state and callbacks as parameters (as it already did for playback), which is what keeps
 * it renderable in a screenshot test with hand-built state.
 *
 * Title and audio flag come from the lightweight [com.gaudiyakirtan.myapplication.models.ManifestEntry]
 * (the title in the reader's `listLanguage`, like every other list surface); the composer's name
 * comes from the full [Song], one cached asset read for a single uid -- cheaper than deriving the
 * whole author catalog, and it warms `SongRepository`'s cache so a tap on the play affordance starts
 * the first take without a visible load.
 */
class LastVisitedViewModel(application: Application) : AndroidViewModel(application) {

    private val songRepository = SongRepository.getInstance(application)
    private val settingsRepository = SettingsRepository.getInstance(application)
    private val lastVisitedRepository = LastVisitedRepository.getInstance(application)

    private val _lastVisited = MutableStateFlow<LastVisitedSong?>(null)

    /** The resting-state song, or `null` when no song has ever been opened (the *absent* slot). */
    val lastVisited: StateFlow<LastVisitedSong?> = _lastVisited.asStateFlow()

    /** Reader's chosen list-title script (docs/screens/settings.md `listLanguage`), for the *playing*
     * state's title -- the resting state's title is already resolved into [lastVisited]. */
    val listLanguage: StateFlow<String> = settingsRepository.settings
        .map { it.listLanguage }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.Eagerly,
            initialValue = settingsRepository.settings.value.listLanguage
        )

    init {
        viewModelScope.launch {
            // Re-resolves on both inputs: a newly opened song, and a change of list language (the
            // bar's title follows `listLanguage` exactly like the lists it sits under).
            combine(
                lastVisitedRepository.lastVisitedSongUid,
                settingsRepository.settings.map { it.listLanguage }.distinctUntilChanged()
            ) { uid, listLanguage -> uid to listLanguage }
                .collectLatest { (uid, listLanguage) ->
                    _lastVisited.value = resolve(uid, listLanguage)
                }
        }
    }

    /**
     * The full [Song] for [uid], loaded only when the reader actually taps the resting bar's play
     * affordance -- the bar itself never needs it. Returns `null` if the uid is not in the shipped
     * corpus, in which case the caller simply does nothing (never a crash).
     */
    suspend fun songFor(uid: String): Song? = songRepository.getSongByUid(uid)

    private suspend fun resolve(uid: String?, listLanguage: String): LastVisitedSong? {
        if (uid.isNullOrBlank()) return null
        // A uid that no longer exists in the corpus resolves to the *absent* slot rather than a bar
        // that cannot be opened (docs/screens/player.md v15: a missing record is absence, not a crash).
        val entry = songRepository.getManifest().firstOrNull { it.uid == uid } ?: return null
        val song = songRepository.getSongByUid(uid)
        return LastVisitedSong(
            uid = entry.uid,
            title = entry.titleForListLanguage(listLanguage),
            author = song?.author.orEmpty(),
            audioAvailable = entry.audioAvailable
        )
    }

    companion object {
        /** Compose [androidx.lifecycle.viewmodel.compose.viewModel] factory. */
        fun factory() = viewModelFactory {
            initializer {
                val application = this[APPLICATION_KEY] as Application
                LastVisitedViewModel(application)
            }
        }
    }
}

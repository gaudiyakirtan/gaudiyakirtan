package com.gaudiyakirtan.services

import android.app.Application
import android.media.MediaPlayer
import android.util.Log
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModelProvider.AndroidViewModelFactory.Companion.APPLICATION_KEY
import androidx.lifecycle.viewModelScope
import androidx.lifecycle.viewmodel.initializer
import androidx.lifecycle.viewmodel.viewModelFactory
import com.gaudiyakirtan.data.AudioConfig
import com.gaudiyakirtan.myapplication.models.AudioTrack
import com.gaudiyakirtan.myapplication.models.Song
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

/** Playback state machine per docs/screens/player.md "States". */
enum class PlaybackState { IDLE, LOADING, PLAYING, PAUSED, ERROR }

/** The song + take currently loaded, plus the full list of takes for that song (for a take picker). */
data class NowPlaying(
    val song: Song,
    val track: AudioTrack,
    val availableTracks: List<AudioTrack>
)

data class PlayerUiState(
    val nowPlaying: NowPlaying? = null,
    val playbackState: PlaybackState = PlaybackState.IDLE,
    val positionMs: Int = 0,
    val durationMs: Int = 0,
    val errorMessage: String? = null
)

/**
 * Global playback service (docs/screens/player.md "a global playback service, not per-screen
 * state"). Backed by [android.media.MediaPlayer] -- Media3/ExoPlayer is not available in the offline
 * Gradle cache for this build, and `MediaPlayer` is a zero-dependency framework API that covers the
 * spec's needs (streaming HTTP playback, play/pause/seek, duration/position) without touching the
 * network for a new artifact.
 *
 * Instantiated once, scoped to the host Activity (see `AppNavigation` -- created as a sibling of the
 * `NavHost`, not inside a `composable {}` route, so its `ViewModelStoreOwner` is the Activity and it
 * survives navigation between screens exactly like iOS's `AudioPlayerService` / web's player context).
 */
class PlayerViewModel(application: Application) : AndroidViewModel(application) {

    private var mediaPlayer: MediaPlayer? = null
    private var progressJob: Job? = null

    private val _uiState = MutableStateFlow(PlayerUiState())
    val uiState: StateFlow<PlayerUiState> = _uiState.asStateFlow()

    /**
     * Starts playback of [song] on [requestedTrack] (defaults to `audio_files[0]`). If [song] has no
     * audio, moves straight to the [PlaybackState.ERROR] state with a clean "audio unavailable"
     * message -- never crashes. If the requested song+take is already loaded and merely paused, just
     * resumes instead of reloading.
     */
    fun play(song: Song, requestedTrack: AudioTrack? = null) {
        val chosen = requestedTrack ?: song.audioFiles.firstOrNull()
        if (chosen == null) {
            _uiState.value = PlayerUiState(
                nowPlaying = null,
                playbackState = PlaybackState.ERROR,
                errorMessage = "Audio unavailable"
            )
            return
        }

        val current = _uiState.value
        val sameTrackLoaded = current.nowPlaying?.song?.uid == song.uid &&
            current.nowPlaying?.track?.uid == chosen.uid &&
            mediaPlayer != null

        if (sameTrackLoaded && current.playbackState == PlaybackState.PAUSED) {
            resume()
            return
        }
        if (sameTrackLoaded && current.playbackState == PlaybackState.PLAYING) {
            return // already playing this exact take
        }

        loadAndPlay(song, chosen)
    }

    /** Switches to a different take of the currently loaded song (docs/screens/player.md "allow
     * choosing take/artist if multiple"). No-op if nothing is loaded. */
    fun selectTrack(track: AudioTrack) {
        val song = _uiState.value.nowPlaying?.song ?: return
        loadAndPlay(song, track)
    }

    fun togglePlayPause() {
        when (_uiState.value.playbackState) {
            PlaybackState.PLAYING -> pause()
            PlaybackState.PAUSED -> resume()
            else -> Unit
        }
    }

    /** Seek to an absolute position in milliseconds (scrubber drag-end / tap). */
    fun seekTo(positionMs: Int) {
        val player = mediaPlayer ?: return
        if (_uiState.value.playbackState != PlaybackState.PLAYING &&
            _uiState.value.playbackState != PlaybackState.PAUSED
        ) return
        try {
            player.seekTo(positionMs)
            _uiState.update { it.copy(positionMs = positionMs) }
        } catch (e: IllegalStateException) {
            Log.w(TAG, "seekTo while player not ready", e)
        }
    }

    /** Dismisses the mini-player / now-playing state entirely (stop + clear). */
    fun stop() {
        releasePlayer()
        _uiState.value = PlayerUiState()
    }

    private fun loadAndPlay(song: Song, track: AudioTrack) {
        releasePlayer()
        _uiState.value = PlayerUiState(
            nowPlaying = NowPlaying(song = song, track = track, availableTracks = song.audioFiles),
            playbackState = PlaybackState.LOADING
        )

        try {
            mediaPlayer = MediaPlayer().apply {
                setOnPreparedListener { mp ->
                    _uiState.update {
                        it.copy(playbackState = PlaybackState.PLAYING, durationMs = mp.duration.coerceAtLeast(0))
                    }
                    mp.start()
                    startProgressLoop()
                }
                setOnErrorListener { _, what, extra ->
                    Log.w(TAG, "MediaPlayer error what=$what extra=$extra for ${track.filename}")
                    progressJob?.cancel()
                    _uiState.update {
                        it.copy(playbackState = PlaybackState.ERROR, errorMessage = "Audio unavailable")
                    }
                    true // handled -- suppresses the framework's default completion callback
                }
                setOnCompletionListener {
                    progressJob?.cancel()
                    _uiState.update { it.copy(playbackState = PlaybackState.PAUSED, positionMs = 0) }
                    try {
                        it.seekTo(0)
                    } catch (e: IllegalStateException) {
                        Log.w(TAG, "seekTo(0) on completion", e)
                    }
                }
                setDataSource(AudioConfig.playableUrl(track.filename))
                prepareAsync() // async: network-backed source, never blocks the caller
            }
        } catch (e: Exception) {
            // setDataSource/prepareAsync can throw for a malformed URL or immediate I/O failure --
            // degrade to the same graceful error state rather than crashing (docs/screens/player.md).
            Log.w(TAG, "Failed to start playback for ${track.filename}", e)
            _uiState.update { it.copy(playbackState = PlaybackState.ERROR, errorMessage = "Audio unavailable") }
        }
    }

    private fun pause() {
        val player = mediaPlayer ?: return
        try {
            player.pause()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "pause while not started", e)
            return
        }
        progressJob?.cancel()
        _uiState.update { it.copy(playbackState = PlaybackState.PAUSED) }
    }

    private fun resume() {
        val player = mediaPlayer ?: return
        try {
            player.start()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "resume while player not prepared", e)
            return
        }
        _uiState.update { it.copy(playbackState = PlaybackState.PLAYING) }
        startProgressLoop()
    }

    /** Polls [MediaPlayer.getCurrentPosition] on a light interval while playing, to drive the
     * scrubber. Stops itself once playback state leaves PLAYING. */
    private fun startProgressLoop() {
        progressJob?.cancel()
        progressJob = viewModelScope.launch {
            while (true) {
                val player = mediaPlayer
                if (player == null || _uiState.value.playbackState != PlaybackState.PLAYING) break
                val position = try {
                    player.currentPosition
                } catch (e: IllegalStateException) {
                    break
                }
                _uiState.update { it.copy(positionMs = position) }
                delay(PROGRESS_POLL_INTERVAL_MS)
            }
        }
    }

    private fun releasePlayer() {
        progressJob?.cancel()
        progressJob = null
        mediaPlayer?.apply {
            setOnPreparedListener(null)
            setOnErrorListener(null)
            setOnCompletionListener(null)
            try {
                reset()
            } catch (e: Exception) {
                Log.w(TAG, "reset() during release", e)
            }
            release()
        }
        mediaPlayer = null
    }

    override fun onCleared() {
        releasePlayer()
        super.onCleared()
    }

    companion object {
        private const val TAG = "PlayerViewModel"
        private const val PROGRESS_POLL_INTERVAL_MS = 250L

        /** Compose [androidx.lifecycle.viewmodel.compose.viewModel] factory. */
        fun factory() = viewModelFactory {
            initializer {
                val application = this[APPLICATION_KEY] as Application
                PlayerViewModel(application)
            }
        }
    }
}

/** Convenience display strings for the now-playing credit (docs/screens/player.md "Data bindings"). */
val NowPlaying.songTitle: String get() = song.title
val NowPlaying.songAuthor: String get() = song.author
val NowPlaying.trackArtist: String? get() = track.artist

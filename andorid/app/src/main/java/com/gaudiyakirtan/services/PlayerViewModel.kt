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
import kotlin.random.Random

/** Playback state machine per docs/screens/player.md "States". */
enum class PlaybackState { IDLE, LOADING, PLAYING, PAUSED, ERROR }

/** The song + take currently loaded, plus the full list of takes for that song (for a take picker). */
data class NowPlaying(
    val song: Song,
    val track: AudioTrack,
    val availableTracks: List<AudioTrack>
)

/**
 * Everything a player surface renders from. [shuffle] / [repeatMode] / [playOrder] are the take-queue
 * state added in docs/screens/player.md v14: [playOrder] is the resolved sequence of
 * [com.gaudiyakirtan.myapplication.models.AudioTrack.uid]s the transport walks (listed order, or a
 * shuffled permutation), so the UI can show the queue and the ViewModel never re-rolls the shuffle.
 */
data class PlayerUiState(
    val nowPlaying: NowPlaying? = null,
    val playbackState: PlaybackState = PlaybackState.IDLE,
    val positionMs: Int = 0,
    val durationMs: Int = 0,
    val errorMessage: String? = null,
    val shuffle: Boolean = false,
    val repeatMode: RepeatMode = RepeatMode.OFF,
    val playOrder: List<String> = emptyList()
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

    /**
     * Seed for the shuffled [playOrder] (docs/screens/player.md v14). Re-rolled only when shuffle is
     * switched *on*, so the permutation stays stable for the whole shuffle session -- including
     * across a take change -- instead of reshuffling on every `next`.
     */
    private var shuffleSeed: Long = Random.nextLong()

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
            // Shuffle/repeat are *player* preferences, not per-song state: they survive an
            // unplayable song exactly as they survive a take change.
            _uiState.update {
                PlayerUiState(
                    nowPlaying = null,
                    playbackState = PlaybackState.ERROR,
                    errorMessage = "Audio unavailable",
                    shuffle = it.shuffle,
                    repeatMode = it.repeatMode
                )
            }
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

    /**
     * Flips shuffle (docs/screens/player.md v14). Turning it **on** re-rolls [shuffleSeed] and
     * re-derives [PlayerUiState.playOrder] as a permutation of the loaded song's takes; turning it
     * **off** restores their listed order. The take currently playing is untouched either way -- only
     * what comes *next* changes.
     */
    fun toggleShuffle() {
        val next = !_uiState.value.shuffle
        if (next) shuffleSeed = Random.nextLong()
        _uiState.update { state ->
            val uids = state.nowPlaying?.availableTracks?.map { it.uid }.orEmpty()
            state.copy(shuffle = next, playOrder = playOrder(uids, next, shuffleSeed))
        }
    }

    /** Cycles repeat off -> all -> one -> off (docs/screens/player.md v14's three-state control). */
    fun cycleRepeatMode() {
        _uiState.update { state ->
            state.copy(
                repeatMode = when (state.repeatMode) {
                    RepeatMode.OFF -> RepeatMode.ALL
                    RepeatMode.ALL -> RepeatMode.ONE
                    RepeatMode.ONE -> RepeatMode.OFF
                }
            )
        }
    }

    /**
     * Steps to the next take in [PlayerUiState.playOrder] (docs/screens/player.md v14: "Previous/next
     * step through the song's **takes**"). No-op at the end of the order unless [RepeatMode.ALL] is
     * set -- manual skipping obeys the same wrap rule as the end-of-take decision, so the transport
     * and autoplay never disagree about where the queue ends.
     */
    fun next() {
        step(delta = 1)
    }

    /**
     * Steps back a take -- except within the first [RESTART_THRESHOLD_MS] of a take, where it
     * restarts the current one instead, matching the universal transport convention the spec names.
     * With no earlier take to reach, it also restarts rather than doing nothing.
     */
    fun previous() {
        if (_uiState.value.positionMs > RESTART_THRESHOLD_MS) {
            seekTo(0)
            return
        }
        if (!step(delta = -1)) seekTo(0)
    }

    /** Loads the take [delta] steps away, returning whether there was one to move to. */
    private fun step(delta: Int): Boolean {
        val state = _uiState.value
        val nowPlaying = state.nowPlaying ?: return false
        val targetUid = neighbor(
            order = state.playOrder,
            currentTrackUid = nowPlaying.track.uid,
            delta = delta,
            wrap = state.repeatMode == RepeatMode.ALL
        ) ?: return false
        val target = nowPlaying.availableTracks.firstOrNull { it.uid == targetUid } ?: return false
        if (target.uid == nowPlaying.track.uid) {
            // Single-take song under repeat-all: a "skip" is a restart, not a reload.
            replayCurrent()
        } else {
            loadAndPlay(nowPlaying.song, target)
        }
        return true
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
        val previous = _uiState.value
        _uiState.value = PlayerUiState(
            nowPlaying = NowPlaying(song = song, track = track, availableTracks = song.audioFiles),
            playbackState = PlaybackState.LOADING,
            // Player-level settings outlive the loaded take; the order is re-derived for this song.
            shuffle = previous.shuffle,
            repeatMode = previous.repeatMode,
            playOrder = playOrder(song.audioFiles.map { it.uid }, previous.shuffle, shuffleSeed)
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
                    handleTakeEnd()
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

    /**
     * End-of-take routing (docs/screens/player.md v14). The *decision* is delegated whole to
     * [resolveTakeEndAction] -- a pure function with no `MediaPlayer` in sight, unit-tested in
     * `TakeQueueTest` -- and this method only carries it out.
     */
    private fun handleTakeEnd() {
        val state = _uiState.value
        val nowPlaying = state.nowPlaying ?: run { stopAtEndOfTake(); return }

        when (
            val action = resolveTakeEndAction(
                repeatMode = state.repeatMode,
                shuffle = state.shuffle,
                order = state.playOrder,
                currentTrackUid = nowPlaying.track.uid
            )
        ) {
            TakeEndAction.Replay -> replayCurrent()
            is TakeEndAction.PlayTake -> {
                val next = nowPlaying.availableTracks.firstOrNull { it.uid == action.trackUid }
                if (next != null) loadAndPlay(nowPlaying.song, next) else stopAtEndOfTake()
            }
            TakeEndAction.Stop -> stopAtEndOfTake()
        }
    }

    /** Rewinds and plays the loaded take again (repeat-one, and repeat-all on a single-take song). */
    private fun replayCurrent() {
        val player = mediaPlayer ?: return
        try {
            player.seekTo(0)
            player.start()
        } catch (e: IllegalStateException) {
            Log.w(TAG, "replay while player not prepared", e)
            return
        }
        _uiState.update { it.copy(playbackState = PlaybackState.PLAYING, positionMs = 0) }
        startProgressLoop()
    }

    /**
     * Falls silent at the end of the queue: stays loaded and rewound to 0 in [PlaybackState.PAUSED],
     * so the now-playing surfaces keep showing the song and one tap plays it again.
     */
    private fun stopAtEndOfTake() {
        _uiState.update { it.copy(playbackState = PlaybackState.PAUSED, positionMs = 0) }
        try {
            mediaPlayer?.seekTo(0)
        } catch (e: IllegalStateException) {
            Log.w(TAG, "seekTo(0) on completion", e)
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

        /** Past this point in a take, "previous" restarts it instead of stepping back
         * (docs/screens/player.md v14: "previous restarts the current take when more than ~3 s in"). */
        private const val RESTART_THRESHOLD_MS = 3_000

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

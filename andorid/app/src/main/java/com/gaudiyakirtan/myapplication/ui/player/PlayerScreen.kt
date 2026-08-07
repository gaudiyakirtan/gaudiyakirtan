package com.gaudiyakirtan.myapplication.ui.player

import com.gaudiyakirtan.myapplication.ui.components.GaudiyaTopAppBar
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearWavyProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.SubcomposeAsyncImage
import com.gaudiyakirtan.data.ImageConfig
import com.gaudiyakirtan.myapplication.models.AudioTrack
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import kotlin.math.roundToInt

/**
 * Now Playing screen (docs/screens/player.md `Now Playing` / `Player` frames): artwork placeholder,
 * title/author + take artist, play/pause, a scrubber (position/duration), skip controls (dormant --
 * only meaningful once a track has neighbors to skip to, which multi-recording ordering doesn't
 * define yet), and a take picker when the song has more than one recording.
 */
@Composable
fun PlayerScreen(
    uiState: PlayerUiState,
    onBackClick: () -> Unit,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onTrackSelected: (AudioTrack) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            GaudiyaTopAppBar(title = "Now Playing", onBackClick = onBackClick)

            val nowPlaying = uiState.nowPlaying
            when {
                nowPlaying == null && uiState.playbackState == PlaybackState.ERROR ->
                    ErrorState(message = uiState.errorMessage ?: "Audio unavailable")

                nowPlaying == null -> IdleState()

                else -> NowPlayingContent(
                    nowPlaying = nowPlaying,
                    uiState = uiState,
                    onPlayPauseClick = onPlayPauseClick,
                    onSeek = onSeek,
                    onTrackSelected = onTrackSelected
                )
            }
        }
    }
}

@Composable
private fun NowPlayingContent(
    nowPlaying: NowPlaying,
    uiState: PlayerUiState,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onTrackSelected: (AudioTrack) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = Spacing.xl, vertical = Spacing.lg),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(Spacing.sm)
    ) {
        // Recording-artist portrait (docs/screens/player.md "Related assets on the same bucket":
        // `artists/<artist_code>.jpg`), gracefully falling back to the mridanga placeholder icon on
        // any load failure -- most artist codes are expected not to have a bucket portrait.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .padding(Spacing.xl)
                .clip(MaterialTheme.shapes.medium)
                .background(MaterialTheme.colorScheme.surface),
            contentAlignment = Alignment.Center
        ) {
            val artistCode = ImageConfig.artistCode(nowPlaying.track.uid)
            SubcomposeAsyncImage(
                model = ImageConfig.artistImageUrl(artistCode),
                contentDescription = nowPlaying.track.artist,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                loading = {
                    MusicNote(modifier = Modifier.size(72.dp), color = MaterialTheme.colorScheme.neutral)
                },
                error = {
                    MusicNote(modifier = Modifier.size(72.dp), color = MaterialTheme.colorScheme.neutral)
                }
            )
        }

        Text(
            text = nowPlaying.song.title,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.primary,
            textAlign = TextAlign.Center,
            maxLines = 2,
            overflow = TextOverflow.Ellipsis
        )
        Text(
            text = nowPlaying.song.author,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        // Performing-artist credit for this take, with a take picker when there's more than one.
        if (nowPlaying.availableTracks.size > 1) {
            TakePicker(
                current = nowPlaying.track,
                tracks = nowPlaying.availableTracks,
                onTrackSelected = onTrackSelected
            )
        } else {
            nowPlaying.track.artist?.let { artist ->
                Text(
                    text = artist,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.neutral,
                    textAlign = TextAlign.Center
                )
            }
        }

        Spacer(modifier = Modifier.height(Spacing.sm))

        when (uiState.playbackState) {
            PlaybackState.ERROR -> ErrorState(message = uiState.errorMessage ?: "Audio unavailable")
            PlaybackState.LOADING -> Box(
                modifier = Modifier.fillMaxWidth().height(96.dp),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
            }
            else -> PlaybackControls(
                uiState = uiState,
                onPlayPauseClick = onPlayPauseClick,
                onSeek = onSeek
            )
        }
    }
}

@Composable
private fun TakePicker(
    current: AudioTrack,
    tracks: List<AudioTrack>,
    onTrackSelected: (AudioTrack) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        Row(
            modifier = Modifier.clickable { expanded = true },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.xs)
        ) {
            Text(
                text = current.artist ?: current.uid,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
            Text(
                text = "▾",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            tracks.forEach { track ->
                DropdownMenuItem(
                    text = { Text(track.artist ?: track.uid) },
                    onClick = {
                        expanded = false
                        onTrackSelected(track)
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
private fun PlaybackControls(
    uiState: PlayerUiState,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit
) {
    val duration = uiState.durationMs.coerceAtLeast(0)
    var dragPositionMs by remember { mutableFloatStateOf(-1f) }
    val displayedPositionMs = if (dragPositionMs >= 0f) dragPositionMs.roundToInt() else uiState.positionMs

    val isPlaying = uiState.playbackState == PlaybackState.PLAYING

    // The screen's one expressive focal element (spec pending: player.md has no expressive section yet): the scrubber is wavy
    // while audio is actually advancing and flat otherwise, so playback state is legible from the
    // shape of the track alone. Animated rather than switched, because the *morph* between the two
    // is what communicates the state change; `MotionScheme.expressive()` supplies the spring.
    val amplitude by animateFloatAsState(
        targetValue = if (isPlaying) 1f else 0f,
        animationSpec = MaterialTheme.motionScheme.slowSpatialSpec(),
        label = "scrubberAmplitude"
    )

    Column(modifier = Modifier.fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
        // The wavy indicator draws the track; a transparent-track Slider sits on top purely to own
        // the interaction. Keeping the real Slider is deliberate -- it carries the seek semantics
        // (drag, keyboard, and TalkBack's "adjustable" actions) that a Canvas-drawn indicator would
        // silently drop, and accessibility is not traded for expression.
        Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
            LinearWavyProgressIndicator(
                progress = {
                    if (duration > 0) {
                        (displayedPositionMs.toFloat() / duration.toFloat()).coerceIn(0f, 1f)
                    } else {
                        0f
                    }
                },
                amplitude = { amplitude },
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.outline,
                modifier = Modifier
                    .fillMaxWidth()
                    .clearAndSetSemantics { }
            )
            Slider(
                value = displayedPositionMs.toFloat().coerceIn(0f, duration.toFloat().coerceAtLeast(0f)),
                valueRange = 0f..duration.toFloat().coerceAtLeast(1f),
                onValueChange = { dragPositionMs = it },
                onValueChangeFinished = {
                    onSeek(displayedPositionMs)
                    dragPositionMs = -1f
                },
                colors = SliderDefaults.colors(
                    thumbColor = MaterialTheme.colorScheme.primary,
                    activeTrackColor = Color.Transparent,
                    inactiveTrackColor = Color.Transparent
                ),
                modifier = Modifier.fillMaxWidth()
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = formatMillis(displayedPositionMs),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.neutral
            )
            Text(
                text = formatMillis(duration),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.neutral
            )
        }

        Spacer(modifier = Modifier.height(Spacing.lg))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.xl)
        ) {
            // Skip controls are dormant until multi-recording ordering/adjacency is defined
            // (docs/screens/player.md "skip controls (dormant until multi-recording)").
            IconButton(onClick = {}, enabled = false) {
                Icon(
                    imageVector = Icons.Default.SkipPrevious,
                    contentDescription = "Previous",
                    tint = MaterialTheme.colorScheme.neutral
                )
            }
            // The primary action, and the only other element allowed to move expressively here:
            // it morphs circle (paused) -> squircle (playing), so the control's own shape echoes
            // the state the wavy track is reporting. 32.dp on a 64.dp box is a full circle.
            val playCorner by animateDpAsState(
                targetValue = if (isPlaying) 20.dp else 32.dp,
                animationSpec = MaterialTheme.motionScheme.fastSpatialSpec(),
                label = "playPauseShape"
            )
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(RoundedCornerShape(playCorner))
                    .background(MaterialTheme.colorScheme.primary)
                    .clickable(onClick = onPlayPauseClick),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (uiState.playbackState == PlaybackState.PLAYING) {
                        Icons.Default.Pause
                    } else {
                        Icons.Default.PlayArrow
                    },
                    contentDescription = if (uiState.playbackState == PlaybackState.PLAYING) "Pause" else "Play",
                    tint = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(32.dp)
                )
            }
            IconButton(onClick = {}, enabled = false) {
                Icon(
                    imageVector = Icons.Default.SkipNext,
                    contentDescription = "Next",
                    tint = MaterialTheme.colorScheme.neutral
                )
            }
        }
    }
}

@Composable
private fun ErrorState(message: String) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(Spacing.xxl),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.ErrorOutline,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.neutral,
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(Spacing.md))
        Text(
            text = message,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.neutral,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun IdleState() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(
            text = "Nothing playing",
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.neutral
        )
    }
}

/** mm:ss formatting for the scrubber's position/duration labels. */
private fun formatMillis(ms: Int): String {
    val totalSeconds = (ms / 1000).coerceAtLeast(0)
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%d:%02d".format(minutes, seconds)
}

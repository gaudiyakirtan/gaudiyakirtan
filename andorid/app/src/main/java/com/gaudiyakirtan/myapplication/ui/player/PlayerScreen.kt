package com.gaudiyakirtan.myapplication.ui.player

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
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.PlaylistPlay
import androidx.compose.material.icons.automirrored.filled.QueueMusic
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material.icons.filled.RepeatOne
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.SubcomposeAsyncImage
import com.gaudiyakirtan.data.ImageConfig
import com.gaudiyakirtan.myapplication.models.AudioTrack
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import com.gaudiyakirtan.services.RepeatMode
import kotlin.math.roundToInt

/**
 * Now Playing (docs/screens/player.md **v14**, "Now Playing (mobile, v14)").
 *
 * This is the *content* of a `ModalBottomSheet` hosted at the navigation root -- not a pushed
 * destination -- so it can be raised from any screen and dismissing it never pops the reader
 * underneath. It therefore carries no back button: the drag handle at the top is the dismiss
 * affordance, and the sheet itself handles the gesture.
 *
 * The layout is the spec's list, top to bottom:
 *  1. drag handle + an uppercase context caption ("PLAYING FROM SONG") over the song title in small type;
 *  2. large rounded-square artwork (`artists/<artist_code>.jpg`; the placeholder is the normal case);
 *  3. title large/bold with the **reciter** beneath (the take's `artist`, falling back to the
 *     composer -- see docs/screens/tracks.md "reciter vs author");
 *  4. a scrubber showing **elapsed / remaining**, the elapsed label following the thumb while dragging;
 *  5. a five-control transport row: shuffle - previous - play/pause - next - repeat;
 *  6. an actions row: take picker (with the take count), share, queue.
 */
@Composable
fun PlayerScreen(
    uiState: PlayerUiState,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onTrackSelected: (AudioTrack) -> Unit,
    onPreviousClick: () -> Unit = {},
    onNextClick: () -> Unit = {},
    onToggleShuffle: () -> Unit = {},
    onCycleRepeat: () -> Unit = {},
    onShareClick: () -> Unit = {}
) {
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = MaterialTheme.colorScheme.background
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            DragHandle()

            val nowPlaying = uiState.nowPlaying
            when {
                nowPlaying == null && uiState.playbackState == PlaybackState.ERROR ->
                    ErrorState(message = uiState.errorMessage ?: AUDIO_UNAVAILABLE)

                nowPlaying == null -> IdleState()

                else -> NowPlayingContent(
                    nowPlaying = nowPlaying,
                    uiState = uiState,
                    onPlayPauseClick = onPlayPauseClick,
                    onSeek = onSeek,
                    onTrackSelected = onTrackSelected,
                    onPreviousClick = onPreviousClick,
                    onNextClick = onNextClick,
                    onToggleShuffle = onToggleShuffle,
                    onCycleRepeat = onCycleRepeat,
                    onShareClick = onShareClick
                )
            }
        }
    }
}

/** The sheet's own drag/dismiss affordance -- the modal is hosted with `dragHandle = null` so this
 * one travels with the screen and shows up in the screenshot tests. */
@Composable
private fun DragHandle() {
    Box(
        modifier = Modifier
            .padding(top = 12.dp, bottom = 8.dp)
            .width(36.dp)
            .height(4.dp)
            .clip(RoundedCornerShape(2.dp))
            .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.4f))
    )
}

@Composable
private fun NowPlayingContent(
    nowPlaying: NowPlaying,
    uiState: PlayerUiState,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onTrackSelected: (AudioTrack) -> Unit,
    onPreviousClick: () -> Unit,
    onNextClick: () -> Unit,
    onToggleShuffle: () -> Unit,
    onCycleRepeat: () -> Unit,
    onShareClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // 1. Context caption. Mobile has no collection queue yet, so the source is always the song
        // itself; the caption names it so the sheet says where the audio came from.
        Text(
            text = "PLAYING FROM SONG",
            style = MaterialTheme.typography.labelSmall,
            letterSpacing = 1.5.sp,
            color = MaterialTheme.colorScheme.neutral
        )
        Text(
            text = nowPlaying.song.title,
            style = MaterialTheme.typography.labelLarge,
            color = MaterialTheme.colorScheme.onBackground,
            textAlign = TextAlign.Center,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )

        Spacer(modifier = Modifier.height(24.dp))

        // 2. Artwork -- the recording artist's portrait (docs/screens/player.md "Related assets on
        // the same bucket": `artists/<artist_code>.jpg`). Most codes 404, so the surface fill + note
        // glyph is the *normal* rendering and is styled to look deliberate, not like a failure.
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(24.dp))
                .background(MaterialTheme.colorScheme.surface),
            contentAlignment = Alignment.Center
        ) {
            val artistCode = ImageConfig.artistCode(nowPlaying.track.uid)
            SubcomposeAsyncImage(
                model = ImageConfig.artistImageUrl(artistCode),
                contentDescription = nowPlaying.track.artist,
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize(),
                loading = { ArtworkPlaceholder() },
                error = { ArtworkPlaceholder() }
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // 3. Title + reciter. The credit is the *take's* artist, not the composer
        // (docs/screens/tracks.md "reciter vs author"); the composer is only the fallback.
        Column(modifier = Modifier.fillMaxWidth()) {
            Text(
                text = nowPlaying.song.title,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = nowPlaying.track.artist ?: nowPlaying.song.author,
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.neutral,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 4. Scrubber -- elapsed / remaining.
        Scrubber(
            positionMs = uiState.positionMs,
            durationMs = uiState.durationMs,
            enabled = uiState.playbackState != PlaybackState.ERROR,
            onSeek = onSeek
        )

        Spacer(modifier = Modifier.height(12.dp))

        // 5. Transport -- replaced wholesale by the "audio unavailable" message in the error state,
        // which is the only part of the layout that changes there (docs/screens/player.md v14).
        if (uiState.playbackState == PlaybackState.ERROR) {
            TransportErrorMessage(message = uiState.errorMessage ?: AUDIO_UNAVAILABLE)
        } else {
            TransportRow(
                uiState = uiState,
                takeCount = nowPlaying.availableTracks.size,
                onPlayPauseClick = onPlayPauseClick,
                onPreviousClick = onPreviousClick,
                onNextClick = onNextClick,
                onToggleShuffle = onToggleShuffle,
                onCycleRepeat = onCycleRepeat
            )
        }

        Spacer(modifier = Modifier.height(12.dp))

        // 6. Actions.
        ActionsRow(
            nowPlaying = nowPlaying,
            playOrder = uiState.playOrder,
            onTrackSelected = onTrackSelected,
            onShareClick = onShareClick
        )

        Spacer(modifier = Modifier.height(24.dp))
    }
}

@Composable
private fun ArtworkPlaceholder() {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        MusicNote(
            modifier = Modifier.size(88.dp),
            color = MaterialTheme.colorScheme.neutral.copy(alpha = 0.5f)
        )
    }
}

/**
 * The scrubber (docs/screens/player.md v14 item 4): elapsed on the left, **remaining** (`-m:ss`) on
 * the right rather than total -- "it answers the question a listener actually has". While dragging,
 * both labels follow the thumb and the seek is only committed on release.
 */
@Composable
private fun Scrubber(
    positionMs: Int,
    durationMs: Int,
    enabled: Boolean,
    onSeek: (Int) -> Unit
) {
    val duration = durationMs.coerceAtLeast(0)
    var dragPositionMs by remember { mutableFloatStateOf(-1f) }
    val displayedPositionMs = if (dragPositionMs >= 0f) dragPositionMs.roundToInt() else positionMs
    val remainingMs = (duration - displayedPositionMs).coerceAtLeast(0)

    Column(modifier = Modifier.fillMaxWidth()) {
        Slider(
            value = displayedPositionMs.toFloat().coerceIn(0f, duration.toFloat().coerceAtLeast(0f)),
            valueRange = 0f..duration.toFloat().coerceAtLeast(1f),
            enabled = enabled,
            onValueChange = { dragPositionMs = it },
            onValueChangeFinished = {
                onSeek(displayedPositionMs)
                dragPositionMs = -1f
            },
            colors = SliderDefaults.colors(
                thumbColor = MaterialTheme.colorScheme.surfaceVariant,
                activeTrackColor = MaterialTheme.colorScheme.surfaceVariant,
                inactiveTrackColor = MaterialTheme.colorScheme.outline,
                disabledThumbColor = MaterialTheme.colorScheme.outline,
                disabledActiveTrackColor = MaterialTheme.colorScheme.outline,
                disabledInactiveTrackColor = MaterialTheme.colorScheme.outline
            ),
            modifier = Modifier.fillMaxWidth()
        )
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
                text = "-${formatMillis(remainingMs)}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.neutral
            )
        }
    }
}

/**
 * Five controls on one line (docs/screens/player.md v14 item 5). On single-take songs shuffle,
 * repeat and the skip arrows render **muted but not disabled**, so the row never reflows between a
 * one-take and a nine-take song -- the spec's "enabled-but-inert-looking" rule.
 */
@Composable
private fun TransportRow(
    uiState: PlayerUiState,
    takeCount: Int,
    onPlayPauseClick: () -> Unit,
    onPreviousClick: () -> Unit,
    onNextClick: () -> Unit,
    onToggleShuffle: () -> Unit,
    onCycleRepeat: () -> Unit
) {
    val inert = takeCount <= 1
    val accent = MaterialTheme.colorScheme.surfaceVariant
    val muted = MaterialTheme.colorScheme.neutral
    val inertTint = muted.copy(alpha = 0.4f)

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        TransportIcon(
            icon = Icons.Default.Shuffle,
            contentDescription = if (uiState.shuffle) "Shuffle on" else "Shuffle off",
            tint = if (uiState.shuffle) accent else if (inert) inertTint else muted,
            onClick = onToggleShuffle
        )
        TransportIcon(
            icon = Icons.Default.SkipPrevious,
            contentDescription = "Previous take",
            tint = if (inert) inertTint else MaterialTheme.colorScheme.onBackground,
            size = 36.dp,
            onClick = onPreviousClick
        )

        // Play/pause: the one large filled circle the row is built around.
        Box(
            modifier = Modifier
                .size(72.dp)
                .clip(CircleShape)
                .background(accent)
                .clickable(onClick = onPlayPauseClick),
            contentAlignment = Alignment.Center
        ) {
            if (uiState.playbackState == PlaybackState.LOADING) {
                CircularProgressIndicator(
                    modifier = Modifier.size(28.dp),
                    strokeWidth = 3.dp,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            } else {
                val playing = uiState.playbackState == PlaybackState.PLAYING
                Icon(
                    imageVector = if (playing) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (playing) "Pause" else "Play",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(36.dp)
                )
            }
        }

        TransportIcon(
            icon = Icons.Default.SkipNext,
            contentDescription = "Next take",
            tint = if (inert) inertTint else MaterialTheme.colorScheme.onBackground,
            size = 36.dp,
            onClick = onNextClick
        )
        // Repeat carries its three states in the icon itself: off/all share the loop glyph and are
        // told apart by tint, `one` swaps to the numbered glyph.
        TransportIcon(
            icon = if (uiState.repeatMode == RepeatMode.ONE) Icons.Default.RepeatOne else Icons.Default.Repeat,
            contentDescription = when (uiState.repeatMode) {
                RepeatMode.OFF -> "Repeat off"
                RepeatMode.ALL -> "Repeat all takes"
                RepeatMode.ONE -> "Repeat this take"
            },
            tint = when {
                uiState.repeatMode != RepeatMode.OFF -> accent
                inert -> inertTint
                else -> muted
            },
            onClick = onCycleRepeat
        )
    }
}

@Composable
private fun TransportIcon(
    icon: ImageVector,
    contentDescription: String,
    tint: Color,
    onClick: () -> Unit,
    size: androidx.compose.ui.unit.Dp = 26.dp
) {
    IconButton(onClick = onClick) {
        Icon(
            imageVector = icon,
            contentDescription = contentDescription,
            tint = tint,
            modifier = Modifier.size(size)
        )
    }
}

/** The error state's stand-in for the transport row -- the rest of the layout is untouched. */
@Composable
private fun TransportErrorMessage(message: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .height(72.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.ErrorOutline,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.neutral,
            modifier = Modifier.size(24.dp)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text(
            text = message,
            style = MaterialTheme.typography.titleMedium,
            color = MaterialTheme.colorScheme.neutral
        )
    }
}

/**
 * Actions row (docs/screens/player.md v14 item 6): the take/recordings picker showing the count, a
 * share action, and the queue. Mobile's queue *is* the song's takes, so the queue button lists them
 * in [playOrder] -- the shuffled sequence when shuffle is on -- while the picker lists them as the
 * song ships them.
 */
@Composable
private fun ActionsRow(
    nowPlaying: NowPlaying,
    playOrder: List<String>,
    onTrackSelected: (AudioTrack) -> Unit,
    onShareClick: () -> Unit
) {
    val tracks = nowPlaying.availableTracks
    val queued = playOrder.mapNotNull { uid -> tracks.firstOrNull { it.uid == uid } }
        .ifEmpty { tracks }

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        TakeMenuAction(
            icon = Icons.AutoMirrored.Filled.PlaylistPlay,
            contentDescription = "Recordings",
            badge = tracks.size.toString(),
            tracks = tracks,
            currentUid = nowPlaying.track.uid,
            onTrackSelected = onTrackSelected
        )

        IconButton(onClick = onShareClick) {
            Icon(
                imageVector = Icons.Default.Share,
                contentDescription = "Share",
                tint = MaterialTheme.colorScheme.neutral,
                modifier = Modifier.size(22.dp)
            )
        }

        TakeMenuAction(
            icon = Icons.AutoMirrored.Filled.QueueMusic,
            contentDescription = "Queue",
            badge = null,
            tracks = queued,
            currentUid = nowPlaying.track.uid,
            onTrackSelected = onTrackSelected
        )
    }
}

/** An actions-row button that drops down a list of takes, ticking the one that is loaded. */
@Composable
private fun TakeMenuAction(
    icon: ImageVector,
    contentDescription: String,
    badge: String?,
    tracks: List<AudioTrack>,
    currentUid: String,
    onTrackSelected: (AudioTrack) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(16.dp))
                .clickable { expanded = true }
                .padding(horizontal = 12.dp, vertical = 8.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Icon(
                imageVector = icon,
                contentDescription = contentDescription,
                tint = MaterialTheme.colorScheme.neutral,
                modifier = Modifier.size(22.dp)
            )
            if (badge != null) {
                Text(
                    text = badge,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.neutral
                )
            }
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            tracks.forEach { track ->
                val selected = track.uid == currentUid
                DropdownMenuItem(
                    text = {
                        Text(
                            text = track.artist ?: track.uid,
                            color = if (selected) MaterialTheme.colorScheme.surfaceVariant
                            else MaterialTheme.colorScheme.onSurface
                        )
                    },
                    trailingIcon = if (selected) {
                        {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Playing",
                                tint = MaterialTheme.colorScheme.surfaceVariant
                            )
                        }
                    } else null,
                    onClick = {
                        expanded = false
                        onTrackSelected(track)
                    }
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
            .padding(32.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = Icons.Default.ErrorOutline,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.neutral,
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(12.dp))
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

private const val AUDIO_UNAVAILABLE = "Audio unavailable"

/** m:ss formatting for the scrubber's elapsed / remaining labels. */
private fun formatMillis(ms: Int): String {
    val totalSeconds = (ms / 1000).coerceAtLeast(0)
    val minutes = totalSeconds / 60
    val seconds = totalSeconds % 60
    return "%d:%02d".format(minutes, seconds)
}

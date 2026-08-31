package com.gaudiyakirtan.myapplication.ui.player

import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.SkipNext
import androidx.compose.material.icons.filled.SkipPrevious
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
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
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import coil3.compose.SubcomposeAsyncImage
import com.gaudiyakirtan.data.ImageConfig
import com.gaudiyakirtan.myapplication.models.AudioTrack
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.components.icons.Mridanga
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.services.NowPlaying
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import kotlin.math.roundToInt

/** Immersive native Now Playing surface. Playback remains owned by the activity-scoped player. */
@Composable
fun PlayerScreen(
    uiState: PlayerUiState,
    onBackClick: () -> Unit,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onTrackSelected: (AudioTrack) -> Unit,
    onPreviousTrack: () -> Unit = {},
    onNextTrack: () -> Unit = {}
) {
    Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
        val nowPlaying = uiState.nowPlaying
        when {
            nowPlaying == null && uiState.playbackState == PlaybackState.ERROR ->
                ErrorState(message = uiState.errorMessage ?: "Audio unavailable")

            nowPlaying == null -> IdleState()

            else -> Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
            ) {
                ListeningStage(
                    nowPlaying = nowPlaying,
                    uiState = uiState,
                    onBackClick = onBackClick,
                    onPlayPauseClick = onPlayPauseClick,
                    onSeek = onSeek,
                    onPreviousTrack = onPreviousTrack,
                    onNextTrack = onNextTrack
                )
                SupportingInformation(
                    nowPlaying = nowPlaying,
                    onTrackSelected = onTrackSelected,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = Spacing.md)
                )
            }
        }
    }
}

@Composable
private fun ListeningStage(
    nowPlaying: NowPlaying,
    uiState: PlayerUiState,
    onBackClick: () -> Unit,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onPreviousTrack: () -> Unit,
    onNextTrack: () -> Unit
) {
    val stageShape = RoundedCornerShape(30.dp)
    Box(
        modifier = Modifier
            .padding(horizontal = 12.dp, vertical = 12.dp)
            .fillMaxWidth()
            .height(720.dp)
            .clip(stageShape)
            .background(MaterialTheme.colorScheme.surface)
    ) {
        StageArtwork(track = nowPlaying.track)

        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        0f to MaterialTheme.colorScheme.background.copy(alpha = 0.04f),
                        0.38f to MaterialTheme.colorScheme.background.copy(alpha = 0.12f),
                        0.68f to MaterialTheme.colorScheme.background.copy(alpha = 0.90f),
                        1f to MaterialTheme.colorScheme.background
                    )
                )
        )

        Column(modifier = Modifier.fillMaxSize().padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
                ) {
                    Text(
                        text = "NOW PLAYING",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurface,
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 10.dp)
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                Surface(
                    shape = CircleShape,
                    color = MaterialTheme.colorScheme.surface.copy(alpha = 0.9f)
                ) {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.Default.KeyboardArrowDown,
                            contentDescription = "Collapse player",
                            tint = MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            Text(
                text = nowPlaying.song.title,
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground,
                textAlign = TextAlign.Center,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.fillMaxWidth()
            )
            nowPlaying.track.artist?.let { artist ->
                Text(
                    text = artist,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.76f),
                    textAlign = TextAlign.Center,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.fillMaxWidth().padding(top = 4.dp)
                )
            }

            when (uiState.playbackState) {
                PlaybackState.ERROR -> Row(
                    modifier = Modifier.fillMaxWidth().padding(vertical = Spacing.xl),
                    horizontalArrangement = Arrangement.Center,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.ErrorOutline,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.onBackground
                    )
                    Text(
                        text = uiState.errorMessage ?: "Audio unavailable",
                        color = MaterialTheme.colorScheme.onBackground,
                        modifier = Modifier.padding(start = Spacing.sm)
                    )
                }

                PlaybackState.LOADING -> Box(
                    modifier = Modifier.fillMaxWidth().height(176.dp),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = MaterialTheme.colorScheme.primary)
                }

                else -> PlaybackControls(
                    uiState = uiState,
                    waveformSeed = nowPlaying.track.uid,
                    hasMultipleTracks = nowPlaying.availableTracks.size > 1,
                    onPlayPauseClick = onPlayPauseClick,
                    onSeek = onSeek,
                    onPreviousTrack = onPreviousTrack,
                    onNextTrack = onNextTrack
                )
            }
        }
    }
}

@Composable
private fun StageArtwork(track: AudioTrack) {
    val artistCode = ImageConfig.artistCode(track.uid)
    SubcomposeAsyncImage(
        model = ImageConfig.artistImageUrl(artistCode),
        contentDescription = null,
        contentScale = ContentScale.Crop,
        modifier = Modifier.fillMaxSize(),
        loading = { ArtworkFallback() },
        error = { ArtworkFallback() }
    )
}

@Composable
private fun ArtworkFallback() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.linearGradient(
                    listOf(
                        MaterialTheme.colorScheme.surface,
                        MaterialTheme.colorScheme.primary.copy(alpha = 0.34f),
                        MaterialTheme.colorScheme.background
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Mridanga(size = 150.dp)
    }
}

@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
private fun PlaybackControls(
    uiState: PlayerUiState,
    waveformSeed: String,
    hasMultipleTracks: Boolean,
    onPlayPauseClick: () -> Unit,
    onSeek: (Int) -> Unit,
    onPreviousTrack: () -> Unit,
    onNextTrack: () -> Unit
) {
    val duration = uiState.durationMs.coerceAtLeast(0)
    var dragPositionMs by remember { mutableFloatStateOf(-1f) }
    val displayedPositionMs = if (dragPositionMs >= 0f) {
        dragPositionMs.roundToInt()
    } else {
        uiState.positionMs.coerceIn(0, duration.coerceAtLeast(0))
    }

    Column(
        modifier = Modifier.fillMaxWidth().padding(top = 18.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        WaveformSeekBar(
            seed = waveformSeed,
            positionMs = displayedPositionMs,
            durationMs = duration,
            onPositionChange = { dragPositionMs = it.toFloat() },
            onPositionChangeFinished = {
                if (duration > 0) onSeek(displayedPositionMs.coerceIn(0, duration))
                dragPositionMs = -1f
            }
        )

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(
                text = formatMillis(displayedPositionMs),
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.68f)
            )
            Text(
                text = "−${formatMillis((duration - displayedPositionMs).coerceAtLeast(0))}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onBackground.copy(alpha = 0.68f)
            )
        }

        Spacer(modifier = Modifier.height(Spacing.md))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(42.dp)
        ) {
            IconButton(onClick = onPreviousTrack, enabled = hasMultipleTracks) {
                Icon(
                    imageVector = Icons.Default.SkipPrevious,
                    contentDescription = "Previous recording",
                    tint = if (hasMultipleTracks) {
                        MaterialTheme.colorScheme.onBackground
                    } else {
                        Color.Transparent
                    }
                )
            }

            val isPlaying = uiState.playbackState == PlaybackState.PLAYING
            val playCorner by animateDpAsState(
                targetValue = if (isPlaying) 20.dp else 36.dp,
                animationSpec = MaterialTheme.motionScheme.fastSpatialSpec(),
                label = "playPauseShape"
            )
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(playCorner))
                    .background(MaterialTheme.colorScheme.primary)
                    .clickable(onClick = onPlayPauseClick),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = if (isPlaying) Icons.Default.Pause else Icons.Default.PlayArrow,
                    contentDescription = if (isPlaying) "Pause" else "Play",
                    tint = MaterialTheme.colorScheme.onPrimary,
                    modifier = Modifier.size(34.dp)
                )
            }

            IconButton(onClick = onNextTrack, enabled = hasMultipleTracks) {
                Icon(
                    imageVector = Icons.Default.SkipNext,
                    contentDescription = "Next recording",
                    tint = if (hasMultipleTracks) {
                        MaterialTheme.colorScheme.onBackground
                    } else {
                        Color.Transparent
                    }
                )
            }
        }
    }
}

@Composable
private fun WaveformSeekBar(
    seed: String,
    positionMs: Int,
    durationMs: Int,
    onPositionChange: (Int) -> Unit,
    onPositionChangeFinished: () -> Unit
) {
    val barCount = 64
    val heights = remember(seed) { nativePlayerWaveformHeights(seed, barCount) }
    val progress = if (durationMs > 0) {
        positionMs.toFloat().div(durationMs).coerceIn(0f, 1f)
    } else {
        0f
    }
    val playedColor = MaterialTheme.colorScheme.primary
    val unplayedColor = MaterialTheme.colorScheme.neutral.copy(alpha = 0.34f)

    Box(modifier = Modifier.fillMaxWidth().height(82.dp), contentAlignment = Alignment.Center) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .clearAndSetSemantics { }
        ) {
            val spacing = 2.dp.toPx()
            val barWidth = ((size.width - spacing * (barCount - 1)) / barCount).coerceAtLeast(1.5f)
            heights.forEachIndexed { index, relativeHeight ->
                val barHeight = (size.height * relativeHeight).coerceAtLeast(8.dp.toPx())
                val x = index * (barWidth + spacing)
                drawRoundRect(
                    color = if (x + barWidth / 2 <= size.width * progress) playedColor else unplayedColor,
                    topLeft = androidx.compose.ui.geometry.Offset(x, (size.height - barHeight) / 2),
                    size = androidx.compose.ui.geometry.Size(barWidth, barHeight),
                    cornerRadius = CornerRadius(barWidth / 2, barWidth / 2)
                )
            }
        }

        // A real transparent Slider retains drag, keyboard, Switch Access and TalkBack's adjustable
        // semantics. The bars are decoration, so the screen exposes exactly one seek control.
        Slider(
            value = positionMs.toFloat().coerceIn(0f, durationMs.toFloat().coerceAtLeast(0f)),
            valueRange = 0f..durationMs.toFloat().coerceAtLeast(1f),
            onValueChange = { onPositionChange(it.roundToInt()) },
            onValueChangeFinished = onPositionChangeFinished,
            enabled = durationMs > 0,
            colors = SliderDefaults.colors(
                thumbColor = Color.Transparent,
                disabledThumbColor = Color.Transparent,
                activeTrackColor = Color.Transparent,
                inactiveTrackColor = Color.Transparent,
                disabledActiveTrackColor = Color.Transparent,
                disabledInactiveTrackColor = Color.Transparent
            ),
            modifier = Modifier.fillMaxWidth()
        )
    }
}

/** Stable decorative profile; it is not presented as measured audio-amplitude data. */
internal fun nativePlayerWaveformHeights(seed: String, count: Int = 64): List<Float> {
    if (count <= 0) return emptyList()
    var hash = 0x811C9DC5.toInt()
    seed.encodeToByteArray().forEach { byte ->
        hash = hash xor (byte.toInt() and 0xFF)
        hash *= 16_777_619
    }
    var state = if (hash == 0) 0x6D2B79F5 else hash
    return List(count) { index ->
        state = state xor (state shl 13)
        state = state xor (state ushr 17)
        state = state xor (state shl 5)
        val random = (state.toUInt() % 1_000u).toFloat() / 1_000f
        val pulse = ((index % 11) + 2).toFloat() / 13f
        0.24f + 0.76f * (random * 0.72f + pulse * 0.28f)
    }
}

@Composable
private fun SupportingInformation(
    nowPlaying: NowPlaying,
    onTrackSelected: (AudioTrack) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Surface(shape = RoundedCornerShape(18.dp), color = MaterialTheme.colorScheme.surface) {
            Column(modifier = Modifier.fillMaxWidth().padding(16.dp)) {
                Text(
                    text = "COMPOSED BY",
                    style = MaterialTheme.typography.labelSmall,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.neutral
                )
                Text(
                    text = nowPlaying.song.author,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface,
                    modifier = Modifier.padding(top = 3.dp)
                )
            }
        }

        if (nowPlaying.availableTracks.size > 1) {
            TakePicker(
                current = nowPlaying.track,
                tracks = nowPlaying.availableTracks,
                onTrackSelected = onTrackSelected
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
        Surface(
            shape = RoundedCornerShape(18.dp),
            color = MaterialTheme.colorScheme.surface,
            modifier = Modifier.fillMaxWidth().clickable { expanded = true }
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "${tracks.size} RECORDINGS",
                        style = MaterialTheme.typography.labelSmall,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.neutral
                    )
                    Text(
                        text = current.artist ?: current.uid,
                        style = MaterialTheme.typography.titleSmall,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 3.dp)
                    )
                }
                Icon(
                    imageVector = Icons.Default.ExpandMore,
                    contentDescription = "Choose recording",
                    tint = MaterialTheme.colorScheme.primary
                )
            }
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

@Composable
private fun ErrorState(message: String) {
    Column(
        modifier = Modifier.fillMaxSize().padding(Spacing.xxl),
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

private fun formatMillis(ms: Int): String {
    val totalSeconds = (ms / 1000).coerceAtLeast(0)
    return "%d:%02d".format(totalSeconds / 60, totalSeconds % 60)
}

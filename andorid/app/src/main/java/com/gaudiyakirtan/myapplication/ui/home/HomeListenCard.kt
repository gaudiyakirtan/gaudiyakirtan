package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.background
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.MenuBook
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.rememberTextMeasurer
import androidx.compose.ui.semantics.*
import androidx.compose.ui.text.font.FontSynthesis
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.navigationFocusOutline
import com.gaudiyakirtan.myapplication.ui.theme.DisplayFontFamily
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.services.*
import kotlinx.coroutines.delay

/** Presentation only. The recommendation owns identity; the shared player owns playback. */
@Composable
@OptIn(ExperimentalMaterial3ExpressiveApi::class, ExperimentalLayoutApi::class)
internal fun HomeListenCard(
    suggestedSong: Song?,
    playerUiState: PlayerUiState,
    listLanguage: String,
    onSongClick: (String) -> Unit,
    onPlaySong: (Song, AudioTrack?) -> Unit,
    onPlayPause: () -> Unit,
    onBrowseRecordings: () -> Unit
) {
    val song = suggestedSong
    val current = playerUiState.nowPlaying?.takeIf { it.song.uid == song?.uid }
    Surface(Modifier.fillMaxWidth().testTag("listen-card"), shape = MaterialTheme.shapes.medium,
        color = MaterialTheme.colorScheme.surface) {
        Box {
            RhythmField(
                Modifier
                    .align(Alignment.TopEnd)
                    .size(180.dp, 120.dp)
                    .padding(top = Spacing.sm)
            )
            Column(Modifier.padding(Spacing.lg), verticalArrangement = Arrangement.spacedBy(Spacing.md)) {
                if (song == null) {
                    Text("Find a song to sing", style = MaterialTheme.typography.headlineSmall)
                    Text("Explore the song library and its recordings.", style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                    TextButton(onClick = onBrowseRecordings, modifier = Modifier.heightIn(min = 48.dp)) {
                        Text("Open library")
                    }
                } else {
                val title = song.titleMain.preferredText(listLanguage)
                val track = current?.track ?: song.audioFiles.firstOrNull()
                val playing = current != null && playerUiState.playbackState == PlaybackState.PLAYING
                val loading = current != null && playerUiState.playbackState == PlaybackState.LOADING
                val error = current != null && playerUiState.playbackState == PlaybackState.ERROR
                val paused = current != null && playerUiState.playbackState == PlaybackState.PAUSED
                var pendingVisible by remember { mutableStateOf(false) }
                LaunchedEffect(loading, song.uid) {
                    pendingVisible = false
                    if (loading) {
                        delay(150)
                        pendingVisible = true
                    }
                }
                Column(Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                    Text(title, style = if (listLanguage == "Latn") {
                        MaterialTheme.typography.headlineSmall.copy(
                            fontFamily = DisplayFontFamily,
                            fontWeight = FontWeight.Normal,
                            fontSynthesis = FontSynthesis.None
                        )
                    } else {
                        MaterialTheme.typography.headlineSmall
                    },
                        modifier = Modifier.padding(horizontal = Spacing.xs).testTag("listen-title"))
                    Text(song.authorDisplay.preferredText(listLanguage),
                        style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    if (playing) Box(Modifier.size(6.dp).background(MaterialTheme.colorScheme.primary, CircleShape)
                        .clearAndSetSemantics { })
                    track?.artist?.takeIf { it.isNotBlank() }?.let {
                        Text("Recording · $it", style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                FlowRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                    verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
                    val readInteractions = remember { MutableInteractionSource() }
                    Button(interactionSource = readInteractions, onClick = { onSongClick(song.uid) },
                        shape = MaterialTheme.shapes.small,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.onSurface,
                            contentColor = MaterialTheme.colorScheme.background
                        ),
                        modifier = Modifier.heightIn(min = 48.dp).testTag("listen-song").navigationFocusOutline(readInteractions, MaterialTheme.shapes.small)
                            .semantics { contentDescription = "Read & sing $title" },
                        contentPadding = PaddingValues(horizontal = Spacing.md, vertical = Spacing.sm)) {
                        Icon(Icons.AutoMirrored.Filled.MenuBook, null, Modifier.size(20.dp))
                        Spacer(Modifier.width(Spacing.sm))
                        Text("Read & sing")
                    }
                    if (track != null) {
                        val label = when {
                            loading -> "Loading"
                            error -> "Retry"
                            playing -> "Pause"
                            paused -> "Resume"
                            else -> "Play recording"
                        }
                        val playLabelWidth = with(LocalDensity.current) {
                            rememberTextMeasurer().measure("Play recording", MaterialTheme.typography.labelLarge).size.width.toDp()
                        }
                        val playInteractions = remember { MutableInteractionSource() }
                        TextButton(interactionSource = playInteractions, onClick = {
                            when {
                                loading -> Unit
                                playing || paused -> onPlayPause()
                                else -> onPlaySong(song, track)
                            }
                        }, shape = MaterialTheme.shapes.small,
                            colors = ButtonDefaults.textButtonColors(
                                contentColor = MaterialTheme.colorScheme.onSurface
                            ),
                            contentPadding = PaddingValues(horizontal = Spacing.sm, vertical = Spacing.sm),
                            modifier = Modifier.widthIn(min = playLabelWidth + 20.dp + Spacing.xs + Spacing.sm * 2)
                                .heightIn(min = 48.dp).testTag("listen-play")
                                .navigationFocusOutline(playInteractions, MaterialTheme.shapes.small).semantics {
                                contentDescription = "$label $title"
                                stateDescription = when {
                                    loading -> "Loading recording"
                                    error -> "Audio unavailable"
                                    playing -> "Playing"
                                    paused -> "Paused"
                                    else -> "Ready"
                                }
                            }) {
                            val icon = when {
                                pendingVisible && loading -> Icons.Default.HourglassEmpty
                                error -> Icons.Default.Refresh
                                playing -> Icons.Default.Pause
                                else -> Icons.Default.PlayArrow
                            }
                            // Effects only in a fixed box. Compose applies the system animator
                            // duration scale, including an immediate replacement when disabled.
                            Crossfade(icon, Modifier.size(20.dp),
                                animationSpec = MaterialTheme.motionScheme.fastEffectsSpec(), label = "home-playback-icon") {
                                Icon(it, null, Modifier.size(20.dp).then(
                                    if (it == Icons.Default.HourglassEmpty) Modifier.testTag("listen-pending") else Modifier))
                            }
                            Spacer(Modifier.width(Spacing.xs))
                            Text(label)
                        }
                    }
                }
                }
            }
        }
    }
}

/** Offline vector master from components v9; uniformly scaled and silent to TalkBack. */
@Composable
private fun RhythmField(modifier: Modifier = Modifier) {
    val accent = MaterialTheme.colorScheme.primary
    val ink = MaterialTheme.colorScheme.onSurface
    Canvas(modifier.clearAndSetSemantics { }) {
        scale(size.width / 360f, size.height / 240f, pivot = Offset.Zero) {
            drawPath(Path().apply { moveTo(24f, 76f); cubicTo(116f, 12f, 240f, 16f, 338f, 90f) },
                accent.copy(alpha = 0.18f), style = Stroke(28f, cap = StrokeCap.Round))
            drawPath(Path().apply { moveTo(12f, 112f); cubicTo(124f, 48f, 252f, 64f, 356f, 140f) },
                ink.copy(alpha = 0.08f), style = Stroke(18f, cap = StrokeCap.Round))
            listOf(48f, 76f, 112f, 168f, 196f, 252f).forEach { x ->
                drawRoundRect(accent.copy(alpha = 0.55f), Offset(x, 180f), Size(8f, 24f), CornerRadius(4f))
            }
        }
    }
}

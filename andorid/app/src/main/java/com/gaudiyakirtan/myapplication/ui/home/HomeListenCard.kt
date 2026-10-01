package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.OpenInNew
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.*
import androidx.compose.ui.unit.dp
import coil3.compose.SubcomposeAsyncImage
import com.gaudiyakirtan.data.ImageConfig
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.components.NavigationSurface
import com.gaudiyakirtan.services.*

/** Presentation only. AppNavigation supplies the one shared player and all playback commands. */
@Composable
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
internal fun HomeListenCard(
    suggestedSong: Song?,
    playerUiState: PlayerUiState,
    listLanguage: String,
    onSongClick: (String) -> Unit,
    onPlaySong: (Song) -> Unit,
    onPlayPause: () -> Unit,
    onBrowseRecordings: () -> Unit
) {
    val current = playerUiState.nowPlaying
    val song = current?.song ?: suggestedSong?.takeIf { it.audioFiles.isNotEmpty() }
    val enlarged = LocalDensity.current.fontScale >= 1.5f
    HomeCard(Modifier.testTag("listen-card")) {
        Column(Modifier.heightIn(min = 260.dp).padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
            if (song == null) {
                Text("Choose a recording", style = MaterialTheme.typography.headlineSmall,
                    color = MaterialTheme.colorScheme.onSurface)
                Text("Browse performances from across the song library.", style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
                TextButton(onClick = onBrowseRecordings, modifier = Modifier.heightIn(min = 48.dp)) {
                    Text("Open library", color = MaterialTheme.colorScheme.onSurface)
                }
            } else {
                val title = song.titleMain.preferredText(listLanguage)
                val track = current?.track ?: song.audioFiles.first()
                val author = track.artist ?: song.authorDisplay.preferredText(listLanguage)
                val playing = current != null && playerUiState.playbackState == PlaybackState.PLAYING
                val loading = current != null && playerUiState.playbackState == PlaybackState.LOADING
                val error = current != null && playerUiState.playbackState == PlaybackState.ERROR
                val position = if (current != null) playerUiState.positionMs.coerceAtLeast(0) else 0
                val duration = if (current != null) playerUiState.durationMs.coerceAtLeast(0) else 0
                val portrait: @Composable () -> Unit = {
                    SubcomposeAsyncImage(model = ImageConfig.artistImageUrl(ImageConfig.artistCode(track.uid)),
                        contentDescription = track.artist?.let { "Performer: $it" }, contentScale = ContentScale.Crop,
                        modifier = Modifier.size(72.dp).clip(RoundedCornerShape(18.dp)),
                        loading = { PerformerInitial(track.artist) }, error = { PerformerInitial(track.artist) })
                }
                val copy: @Composable () -> Unit = {
                    NavigationSurface({ onSongClick(song.uid) }, Modifier.testTag("listen-song")) {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(title, style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.onSurface)
                            Text(author, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }
                }
                if (enlarged) Column(verticalArrangement = Arrangement.spacedBy(16.dp)) { portrait(); copy() }
                else Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(18.dp)) {
                    portrait()
                    Box(Modifier.weight(1f)) { copy() }
                }
                val takes = current?.availableTracks?.size ?: song.audioFiles.size
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    IconButton(onClick = { onSongClick(song.uid) }, modifier = Modifier.size(48.dp)
                        .background(MaterialTheme.colorScheme.outlineVariant.copy(alpha = 0.4f), CircleShape)) {
                        Icon(Icons.AutoMirrored.Filled.OpenInNew, "Open $title", Modifier.size(20.dp))
                    }
                    FilledIconButton(
                        onClick = {
                            when {
                                error -> onPlaySong(song)
                                current != null && playerUiState.playbackState in listOf(PlaybackState.PLAYING, PlaybackState.PAUSED) -> onPlayPause()
                                else -> onPlaySong(song)
                            }
                        }, enabled = !loading,
                        modifier = Modifier.size(56.dp).testTag("listen-play").semantics {
                            stateDescription = when {
                                loading -> "Loading recording"
                                error -> "Audio unavailable"
                                playing -> "Playing"
                                current != null -> "Paused"
                                else -> "Ready"
                            }
                        },
                        colors = IconButtonDefaults.filledIconButtonColors(
                            containerColor = MaterialTheme.colorScheme.onSurface,
                            contentColor = MaterialTheme.colorScheme.surface)
                    ) {
                        val icon = when {
                            error -> Icons.Default.Refresh
                            playing -> Icons.Default.Pause
                            else -> Icons.Default.PlayArrow
                        }
                        Crossfade(targetState = icon, animationSpec = MaterialTheme.motionScheme.fastEffectsSpec(),
                            label = "home-listen-icon") { stateIcon ->
                            Icon(stateIcon, when { error -> "Open player to retry $title"; loading -> "Loading $title";
                                playing -> "Pause $title"; else -> "Play $title" })
                        }
                    }
                    if (!enlarged) Text("$takes ${if (takes == 1) "take" else "takes"}",
                        Modifier.weight(1f), style = MaterialTheme.typography.labelMedium,
                        textAlign = androidx.compose.ui.text.style.TextAlign.End, color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
                if (enlarged) Text("$takes ${if (takes == 1) "take" else "takes"}",
                    style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    // Read-only progress: no fabricated time and no second seek control/session.
                    LinearProgressIndicator(progress = { if (duration > 0) (position.toFloat() / duration).coerceIn(0f, 1f) else 0f },
                        modifier = Modifier.fillMaxWidth().height(3.dp).clearAndSetSemantics { },
                        color = MaterialTheme.colorScheme.onSurface,
                        trackColor = MaterialTheme.colorScheme.outlineVariant, drawStopIndicator = {})
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(homePlaybackTime(position), style = MaterialTheme.typography.labelMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(if (duration > 0) "−${homePlaybackTime((duration - position).coerceAtLeast(0))}" else when { loading -> "loading"; error -> "unavailable"; else -> "ready" },
                            style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
            }
        }
    }
}

@Composable
private fun PerformerInitial(artist: String?) {
    Box(Modifier.fillMaxSize().background(MaterialTheme.colorScheme.outlineVariant), contentAlignment = Alignment.Center) {
        Text(artist?.firstOrNull()?.uppercase() ?: "♪", style = MaterialTheme.typography.headlineMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.clearAndSetSemantics { })
    }
}

internal fun homePlaybackTime(milliseconds: Int): String {
    val seconds = milliseconds.coerceAtLeast(0) / 1000
    return "${seconds / 60}:${(seconds % 60).toString().padStart(2, '0')}"
}

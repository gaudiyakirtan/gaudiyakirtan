package com.gaudiyakirtan.myapplication.ui.player

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3ExpressiveApi
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearWavyProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.components.icons.Mridanga
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState

/**
 * Compact mini-player bar (docs/screens/player.md `Track` / `trailingIcon2_` frames): title +
 * play/pause, sits above the tab bar while a track is loaded, tappable (anywhere but the button) to
 * expand to Now Playing. Renders nothing when [PlayerUiState.nowPlaying] is null and there is no
 * error to surface.
 */
@OptIn(ExperimentalMaterial3ExpressiveApi::class)
@Composable
fun MiniPlayerBar(
    uiState: PlayerUiState,
    onExpandClick: () -> Unit,
    onPlayPauseClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val nowPlaying = uiState.nowPlaying
    if (nowPlaying == null && uiState.playbackState != PlaybackState.ERROR) return

    val isPlaying = uiState.playbackState == PlaybackState.PLAYING
    // Same wavy = playing / flat = paused language as the Now Playing scrubber, so the two views
    // report state identically. The bar carries no scrubbing, so this one is purely an indicator.
    val amplitude by animateFloatAsState(
        targetValue = if (isPlaying) 1f else 0f,
        animationSpec = MaterialTheme.motionScheme.slowSpatialSpec(),
        label = "miniBarAmplitude"
    )
    val duration = uiState.durationMs.coerceAtLeast(0)

    Surface(
        modifier = modifier
            .fillMaxWidth()
            .height(56.dp)
            .clickable(onClick = onExpandClick),
        color = MaterialTheme.colorScheme.surface
    ) {
      Box(modifier = Modifier.fillMaxSize()) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = Spacing.md),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.md)
        ) {
            // Same mridanga mark as the home search bar, so the two surfaces agree on what the
            // app's music icon is. Full colour, so it needs no tinted backing circle.
            Box(
                modifier = Modifier.size(36.dp),
                contentAlignment = Alignment.Center
            ) {
                Mridanga(size = 32.dp)
            }

            Column(modifier = Modifier.weight(1f)) {
                if (nowPlaying != null) {
                    Text(
                        text = nowPlaying.song.title,
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.onSurface,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = nowPlaying.track.artist ?: nowPlaying.song.author,
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.neutral,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                } else {
                    Text(
                        text = uiState.errorMessage ?: "Audio unavailable",
                        style = MaterialTheme.typography.labelLarge,
                        color = MaterialTheme.colorScheme.neutral,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            when (uiState.playbackState) {
                PlaybackState.LOADING -> CircularProgressIndicator(
                    modifier = Modifier.size(24.dp),
                    strokeWidth = 2.dp,
                    color = MaterialTheme.colorScheme.primary
                )
                PlaybackState.ERROR -> Icon(
                    imageVector = Icons.Default.ErrorOutline,
                    contentDescription = "Audio unavailable",
                    tint = MaterialTheme.colorScheme.neutral
                )
                else -> IconButton(onClick = onPlayPauseClick) {
                    Icon(
                        imageVector = if (uiState.playbackState == PlaybackState.PLAYING) {
                            Icons.Default.Pause
                        } else {
                            Icons.Default.PlayArrow
                        },
                        contentDescription = if (uiState.playbackState == PlaybackState.PLAYING) "Pause" else "Play",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }

        // Semantics cleared: the full player owns the announced position/duration, and the bar's
        // own semantics should stay "expand" + "play/pause" rather than gaining a second slider.
        if (nowPlaying != null) {
            LinearWavyProgressIndicator(
                progress = {
                    if (duration > 0) {
                        (uiState.positionMs.toFloat() / duration.toFloat()).coerceIn(0f, 1f)
                    } else {
                        0f
                    }
                },
                amplitude = { amplitude },
                color = MaterialTheme.colorScheme.primary,
                trackColor = MaterialTheme.colorScheme.outline,
                modifier = Modifier
                    .fillMaxWidth()
                    .align(Alignment.BottomCenter)
                    .clearAndSetSemantics { }
            )
        }
      }
    }
}

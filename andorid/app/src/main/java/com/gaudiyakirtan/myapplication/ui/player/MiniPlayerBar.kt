package com.gaudiyakirtan.myapplication.ui.player

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.ErrorOutline
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.models.ScriptOptions
import com.gaudiyakirtan.myapplication.models.author
import com.gaudiyakirtan.myapplication.models.titleForListLanguage
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote
import com.gaudiyakirtan.services.LastVisitedSong
import com.gaudiyakirtan.services.MiniPlayerSlot
import com.gaudiyakirtan.services.PlaybackState
import com.gaudiyakirtan.services.PlayerUiState
import com.gaudiyakirtan.services.resolveMiniPlayerSlot

/** The bar's height, identical in both states -- nothing about the app changes size when playback
 * starts or stops (docs/screens/player.md v15: "the same bar, same height"). */
private val BAR_HEIGHT = 56.dp

/**
 * Compact mini-player bar (docs/screens/player.md `Track` / `trailingIcon2_` frames), sitting above
 * the tab bar everywhere except song-detail (v14, where the toolbar carries a pill instead).
 *
 * Per **v15** the slot is never empty once the reader has opened a single song. Which of its states
 * shows is decided by the pure [resolveMiniPlayerSlot] -- whatever is loaded in the player always
 * wins, and [lastVisited] only fills the gap:
 *
 *  - **Playing** -- a take is loaded (or a load failed): title + **reciter** and a play/pause
 *    transport, tappable to expand to Now Playing.
 *  - **Resting** -- nothing loaded: the last visited song's title + its **author** (no take is
 *    chosen, so there is no reciter to name) and a single **play** affordance. Tapping it starts the
 *    song's first take rather than opening Now Playing, which would have nothing to show. A song
 *    with no audio keeps the slot but swaps the play control for an open-song chevron.
 *  - **Absent** -- nothing rendered at all, only on a fresh install.
 *
 * @param listLanguage the reader's chosen list script (docs/screens/settings.md `listLanguage`); the
 *   bar's title follows it exactly like the lists it sits under.
 * @param lastVisited resolved by `LastVisitedViewModel` at the navigation root and passed in, the
 *   same way [uiState] is -- the bar never reaches for a ViewModel itself.
 */
@Composable
fun MiniPlayerBar(
    uiState: PlayerUiState,
    onExpandClick: () -> Unit,
    onPlayPauseClick: () -> Unit,
    modifier: Modifier = Modifier,
    listLanguage: String = ScriptOptions.LATIN,
    lastVisited: LastVisitedSong? = null,
    /** Resting bar, song has audio: start its first take (never opens Now Playing). */
    onRestingPlayClick: (LastVisitedSong) -> Unit = {},
    /** Resting bar, song has no audio: the chevron opens the song itself. */
    onRestingOpenClick: (LastVisitedSong) -> Unit = {}
) {
    when (val slot = resolveMiniPlayerSlot(uiState.nowPlaying, uiState.playbackState, lastVisited)) {
        MiniPlayerSlot.Absent -> return

        MiniPlayerSlot.Playing -> {
            val nowPlaying = uiState.nowPlaying
            MiniPlayerSurface(modifier = modifier, onClick = onExpandClick) {
                MiniPlayerCredit(
                    title = nowPlaying?.song?.titleForListLanguage(listLanguage),
                    // The reciter of this take, falling back to the composer for takes that ship no
                    // artist (docs/screens/tracks.md "reciter vs author").
                    subtitle = nowPlaying?.let { it.track.artist ?: it.song.author },
                    fallback = uiState.errorMessage ?: "Audio unavailable"
                )
                when (uiState.playbackState) {
                    PlaybackState.LOADING -> CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.surfaceVariant
                    )
                    PlaybackState.ERROR -> Icon(
                        imageVector = Icons.Default.ErrorOutline,
                        contentDescription = "Audio unavailable",
                        tint = MaterialTheme.colorScheme.neutral
                    )
                    else -> {
                        val playing = uiState.playbackState == PlaybackState.PLAYING
                        IconButton(onClick = onPlayPauseClick) {
                            Icon(
                                imageVector = if (playing) Icons.Default.Pause else Icons.Default.PlayArrow,
                                contentDescription = if (playing) "Pause" else "Play",
                                tint = MaterialTheme.colorScheme.surfaceVariant
                            )
                        }
                    }
                }
            }
        }

        is MiniPlayerSlot.Resting -> {
            val song = slot.song
            // One control, one meaning: with audio the whole bar starts the song, without it the
            // whole bar is the way back to the reading screen.
            val onBarClick: () -> Unit =
                if (song.audioAvailable) {
                    { onRestingPlayClick(song) }
                } else {
                    { onRestingOpenClick(song) }
                }
            MiniPlayerSurface(modifier = modifier, onClick = onBarClick) {
                MiniPlayerCredit(title = song.title, subtitle = song.author, fallback = song.uid)
                if (song.audioAvailable) {
                    IconButton(onClick = { onRestingPlayClick(song) }) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Play ${song.title}",
                            tint = MaterialTheme.colorScheme.surfaceVariant
                        )
                    }
                } else {
                    IconButton(onClick = { onRestingOpenClick(song) }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.KeyboardArrowRight,
                            contentDescription = "Open ${song.title}",
                            tint = MaterialTheme.colorScheme.neutral
                        )
                    }
                }
            }
        }
    }
}

/**
 * The bar itself -- fixed height, artwork placeholder, then whatever [content] the state supplies
 * (credit column + one trailing control). Shared by both states so they are literally the same bar.
 *
 * The artwork is the deliberate placeholder (surface fill + note glyph) the spec describes for Now
 * Playing; no portrait is fetched at this size.
 */
@Composable
private fun MiniPlayerSurface(
    modifier: Modifier,
    onClick: () -> Unit,
    content: @Composable RowScope.() -> Unit
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .height(BAR_HEIGHT)
            .clickable(onClick = onClick),
        color = MaterialTheme.colorScheme.surface
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                MusicNote(modifier = Modifier.size(18.dp), color = MaterialTheme.colorScheme.neutral)
            }
            content()
        }
    }
}

/**
 * Title over a muted credit line. [fallback] renders alone when there is no title -- the error state,
 * where the player holds the slot with nothing loaded.
 */
@Composable
private fun RowScope.MiniPlayerCredit(
    title: String?,
    subtitle: String?,
    fallback: String
) {
    Column(modifier = Modifier.weight(1f)) {
        if (title.isNullOrEmpty()) {
            Text(
                text = fallback,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.neutral,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        } else {
            Text(
                text = title,
                style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurface,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            if (!subtitle.isNullOrEmpty()) {
                Text(
                    text = subtitle,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.neutral,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

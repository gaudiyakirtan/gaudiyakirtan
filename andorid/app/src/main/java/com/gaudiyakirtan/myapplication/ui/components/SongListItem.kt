package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.stateDescription
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.ui.components.icons.MusicNote
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.neutral

/** The same scalable title + UID / credit + audio anatomy on Home and every song list. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun SongListItem(
    uid: String,
    title: String,
    authorName: String,
    audioAvailable: Boolean,
    onClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val enlarged = LocalDensity.current.fontScale >= 2f
    NavigationSurface(
        onClick = onClick,
        modifier = modifier.fillMaxWidth().heightIn(min = 56.dp).semantics {
            if (audioAvailable) stateDescription = "Audio available"
        },
        shape = MaterialTheme.shapes.small
    ) {
        Column(
            modifier = Modifier.padding(horizontal = Spacing.md, vertical = Spacing.sm),
            verticalArrangement = Arrangement.spacedBy(Spacing.xxs)
        ) {
            // Flow as a single title group: a long title may put the UID on the next line.
            // Ellipsis is visual only; Text retains the full title in native semantics.
            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm),
                verticalArrangement = Arrangement.spacedBy(Spacing.xs)
            ) {
                Text(
                    text = title,
                    style = MaterialTheme.typography.titleSmall,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = if (enlarged) Int.MAX_VALUE else 2,
                    overflow = TextOverflow.Ellipsis
                )
                RowUidChip(uid)
            }
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(Spacing.sm)
            ) {
                Text(
                    text = authorName,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    maxLines = if (enlarged) Int.MAX_VALUE else 2,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )
                if (audioAvailable) {
                    MusicNote(Modifier.size(16.dp).clearAndSetSemantics { }, MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

/** Non-actionable row variant. Detail/player chips keep their own existing contract. */
@Composable
fun RowUidChip(uid: String, modifier: Modifier = Modifier) {
    Text(
        text = uid.uppercase(),
        style = MaterialTheme.typography.labelSmall,
        color = MaterialTheme.colorScheme.onSurfaceVariant,
        modifier = modifier.clip(MaterialTheme.shapes.small)
            .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.2f))
            .padding(horizontal = Spacing.md, vertical = Spacing.xxs)
    )
}

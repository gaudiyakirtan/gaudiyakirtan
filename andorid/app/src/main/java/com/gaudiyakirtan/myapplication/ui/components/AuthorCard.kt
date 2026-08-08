package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.Author
import com.gaudiyakirtan.myapplication.models.name

/**
 * The canonical [Author] (docs/data/author.md) has no image field -- the shipped corpus carries no
 * author portraits, so this renders an offline-friendly initial-letter placeholder instead of the
 * old hardcoded external image URLs (which also violated the offline-first / no-network-calls
 * requirement).
 *
 * Per docs/screens/browse.md ("No author images/bios ship -- header is name + song count only"):
 * [songCount], when known, renders as a small subtitle under the name.
 */
@Composable
fun AuthorCard(
    author: Author,
    songCount: Int? = null,
    onClick: () -> Unit = {}
) {
    val displayName = author.name

    Column(
        modifier = Modifier
            .width(120.dp)
            .clickable(onClick = onClick),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.2f)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = displayName.firstOrNull()?.uppercase() ?: "?",
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.neutral
            )
        }

        Text(
            text = displayName,
            style = MaterialTheme.typography.bodyMedium,
            maxLines = 2
        )

        if (songCount != null && songCount > 0) {
            Text(
                text = "$songCount songs",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.neutral
            )
        }
    }
}

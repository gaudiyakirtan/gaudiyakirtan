package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.gaudiyakirtan.data.ImageConfig
import com.gaudiyakirtan.myapplication.models.*
import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor
import com.gaudiyakirtan.myapplication.ui.theme.neutral
import com.gaudiyakirtan.myapplication.ui.theme.parseHexColor

/** Home opts into flat shelves; Library's existing wrapping cards remain unchanged. */
@Composable
fun HomeTopicCard(group: SongGroup, modifier: Modifier = Modifier, onClick: () -> Unit) {
    NavigationSurface(onClick, modifier.heightIn(min = 112.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)) {
        Column(Modifier.padding(Spacing.lg), verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            Text(group.title, style = MaterialTheme.typography.labelLarge,
                color = MaterialTheme.colorScheme.onSurface)
            Text("${group.songCount} songs", style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}

@Composable
fun HomeBookCard(group: SongGroup, modifier: Modifier = Modifier, onClick: () -> Unit) {
    val fallback = parseHexColor(group.color) ?: getMediaColor(group.title)
    NavigationSurface(onClick, modifier,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)) {
        Column {
            AsyncImage(
                model = ImageConfig.bookCoverUrl(ImageConfig.bookSlugFromGroupUid(group.uid)),
                contentDescription = null,
                contentScale = ContentScale.Fit,
                placeholder = ColorPainter(fallback),
                error = ColorPainter(fallback),
                modifier = Modifier.widthIn(max = 160.dp).fillMaxWidth().aspectRatio(3f / 4f)
                    .align(Alignment.CenterHorizontally)
                    .background(fallback)
            )
            Column(Modifier.padding(Spacing.md), verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                Text(group.title, style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurface)
                Text("${group.songCount} songs", style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

@Composable
fun HomeAuthorCard(
    author: Author,
    songCount: Int?,
    listLanguage: String,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    val name = author.names.preferredText(listLanguage)
    NavigationSurface(onClick, modifier.heightIn(min = 88.dp),
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant)) {
        Row(Modifier.padding(Spacing.md), verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Spacing.md)) {
            // No portraits ship in the author catalog. Keep the existing initials fallback.
            Box(Modifier.size(48.dp).clip(CircleShape)
                .background(MaterialTheme.colorScheme.neutral.copy(alpha = 0.2f))
                .clearAndSetSemantics { }, contentAlignment = Alignment.Center) {
                Text(name.firstOrNull()?.uppercase().orEmpty(),
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(Spacing.xs)) {
                Text(name, style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.onSurface)
                if (songCount != null) {
                    Text("$songCount songs", style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

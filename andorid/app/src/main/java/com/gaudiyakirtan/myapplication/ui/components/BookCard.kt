package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import com.gaudiyakirtan.data.ImageConfig
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.models.songCount
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor
import com.gaudiyakirtan.myapplication.ui.theme.parseHexColor

/**
 * A Book [SongGroup] card (docs/data/collections.md `SongGroup(kind = book)`): cover art when the
 * bucket has one for this book (collections.md "Cover images", `most slugs 404`), falling back to
 * the group's own pipeline `color` (or, failing that, a deterministic [getMediaColor]-derived one)
 * -- Coil's `error` painter makes that fallback automatic and graceful on a load failure, so the
 * same `AsyncImage` call covers both the `gaura`/`nitai`/`radha` hits and the (expected) 404s.
 */
@Composable
fun BookCard(
    group: SongGroup,
    onClick: () -> Unit = {}
) {
    val title = group.title
    val fallbackColor = parseHexColor(group.color) ?: getMediaColor(title)
    val coverUrl = ImageConfig.bookCoverUrl(ImageConfig.bookSlugFromGroupUid(group.uid))

    Box(
        modifier = Modifier
            .width(144.dp)
            .height(192.dp)
            .clip(MaterialTheme.shapes.medium)
            .clickable(onClick = onClick)
    ) {
        // Background layer: attempt the bucket cover, gracefully falling back to the group's color
        // on any load failure (missing/404 -- expected for most books per collections.md).
        AsyncImage(
            model = coverUrl,
            contentDescription = title,
            contentScale = ContentScale.Crop,
            placeholder = ColorPainter(fallbackColor),
            error = ColorPainter(fallbackColor),
            modifier = Modifier.fillMaxSize()
        )

        GradientOverlays(fallbackColor)

        // Song-count badge
        val songCount = group.songCount
        if (songCount > 0) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .padding(Spacing.md)
            ) {
                Tag(
                    text = "$songCount songs",
                    variant = TagVariant.Highlight,
                    size = TagSize.Small
                )
            }
        }

        // Title
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(start = Spacing.md, end = Spacing.md, bottom = Spacing.lg),
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = title,
                style = TextStyle(
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    lineHeight = 20.sp
                ),
                // Always white -- sits over the book-cover media color + dark gradient scrim
                // (see GradientOverlays below), independent of the Gaura/Shyam app theme.
                color = Color.White,
                maxLines = 3,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.width(120.dp)
            )
        }
    }
}

@Composable
private fun GradientOverlays(mediaColor: Color) {
    val backgroundColor = MaterialTheme.colorScheme.background

    Box(modifier = Modifier.fillMaxSize()) {
        // 1. Color overlay gradient -- matching iOS implementation
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(mediaColor, Color.Transparent),
                        startY = 0f,
                        endY = Float.POSITIVE_INFINITY / 2
                    )
                )
        )

        // 2. Bottom-to-top black gradient -- a fixed dark scrim for title legibility over the cover
        // art, independent of theme (onSurface flips light/dark with the app theme and would
        // invert this into a *lightening* gradient in Shyam, which is wrong).
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(Color.Black.copy(alpha = 0.5f), Color.Transparent),
                        startY = Float.POSITIVE_INFINITY,
                        endY = Float.POSITIVE_INFINITY / 2
                    )
                )
        )

        // 3. Horizontal left gradient -- similar to iOS horizontalLeftGradient
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.horizontalGradient(
                        colorStops = arrayOf(
                            0.0f to backgroundColor,
                            0.0258f to backgroundColor.copy(alpha = 0f),
                            0.0515f to backgroundColor.copy(alpha = 0.5f),
                            0.08f to backgroundColor.copy(alpha = 0f),
                            1f to backgroundColor.copy(alpha = 0f)
                        )
                    )
                )
        )
    }
}

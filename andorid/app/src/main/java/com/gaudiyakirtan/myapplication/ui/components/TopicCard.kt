package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.Spacing
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.gaudiyakirtan.myapplication.models.SongGroup
import com.gaudiyakirtan.myapplication.models.songCount
import com.gaudiyakirtan.myapplication.models.title
import com.gaudiyakirtan.myapplication.ui.theme.getMediaColor
import com.gaudiyakirtan.myapplication.ui.theme.parseHexColor

/**
 * A Topic [SongGroup] card (docs/data/collections.md `SongGroup(kind = topic)`). Topics carry no
 * cover art in the spec -- only the flat pipeline `color`, falling back to a deterministic
 * [getMediaColor]-derived one when absent.
 */
@Composable
fun TopicCard(
    group: SongGroup,
    onClick: () -> Unit = {}
) {
    val title = group.title
    val mediaColor = parseHexColor(group.color) ?: getMediaColor(title)
    val textColor = Color.White

    Surface(
        modifier = Modifier
            .width(176.dp)
            .height(108.dp), // Match web minHeight of 108px
        color = mediaColor,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(Spacing.xl), // Match web padding of 1.25rem
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = title,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp, // Match web text-base
                lineHeight = 19.sp, // Match line-height: 1.2
                color = textColor,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp) // Match web min-height: 48px
            )

            val songCount = group.songCount
            if (songCount > 0) {
                Tag(
                    text = "$songCount songs",
                    variant = TagVariant.Default,
                    size = TagSize.Normal,
                    modifier = Modifier.wrapContentWidth()
                )
            }
        }
    }
}

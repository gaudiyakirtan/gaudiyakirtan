package com.gaudiyakirtan.myapplication.ui.components.icons

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

/**
 * A music note icon component
 */
@Composable
fun MusicNote(
    modifier: Modifier = Modifier,
    tint: Color = LocalContentColor.current
) {
    Icon(
        imageVector = Icons.Default.MusicNote,
        contentDescription = "Music Note",
        tint = tint,
        modifier = modifier
    )
}
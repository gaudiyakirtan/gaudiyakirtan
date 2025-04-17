package com.gaudiyakirtan.myapplication.ui.components.icons

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.MusicNote
import androidx.compose.material3.Icon
import androidx.compose.material3.LocalContentColor
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.size

/**
 * A music note icon component that represents the mridanga logo
 */
@Composable
fun MusicNote(
    modifier: Modifier = Modifier,
    color: Color = LocalContentColor.current,
    size: Dp = 24.dp
) {
    Icon(
        imageVector = Icons.Default.MusicNote,
        contentDescription = "Mridanga Icon",
        tint = color,
        modifier = modifier.size(size)
    )
}
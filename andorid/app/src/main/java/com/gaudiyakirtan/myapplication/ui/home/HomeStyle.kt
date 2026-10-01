package com.gaudiyakirtan.myapplication.ui.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.luminance
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.gaudiyakirtan.myapplication.ui.theme.HomeGauraCanvas
import com.gaudiyakirtan.myapplication.ui.theme.HomeGauraCard
import com.gaudiyakirtan.myapplication.ui.theme.HomeGauraInk
import com.gaudiyakirtan.myapplication.ui.theme.HomeGauraLine
import com.gaudiyakirtan.myapplication.ui.theme.HomeGauraMuted
import com.gaudiyakirtan.myapplication.ui.theme.HomeShyamCanvas
import com.gaudiyakirtan.myapplication.ui.theme.HomeShyamCard
import com.gaudiyakirtan.myapplication.ui.theme.HomeShyamInk
import com.gaudiyakirtan.myapplication.ui.theme.HomeShyamLine
import com.gaudiyakirtan.myapplication.ui.theme.HomeShyamMuted

/** Web v6 palette, scoped to Home so the reader, player and navigation keep their own themes. */
@Composable
internal fun HomeStyle(content: @Composable () -> Unit) {
    val base = MaterialTheme.colorScheme
    val dark = base.background.luminance() < 0.5f
    MaterialTheme(colorScheme = base.copy(
        background = if (dark) HomeShyamCanvas else HomeGauraCanvas,
        surface = if (dark) HomeShyamCard else HomeGauraCard,
        onSurface = if (dark) HomeShyamInk else HomeGauraInk,
        onSurfaceVariant = if (dark) HomeShyamMuted else HomeGauraMuted,
        outlineVariant = if (dark) HomeShyamLine else HomeGauraLine
    ), content = content)
}

@Composable
internal fun HomeModule(label: String, modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Text(label, Modifier.padding(start = 5.dp).semantics { heading() },
            style = MaterialTheme.typography.labelMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        content()
    }
}

@Composable
internal fun HomeCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Surface(modifier.fillMaxWidth(), shape = RoundedCornerShape(28.dp),
        color = MaterialTheme.colorScheme.surface,
        border = BorderStroke(1.dp, MaterialTheme.colorScheme.outlineVariant),
        shadowElevation = 2.dp, content = content)
}

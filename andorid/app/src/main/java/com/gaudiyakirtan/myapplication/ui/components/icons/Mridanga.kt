package com.gaudiyakirtan.myapplication.ui.components.icons

import androidx.compose.foundation.Image
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.layout.size
import com.gaudiyakirtan.myapplication.R

/**
 * The mridanga — the app's brand mark.
 *
 * Converted from `web/public/assets/mridanga.svg`, so Android shows the same drum web already does
 * rather than Material's generic music-note glyph. It is **full colour and never tinted**: this is
 * a logo, not an icon, and forcing it through a content colour would flatten the drum to a
 * silhouette.
 *
 * @param size Rendered edge length. The art is padded to a square viewport, so it centres in a
 *   square slot without distortion.
 * @param contentDescription Null by default — wherever this appears the neighbouring text already
 *   carries the meaning, so the mark is decorative (docs/screens/home.md says the same of the web
 *   logo beside the welcome heading).
 */
@Composable
fun Mridanga(
    modifier: Modifier = Modifier,
    size: Dp = 24.dp,
    contentDescription: String? = null
) {
    Image(
        painter = painterResource(id = R.drawable.ic_mridanga),
        contentDescription = contentDescription,
        modifier = modifier.size(size)
    )
}

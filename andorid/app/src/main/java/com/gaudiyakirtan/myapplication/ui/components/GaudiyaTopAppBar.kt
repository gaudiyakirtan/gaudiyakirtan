package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow

/**
 * The app's detail-screen header.
 *
 * Five screens (player, song, settings, author, group) each hand-rolled the same `Row` of
 * back-arrow + title. That is exactly the duplication `docs/screens/components.md` exists to
 * prevent, and it also meant none of them got Material's app-bar behavior: correct title truncation,
 * the standard 48dp navigation-icon touch target, insets, or the M3 height and typography.
 *
 * [TopAppBar] supplies all of that, and the theme's own colors flow through it — the container is
 * `background` so the bar reads as part of the screen rather than a floating strip, matching the
 * Gaura/Shyam surfaces the screens already paint.
 *
 * @param title Shown in the bar; truncated with an ellipsis rather than wrapping.
 * @param onBackClick Invoked by the navigation icon. Pass `null` for a bar with no back affordance.
 * @param actions Trailing action slot, e.g. the song screen's display-settings menu.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun GaudiyaTopAppBar(
    title: String,
    onBackClick: (() -> Unit)? = null,
    modifier: Modifier = Modifier,
    actions: @Composable () -> Unit = {}
) {
    TopAppBar(
        modifier = modifier,
        title = {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        },
        navigationIcon = {
            if (onBackClick != null) {
                IconButton(onClick = onBackClick) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back"
                    )
                }
            }
        },
        actions = { actions() },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.background,
            titleContentColor = MaterialTheme.colorScheme.onBackground,
            navigationIconContentColor = MaterialTheme.colorScheme.primary,
            actionIconContentColor = MaterialTheme.colorScheme.primary
        )
    )
}

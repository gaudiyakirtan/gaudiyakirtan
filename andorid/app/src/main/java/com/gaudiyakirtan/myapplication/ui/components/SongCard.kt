package com.gaudiyakirtan.myapplication.ui.components

import androidx.compose.runtime.Composable

/** Grid cells share the canonical row, including UID placement and accessibility semantics. */
@Composable
fun SongCard(
    uid: String,
    title: String,
    authorName: String,
    audioAvailable: Boolean,
    onClick: () -> Unit = {}
) = SongListItem(uid, title, authorName, audioAvailable, onClick)

package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The lightweight catalog index of one song -- see docs/data/manifest.md (spec v1).
 *
 * Every list/search/browse screen should read [com.gaudiyakirtan.data.SongRepository.getManifest]
 * (backed by `assets/manifest.json`) rather than loading full [Song] objects; a full `Song` is only
 * loaded (by [uid], via [com.gaudiyakirtan.data.SongRepository.getSongByUid]) when the reader opens
 * the detail screen.
 */
@Serializable
data class ManifestEntry(
    @SerialName("uid") val uid: String,
    @SerialName("primary_title") val primaryTitle: ScriptText,
    @SerialName("titles") val titles: List<ScriptText> = emptyList(),
    @SerialName("author_uid") val authorUid: String,
    @SerialName("language_of_origin") val languageOfOrigin: String,
    @SerialName("audio_available") val audioAvailable: Boolean,
    @SerialName("first_letter") val firstLetter: String? = null,
    @SerialName("md5") val md5: String
)

package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The full-meaning rendering of a single [Verse] into one human language.
 * See docs/data/translation.md (spec v1).
 *
 * `source` defaults to "human" when absent, per spec. The shipped corpus never actually sets it
 * (always absent), so every decoded [Translation] currently reports `source == "human"`.
 */
@Serializable
data class Translation(
    @SerialName("language_code") val languageCode: String,
    @SerialName("text") val text: List<String>,
    @SerialName("source") val source: String = "human"
)

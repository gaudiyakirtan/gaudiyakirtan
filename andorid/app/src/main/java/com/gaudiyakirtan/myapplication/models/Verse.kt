package com.gaudiyakirtan.myapplication.models
import java.util.UUID

data class Verse(
    val id: UUID = UUID.randomUUID(),
    val language: String?,
    val original: List<String>,
    val transliterations: List<Transliteration?>,
    val wordToWords: List<WordToWord?>,
    val translations: List<Translation?>
)

data class Transliteration(
    val id: UUID = UUID.randomUUID(),
    val language: String,
    val text: List<String>
)

data class WordToWord(
    val id: UUID = UUID.randomUUID(),
    val language: String,
    val words: List<List<String>>
)

data class Translation(
    val id: UUID = UUID.randomUUID(),
    val language: String,
    val text: String
)
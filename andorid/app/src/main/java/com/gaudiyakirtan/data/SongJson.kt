package com.gaudiyakirtan.data

import kotlinx.serialization.json.Json

/**
 * The single kotlinx.serialization [Json] configuration used to decode the canonical corpus
 * (manifest, songs, song groups). Extracted to its own object -- rather than a private val inside
 * [SongRepository] -- so JVM unit tests (`app/src/test/.../SongSerializationTest.kt`) exercise the
 * *exact* production decode settings against real bundled asset files, instead of a parallel `Json`
 * that could silently drift from what the app actually ships with.
 */
object SongJson {
    val instance: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        coerceInputValues = true
    }
}

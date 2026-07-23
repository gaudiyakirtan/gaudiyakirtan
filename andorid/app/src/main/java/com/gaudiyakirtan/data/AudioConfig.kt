package com.gaudiyakirtan.data

/**
 * Single config constant for the audio player, per docs/screens/player.md "Audio source -- the base
 * URL (PLACEHOLDER)".
 *
 * Each [com.gaudiyakirtan.myapplication.models.AudioTrack] carries a bare `filename` (e.g.
 * "A10-bvsm-1.mp3"); the playable URL is always `AUDIO_BASE_URL + filename`. Kept as a single
 * constant (mirrors iOS `AudioConfig.swift` / web `config.ts`) so the bucket can change in one place.
 */
object AudioConfig {
    const val AUDIO_BASE_URL: String = "https://gaudiyakirtan.s3.amazonaws.com/audio/"

    /** Resolves an [com.gaudiyakirtan.myapplication.models.AudioTrack.filename] to a playable URL. */
    fun playableUrl(filename: String): String = AUDIO_BASE_URL + filename
}

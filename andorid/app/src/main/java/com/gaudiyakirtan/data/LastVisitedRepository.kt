package com.gaudiyakirtan.data

import android.content.Context
import android.content.SharedPreferences
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * The one persisted record behind the mini-player's resting state (docs/screens/player.md v15,
 * "Persistence"): the **uid** of the last song the reader opened, written when song-detail loads a
 * song and read back to fill the mini-player slot when nothing is loaded in the player.
 *
 * Deliberately **uid only** -- no title, author or audio flag is denormalized here. Everything the
 * bar renders is rehydrated from the bundled corpus (see
 * [com.gaudiyakirtan.services.LastVisitedViewModel]), so a pipeline resync can never leave a stale
 * copy of a song's title sitting in prefs.
 *
 * Stored in the same [SharedPreferences] file the settings use ([SettingsRepository.PREFS_NAME], per
 * the spec's Android note) but kept as its own repository rather than a field on `AppSettings`: this
 * is reading history, not a display preference, and nothing on the Settings screen should show it.
 * Exposed as a [StateFlow] so the bar reacts the moment a song is opened, with no restart.
 *
 * Reading history is device-local and never transmitted, matching web's `useRecents.ts` posture.
 * Storage failures are swallowed on both read and write -- a missing or unreadable record means the
 * slot is simply absent, never a crash.
 */
class LastVisitedRepository private constructor(context: Context) {

    private val prefs: SharedPreferences? = try {
        context.applicationContext
            .getSharedPreferences(SettingsRepository.PREFS_NAME, Context.MODE_PRIVATE)
    } catch (e: Exception) {
        Log.w(TAG, "Could not open prefs; the mini-player will have no resting state", e)
        null
    }

    private val _lastVisitedSongUid = MutableStateFlow(readFromPrefs())

    /** uid of the last song opened on song-detail, or `null` on a fresh install. */
    val lastVisitedSongUid: StateFlow<String?> = _lastVisitedSongUid.asStateFlow()

    private fun readFromPrefs(): String? = try {
        prefs?.getString(KEY_LAST_VISITED_SONG_UID, null)?.takeIf { it.isNotBlank() }
    } catch (e: Exception) {
        // ClassCastException from a key written with another type, etc. An unparsable record is
        // "no record" (docs/screens/player.md v15), not a failure worth propagating.
        Log.w(TAG, "Unreadable last-visited record; treating as absent", e)
        null
    }

    /**
     * Records that the reader opened [songUid]. Called from song-detail once the song has actually
     * loaded, so a uid that resolves to nothing is never stored. Writing **never autoplays** -- it
     * only decides what the resting bar points at.
     */
    fun recordVisit(songUid: String) {
        if (songUid.isBlank()) return
        try {
            prefs?.edit()?.putString(KEY_LAST_VISITED_SONG_UID, songUid)?.apply()
        } catch (e: Exception) {
            Log.w(TAG, "Could not persist last-visited song $songUid", e)
        }
        // Emit regardless of whether the write landed: the slot should still be right for this run.
        _lastVisitedSongUid.value = songUid
    }

    companion object {
        private const val TAG = "LastVisitedRepository"

        /** docs/screens/player.md v15 names this key explicitly (iOS: `player.lastVisitedSongUid`). */
        const val KEY_LAST_VISITED_SONG_UID = "last_visited_song_uid"

        @Volatile private var instance: LastVisitedRepository? = null

        fun getInstance(context: Context): LastVisitedRepository =
            instance ?: synchronized(this) {
                instance ?: LastVisitedRepository(context).also { instance = it }
            }
    }
}

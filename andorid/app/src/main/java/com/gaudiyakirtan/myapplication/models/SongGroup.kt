package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/** Which grouping a [SongGroup] represents. See docs/data/collections.md (spec v1). */
@Serializable
enum class SongGroupKind {
    @SerialName("book") BOOK,
    @SerialName("topic") TOPIC,
    @SerialName("collection") COLLECTION
}

/**
 * The common shape shared by Book / Topic / Collection groupings of songs.
 * See docs/data/collections.md (spec v1).
 *
 * NOTE: the shipped pipeline (pipeline/) does not currently emit any SongGroup data --
 * `topics` is an empty list on all 703 songs, and there is no books/topics/collections JSON in the
 * corpus. This type exists for spec conformance and for a future pipeline/data addition;
 * [com.gaudiyakirtan.data.SongRepository.getSongGroups] returns an empty list until then. The
 * mobile app's existing Library/Collections (bookmarks & playlists) UI is a separate, not-yet-
 * speced concept per collections.md's platform note and is intentionally left off this type this
 * slice (see the Book/Topic/Collection model files and the slice-1 report).
 */
@Serializable
data class SongGroup(
    @SerialName("uid") val uid: String,
    @SerialName("kind") val kind: SongGroupKind,
    @SerialName("titles") val titles: List<ScriptText>,
    @SerialName("song_uids") val songUids: List<String> = emptyList(),
    @SerialName("ordered") val ordered: Boolean = false,
    @SerialName("color") val color: String? = null
)

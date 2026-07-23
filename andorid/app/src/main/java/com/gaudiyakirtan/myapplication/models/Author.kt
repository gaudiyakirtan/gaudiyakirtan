package com.gaudiyakirtan.myapplication.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * The ācārya / composer of one or more [Song]s. See docs/data/author.md (spec v1).
 *
 * The shipped corpus does not ship a standalone authors dataset -- only each Song's `author_uid` +
 * `author_display`. [com.gaudiyakirtan.data.SongRepository] derives the Author list from the song
 * set itself (per author.md's platform note: "Authors are derived from / consistent with the
 * shipped song set"). `bio` is always empty since no biography text exists in the corpus yet.
 */
@Serializable
data class Author(
    @SerialName("uid") val uid: String,
    @SerialName("names") val names: List<ScriptText>,
    @SerialName("bio") val bio: List<String> = emptyList()
)

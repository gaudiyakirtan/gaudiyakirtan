package com.gaudiyakirtan.data.entities

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "songs")
data class SongEntity(
    @PrimaryKey val uid: String,
    val title: String,
    val author: String,
    val audio: Boolean = false,
    val tags: String = "", // JSON array stored as string
    val topics: String = "", // JSON array stored as string
    val versesJson: String = "[]" // Full verses JSON
)

@Entity(tableName = "authors")
data class AuthorEntity(
    @PrimaryKey val uid: String,
    val name: String,
    val slug: String,
    val image: String? = null,
    val songUids: String = "[]",
    val bookUids: String = "[]"
)

@Entity(tableName = "topics")
data class TopicEntity(
    @PrimaryKey val uid: String,
    val topic: String,
    val slug: String,
    val songUids: String = "[]"
)

@Entity(tableName = "books")
data class BookEntity(
    @PrimaryKey val uid: String,
    val title: String,
    val author: String? = null,
    val slug: String,
    val image: String? = null
)

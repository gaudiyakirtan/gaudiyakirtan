package com.gaudiyakirtan.myapplication.models
import java.util.UUID

data class Song(
    val id: UUID = UUID.randomUUID(),
    val title: String,
    val author: String,
    val uid: String,
    val audio: Boolean,
    val tags: List<String>
)
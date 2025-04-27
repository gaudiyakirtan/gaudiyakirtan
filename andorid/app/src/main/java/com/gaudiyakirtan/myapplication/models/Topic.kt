package com.gaudiyakirtan.myapplication.models
import java.util.UUID

data class Topic(
    val id: UUID = UUID.randomUUID(),
    val name: String
) {
    // Generate a pseudo-random count based on the topic name length for demo purposes
    val demoSongCount: Int
        get() = (name.length * 3) % 20 + 1
}
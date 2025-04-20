package com.gaudiyakirtan.myapplication.models
import java.util.UUID

/**
 * Represents a user collection of songs 
 */
data class Collection(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val type: CollectionType,
    val songIds: List<String> = emptyList()
)

enum class CollectionType {
    BOOKMARK,
    PLAYLIST
}
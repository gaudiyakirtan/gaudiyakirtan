package com.gaudiyakirtan.myapplication.models
import java.util.UUID

data class Author(
    val id: UUID = UUID.randomUUID(),
    val name: String,
    val image: String
)
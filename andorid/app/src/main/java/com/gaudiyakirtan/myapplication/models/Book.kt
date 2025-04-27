package com.gaudiyakirtan.myapplication.models
import java.util.UUID

data class Book(
    val id: UUID = UUID.randomUUID(),
    val title: String,
    val author: String?,
    val slug: String,
    val uid: String,
    val image: String?,
    val songCount: Int? = null,
    val year: String? = null
)
package com.gaudiyakirtan.myapplication.models
import java.util.UUID

data class Topic(
    val id: UUID = UUID.randomUUID(),
    val name: String
)
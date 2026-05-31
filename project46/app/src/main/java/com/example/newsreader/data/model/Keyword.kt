package com.example.newsreader.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "keywords")
data class Keyword(
    @PrimaryKey val word: String,
    val addedAt: Long
)
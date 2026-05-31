package com.example.newsreader.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "favorites")
data class Favorite(
    @PrimaryKey val newsId: String,
    val addedAt: Long
)
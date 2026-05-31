package com.example.newsreader.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "news")
data class News(
    @PrimaryKey val id: String,
    val title: String,
    val summary: String,
    val content: String,
    val author: String,
    val publishTime: Long,
    val category: String,
    val imageUrl: String,
    val source: String = ""
)
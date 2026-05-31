package com.example.newsreader.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "history")
data class HistoryRecord(
    @PrimaryKey val newsId: String,
    val readAt: Long
)
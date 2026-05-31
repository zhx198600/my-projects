package com.example.newsreader.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "reading_sessions")
data class ReadingSession(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val newsId: String,
    val startTime: Long,
    val endTime: Long,
    val durationMs: Long
)
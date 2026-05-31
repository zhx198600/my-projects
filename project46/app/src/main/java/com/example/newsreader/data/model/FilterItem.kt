package com.example.newsreader.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "filters")
data class FilterItem(
    @PrimaryKey val value: String,
    val type: FilterType,
    val addedAt: Long
)

enum class FilterType { KEYWORD, CATEGORY }
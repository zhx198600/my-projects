package com.example.newsreader.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.newsreader.data.model.FilterItem
import com.example.newsreader.data.model.FilterType
import kotlinx.coroutines.flow.Flow

@Dao
interface FilterDao {
    @Query("SELECT * FROM filters ORDER BY addedAt DESC")
    fun observeAll(): Flow<List<FilterItem>>

    @Query("SELECT * FROM filters ORDER BY addedAt DESC")
    suspend fun getAll(): List<FilterItem>

    @Query("SELECT value FROM filters WHERE type = :type")
    suspend fun getValues(type: FilterType): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: FilterItem)

    @Query("DELETE FROM filters WHERE value = :value")
    suspend fun delete(value: String)
}
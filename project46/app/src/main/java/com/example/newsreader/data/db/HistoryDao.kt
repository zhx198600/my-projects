package com.example.newsreader.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.newsreader.data.model.HistoryRecord
import kotlinx.coroutines.flow.Flow

@Dao
interface HistoryDao {
    @Query("SELECT * FROM history ORDER BY readAt DESC")
    fun observeAll(): Flow<List<HistoryRecord>>

    @Query("SELECT * FROM history ORDER BY readAt DESC")
    suspend fun getAll(): List<HistoryRecord>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: HistoryRecord)

    @Query("DELETE FROM history WHERE newsId = :newsId")
    suspend fun delete(newsId: String)

    @Query("DELETE FROM history")
    suspend fun clear()
}
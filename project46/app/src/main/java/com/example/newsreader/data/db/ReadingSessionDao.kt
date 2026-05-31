package com.example.newsreader.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import com.example.newsreader.data.model.ReadingSession
import kotlinx.coroutines.flow.Flow

@Dao
interface ReadingSessionDao {
    @Insert
    suspend fun insert(session: ReadingSession)

    @Query("SELECT * FROM reading_sessions WHERE startTime >= :from AND startTime < :to")
    suspend fun getBetween(from: Long, to: Long): List<ReadingSession>

    @Query("SELECT SUM(durationMs) FROM reading_sessions WHERE startTime >= :from AND startTime < :to")
    suspend fun sumDurationBetween(from: Long, to: Long): Long?

    @Query("SELECT * FROM reading_sessions")
    fun observeAll(): Flow<List<ReadingSession>>
}
package com.example.newsreader.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.newsreader.data.model.Keyword
import kotlinx.coroutines.flow.Flow

@Dao
interface KeywordDao {
    @Query("SELECT * FROM keywords ORDER BY addedAt DESC")
    fun observeAll(): Flow<List<Keyword>>

    @Query("SELECT * FROM keywords ORDER BY addedAt DESC")
    suspend fun getAll(): List<Keyword>

    @Query("SELECT word FROM keywords")
    suspend fun getWords(): List<String>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: Keyword)

    @Query("DELETE FROM keywords WHERE word = :word")
    suspend fun delete(word: String)
}
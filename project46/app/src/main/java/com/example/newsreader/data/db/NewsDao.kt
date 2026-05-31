package com.example.newsreader.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.newsreader.data.model.News
import kotlinx.coroutines.flow.Flow

@Dao
interface NewsDao {
    @Query("SELECT * FROM news")
    fun observeAll(): Flow<List<News>>

    @Query("SELECT * FROM news")
    suspend fun getAll(): List<News>

    @Query("SELECT * FROM news WHERE category = :category ORDER BY publishTime DESC")
    suspend fun getByCategory(category: String): List<News>

    @Query("SELECT * FROM news WHERE category IN (:categories) ORDER BY publishTime DESC")
    suspend fun getByCategories(categories: List<String>): List<News>

    @Query("SELECT * FROM news WHERE id = :id")
    suspend fun getById(id: String): News?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(items: List<News>)

    @Query("SELECT COUNT(*) FROM news")
    suspend fun count(): Int
}
package com.example.newsreader.data.db

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.newsreader.data.model.Favorite
import kotlinx.coroutines.flow.Flow

@Dao
interface FavoriteDao {
    @Query("SELECT * FROM favorites ORDER BY addedAt DESC")
    fun observeAll(): Flow<List<Favorite>>

    @Query("SELECT * FROM favorites ORDER BY addedAt DESC")
    suspend fun getAll(): List<Favorite>

    @Query("SELECT newsId FROM favorites")
    suspend fun getIds(): List<String>

    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE newsId = :newsId)")
    suspend fun isFavorite(newsId: String): Boolean

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(item: Favorite)

    @Query("DELETE FROM favorites WHERE newsId = :newsId")
    suspend fun delete(newsId: String)

    @Query("DELETE FROM favorites")
    suspend fun clear()
}
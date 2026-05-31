package com.example.newsreader.data.db

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.example.newsreader.data.model.Favorite
import com.example.newsreader.data.model.FilterItem
import com.example.newsreader.data.model.HistoryRecord
import com.example.newsreader.data.model.Keyword
import com.example.newsreader.data.model.News
import com.example.newsreader.data.model.ReadingSession

@Database(
    entities = [
        News::class,
        Favorite::class,
        HistoryRecord::class,
        ReadingSession::class,
        Keyword::class,
        FilterItem::class
    ],
    version = 1,
    exportSchema = false
)
abstract class NewsDatabase : RoomDatabase() {
    abstract fun newsDao(): NewsDao
    abstract fun favoriteDao(): FavoriteDao
    abstract fun historyDao(): HistoryDao
    abstract fun readingSessionDao(): ReadingSessionDao
    abstract fun keywordDao(): KeywordDao
    abstract fun filterDao(): FilterDao

    companion object {
        @Volatile private var instance: NewsDatabase? = null

        fun getInstance(context: Context): NewsDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    NewsDatabase::class.java,
                    "news_reader.db"
                ).build().also { instance = it }
            }
        }
    }
}
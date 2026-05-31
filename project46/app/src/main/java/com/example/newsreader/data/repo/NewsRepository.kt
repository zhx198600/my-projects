package com.example.newsreader.data.repo

import android.content.Context
import com.example.newsreader.data.db.FavoriteDao
import com.example.newsreader.data.db.FilterDao
import com.example.newsreader.data.db.HistoryDao
import com.example.newsreader.data.db.KeywordDao
import com.example.newsreader.data.db.NewsDao
import com.example.newsreader.data.db.ReadingSessionDao
import com.example.newsreader.data.model.Favorite
import com.example.newsreader.data.model.FilterItem
import com.example.newsreader.data.model.FilterType
import com.example.newsreader.data.model.HistoryRecord
import com.example.newsreader.data.model.Keyword
import com.example.newsreader.data.model.News
import com.example.newsreader.data.model.ReadingSession
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.Flow
import java.util.concurrent.TimeUnit

class NewsRepository(
    private val context: Context,
    private val newsDao: NewsDao,
    private val favoriteDao: FavoriteDao,
    private val historyDao: HistoryDao,
    private val readingSessionDao: ReadingSessionDao,
    private val keywordDao: KeywordDao,
    private val filterDao: FilterDao
) {

    private val gson = Gson()

    suspend fun ensurePopulated() {
        if (newsDao.count() > 0) return
        val json = context.assets.open("mock_news.json").bufferedReader().use { it.readText() }
        val type = object : TypeToken<List<News>>() {}.type
        val list: List<News> = gson.fromJson(json, type)
        newsDao.insertAll(list)
    }

    suspend fun getNewsByCategory(category: String): List<News> = newsDao.getByCategory(category)

    suspend fun getNewsById(id: String): News? = newsDao.getById(id)

    suspend fun getAllNews(): List<News> = newsDao.getAll()

    suspend fun addFavorite(newsId: String) = favoriteDao.insert(Favorite(newsId, System.currentTimeMillis()))

    suspend fun removeFavorite(newsId: String) = favoriteDao.delete(newsId)

    suspend fun isFavorite(newsId: String): Boolean = favoriteDao.isFavorite(newsId)

    suspend fun getFavoriteNews(): List<News> {
        val ids = favoriteDao.getIds().toSet()
        if (ids.isEmpty()) return emptyList()
        return newsDao.getAll().filter { it.id in ids }
    }

    suspend fun clearFavorites() = favoriteDao.clear()

    suspend fun recordHistory(newsId: String) = historyDao.insert(HistoryRecord(newsId, System.currentTimeMillis()))

    suspend fun getHistoryNews(): List<News> {
        val ids = historyDao.getAll().map { it.newsId }
        if (ids.isEmpty()) return emptyList()
        val all = newsDao.getAll().associateBy { it.id }
        return ids.mapNotNull { all[it] }
    }

    suspend fun clearHistory() = historyDao.clear()

    suspend fun recordReadingSession(newsId: String, startTime: Long, endTime: Long) {
        val duration = endTime - startTime
        if (duration < TimeUnit.SECONDS.toMillis(3)) return
        readingSessionDao.insert(ReadingSession(newsId = newsId, startTime = startTime, endTime = endTime, durationMs = duration))
    }

    suspend fun getTotalReadDuration(from: Long, to: Long): Long =
        readingSessionDao.sumDurationBetween(from, to) ?: 0L

    suspend fun getReadingSessions(from: Long, to: Long): List<ReadingSession> =
        readingSessionDao.getBetween(from, to)

    fun observeKeywords(): Flow<List<Keyword>> = keywordDao.observeAll()

    suspend fun addKeyword(word: String) = keywordDao.insert(Keyword(word.trim(), System.currentTimeMillis()))

    suspend fun removeKeyword(word: String) = keywordDao.delete(word)

    suspend fun getKeywordList(): List<String> = keywordDao.getWords()

    fun observeFilters(): Flow<List<FilterItem>> = filterDao.observeAll()

    suspend fun addFilter(value: String, type: FilterType) = filterDao.insert(FilterItem(value, type, System.currentTimeMillis()))

    suspend fun removeFilter(value: String) = filterDao.delete(value)

    suspend fun getFilteredKeywords(): List<String> = filterDao.getValues(FilterType.KEYWORD)

    suspend fun getFilteredCategories(): List<String> = filterDao.getValues(FilterType.CATEGORY)
}
package com.example.newsreader.domain

import com.example.newsreader.data.model.News
import com.example.newsreader.data.repo.NewsRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class RecommendUseCase(private val repo: NewsRepository) {

    suspend fun recommend(limit: Int = 20): List<News> = withContext(Dispatchers.Default) {
        val all = repo.getAllNews()
        val favorites = repo.getFavoriteNews().map { it.id }.toSet()
        val history = repo.getHistoryNews().map { it.id }
        val historyCount = history.groupingBy { it }.eachCount()
        val subKeywords = repo.getKeywordList()
        val now = System.currentTimeMillis()
        val dayMs = 24L * 60 * 60 * 1000
        val readSessions = repo.getReadingSessions(now - 7 * dayMs, now)
        val sessionByNews = readSessions.groupBy { it.newsId }.mapValues { it.value.sumOf { s -> s.durationMs } }

        val scored = all.map { news ->
            var score = 0.0
            if (news.id in favorites) score += 3.0
            score += (historyCount[news.id] ?: 0) * 1.0
            score += (sessionByNews[news.id]?.let { it.toDouble() / 60_000.0 * 2.0 } ?: 0.0)
            if (subKeywords.any { kw -> news.title.contains(kw) || news.summary.contains(kw) }) score += 2.0
            val recency = ((now - news.publishTime * 1000L).coerceAtLeast(0L)).toDouble() / dayMs
            score += (10.0 / (1.0 + recency))
            news to score
        }
        scored.sortedByDescending { it.second }.take(limit).map { it.first }
    }
}

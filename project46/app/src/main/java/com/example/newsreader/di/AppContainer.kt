package com.example.newsreader.di

import android.content.Context
import com.example.newsreader.data.db.NewsDatabase
import com.example.newsreader.data.repo.NewsRepository
import com.example.newsreader.data.repo.UserPreferencesRepository
import com.example.newsreader.domain.RecommendUseCase

class AppContainer(context: Context) {
    private val appContext: Context = context.applicationContext

    val database: NewsDatabase by lazy { NewsDatabase.getInstance(appContext) }
    val userPreferencesRepository: UserPreferencesRepository by lazy { UserPreferencesRepository(appContext) }
    val newsRepository: NewsRepository by lazy { NewsRepository(appContext, database.newsDao(), database.favoriteDao(), database.historyDao(), database.readingSessionDao(), database.keywordDao(), database.filterDao()) }
    val recommendUseCase: RecommendUseCase by lazy { RecommendUseCase(newsRepository) }
}
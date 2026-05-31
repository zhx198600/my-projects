package com.example.newsreader.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.newsreader.data.model.FilterItem
import com.example.newsreader.data.model.FilterType
import com.example.newsreader.data.model.Keyword
import com.example.newsreader.data.model.News
import com.example.newsreader.di.AppContainer
import com.example.newsreader.ui.theme.ThemeMode
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

data class NewsItemUi(
    val news: News,
    val isFavorite: Boolean,
    val isSubscribedHighlight: Boolean
)

data class ReadingStats(
    val todayMs: Long,
    val weekMs: Long,
    val daily: List<Long>
)

class NewsReaderViewModel(private val container: AppContainer) : ViewModel() {

    private val repo = container.newsRepository
    private val prefs = container.userPreferencesRepository

    private val _selectedCategory = MutableStateFlow("科技")
    val selectedCategory: StateFlow<String> = _selectedCategory.asStateFlow()

    private val _newsByCategory = MutableStateFlow<List<NewsItemUi>>(emptyList())
    val newsByCategory: StateFlow<List<NewsItemUi>> = _newsByCategory.asStateFlow()

    private val _favorites = MutableStateFlow<List<News>>(emptyList())
    val favorites: StateFlow<List<News>> = _favorites.asStateFlow()

    private val _history = MutableStateFlow<List<News>>(emptyList())
    val history: StateFlow<List<News>> = _history.asStateFlow()

    private val _recommended = MutableStateFlow<List<NewsItemUi>>(emptyList())
    val recommended: StateFlow<List<NewsItemUi>> = _recommended.asStateFlow()

    val keywords: StateFlow<List<Keyword>> = repo.observeKeywords()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val filters: StateFlow<List<FilterItem>> = repo.observeFilters()
        .stateIn(viewModelScope, SharingStarted.Eagerly, emptyList())

    val themeMode: StateFlow<ThemeMode> = prefs.themeMode
        .stateIn(viewModelScope, SharingStarted.Eagerly, ThemeMode.SYSTEM)

    private val _readingStats = MutableStateFlow(ReadingStats(0L, 0L, emptyList()))
    val readingStats: StateFlow<ReadingStats> = _readingStats.asStateFlow()

    init {
        viewModelScope.launch {
            repo.ensurePopulated()
            refreshAll()
        }
        viewModelScope.launch {
            keywords.collect { refreshAll() }
        }
        viewModelScope.launch {
            filters.collect { refreshAll() }
        }
    }

    private suspend fun refreshAll() {
        refreshCategory(_selectedCategory.value)
        refreshFavorites()
        refreshHistory()
        refreshRecommended()
        refreshReadingStats()
    }

    fun selectCategory(category: String) {
        _selectedCategory.value = category
        viewModelScope.launch { refreshCategory(category) }
    }

    private suspend fun refreshCategory(category: String) {
        val filteredKeywords = repo.getFilteredKeywords()
        val filteredCategories = repo.getFilteredCategories().toSet()
        val subKeywords = repo.getKeywordList()
        val list = repo.getNewsByCategory(category)
            .filter { it.category !in filteredCategories }
            .filter { n -> filteredKeywords.none { kw -> n.title.contains(kw) || n.summary.contains(kw) } }
            .map { n ->
                val highlight = subKeywords.any { kw -> n.title.contains(kw) || n.summary.contains(kw) }
                NewsItemUi(n, repo.isFavorite(n.id), highlight)
            }
            .sortedWith(compareByDescending<NewsItemUi> { it.isSubscribedHighlight }.thenByDescending { it.news.publishTime })
        _newsByCategory.value = list
    }

    private suspend fun refreshFavorites() {
        _favorites.value = repo.getFavoriteNews()
    }

    private suspend fun refreshHistory() {
        _history.value = repo.getHistoryNews()
    }

    private suspend fun refreshRecommended() {
        val filteredKeywords = repo.getFilteredKeywords()
        val filteredCategories = repo.getFilteredCategories().toSet()
        val subKeywords = repo.getKeywordList()
        val list = container.recommendUseCase.recommend(limit = 30)
            .filter { it.category !in filteredCategories }
            .filter { n -> filteredKeywords.none { kw -> n.title.contains(kw) || n.summary.contains(kw) } }
            .map { n ->
                val highlight = subKeywords.any { kw -> n.title.contains(kw) || n.summary.contains(kw) }
                NewsItemUi(n, repo.isFavorite(n.id), highlight)
            }
        _recommended.value = list
    }

    private suspend fun refreshReadingStats() {
        val now = System.currentTimeMillis()
        val dayMs = 24L * 60 * 60 * 1000
        val startOfToday = now - (now + java.util.TimeZone.getDefault().rawOffset) % dayMs
        val startOfWeek = startOfToday - 6 * dayMs
        val today = repo.getTotalReadDuration(startOfToday, now)
        val week = repo.getTotalReadDuration(startOfWeek, now)
        val daily = (0 until 7).map { dayOffset ->
            val from = startOfToday - dayOffset * dayMs
            val to = from + dayMs
            repo.getTotalReadDuration(from, to)
        }.reversed()
        _readingStats.value = ReadingStats(today, week, daily)
    }

    fun toggleFavorite(newsId: String) {
        viewModelScope.launch {
            if (repo.isFavorite(newsId)) repo.removeFavorite(newsId) else repo.addFavorite(newsId)
            refreshCategory(_selectedCategory.value)
            refreshFavorites()
            refreshRecommended()
        }
    }

    fun recordHistory(newsId: String) {
        viewModelScope.launch {
            repo.recordHistory(newsId)
            refreshHistory()
        }
    }

    fun recordReadingSession(newsId: String, startTime: Long, endTime: Long) {
        viewModelScope.launch {
            repo.recordReadingSession(newsId, startTime, endTime)
            refreshReadingStats()
        }
    }

    fun addKeyword(word: String) {
        viewModelScope.launch {
            if (word.isNotBlank()) repo.addKeyword(word)
        }
    }

    fun removeKeyword(word: String) {
        viewModelScope.launch { repo.removeKeyword(word) }
    }

    fun addFilterKeyword(word: String) {
        viewModelScope.launch {
            if (word.isNotBlank()) repo.addFilter(word, FilterType.KEYWORD)
        }
    }

    fun addFilterCategory(category: String) {
        viewModelScope.launch {
            if (category.isNotBlank()) repo.addFilter(category, FilterType.CATEGORY)
        }
    }

    fun removeFilter(value: String) {
        viewModelScope.launch { repo.removeFilter(value) }
    }

    fun clearHistory() {
        viewModelScope.launch { repo.clearHistory(); refreshHistory() }
    }

    fun clearFavorites() {
        viewModelScope.launch { repo.clearFavorites(); refreshFavorites() }
    }

    fun setThemeMode(mode: ThemeMode) {
        viewModelScope.launch { prefs.setThemeMode(mode) }
    }
}

class NewsReaderViewModelFactory(private val container: AppContainer) : androidx.lifecycle.ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return NewsReaderViewModel(container) as T
    }
}

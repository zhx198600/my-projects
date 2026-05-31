package com.example.newsreader.ui.detail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.example.newsreader.data.model.News
import com.example.newsreader.ui.NewsReaderViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NewsDetailRoute(viewModel: NewsReaderViewModel, newsId: String, onBack: () -> Unit) {
    val homeList by viewModel.newsByCategory.collectAsState()
    val recList by viewModel.recommended.collectAsState()
    val favList by viewModel.favorites.collectAsState()
    val histList by viewModel.history.collectAsState()
    val news: News? = remember(newsId, homeList, recList, favList, histList) {
        homeList.asSequence().map { it.news }
            .plus(recList.map { it.news })
            .plus(favList)
            .plus(histList)
            .distinctBy { it.id }
            .firstOrNull { it.id == newsId }
    }
    val isFavorite = favList.any { it.id == newsId }

    var enterTime by remember { mutableStateOf(0L) }

    DisposableEffect(newsId) {
        enterTime = System.currentTimeMillis()
        viewModel.recordHistory(newsId)
        onDispose {
            val exitTime = System.currentTimeMillis()
            if (enterTime > 0) {
                viewModel.recordReadingSession(newsId, enterTime, exitTime)
            }
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(news?.title.orEmpty().take(12)) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.toggleFavorite(newsId) }) {
                        Icon(
                            imageVector = if (isFavorite) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                            contentDescription = "收藏",
                            tint = if (isFavorite) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            )
        }
    ) { innerPadding ->
        val n = news
        if (n == null) {
            Box(modifier = Modifier.fillMaxSize().padding(innerPadding), contentAlignment = Alignment.Center) {
                Text("新闻不存在")
            }
        } else {
            LazyColumn(contentPadding = PaddingValues(16.dp) + innerPadding, verticalArrangement = Arrangement.spacedBy(12.dp)) {
                item {
                    Text(text = n.title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
                }
                item {
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(text = n.author, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(text = n.source.ifEmpty { n.category }, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                item {
                    AsyncImage(
                        model = n.imageUrl,
                        contentDescription = null,
                        modifier = Modifier.fillMaxWidth().height(200.dp).clip(RoundedCornerShape(8.dp))
                    )
                }
                item {
                    Text(text = n.content, style = MaterialTheme.typography.bodyLarge, lineHeight = 26.sp)
                }
            }
        }
    }
}

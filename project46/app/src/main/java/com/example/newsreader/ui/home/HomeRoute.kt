package com.example.newsreader.ui.home

import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ScrollableTabRow
import androidx.compose.material3.Tab
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.collectAsState
import coil.compose.AsyncImage
import com.example.newsreader.ui.NewsItemUi
import com.example.newsreader.ui.NewsReaderViewModel

private val CATEGORIES = listOf("科技", "财经", "体育", "娱乐", "国际", "社会")

@Composable
fun HomeRoute(viewModel: NewsReaderViewModel, onNewsClick: (String) -> Unit) {
    val selectedCategory by viewModel.selectedCategory.collectAsState()
    val list by viewModel.newsByCategory.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        ScrollableTabRow(selectedTabIndex = CATEGORIES.indexOf(selectedCategory).coerceAtLeast(0), edgePadding = 8.dp) {
            CATEGORIES.forEach { category ->
                Tab(
                    selected = category == selectedCategory,
                    onClick = { viewModel.selectCategory(category) },
                    text = { Text(category) }
                )
            }
        }
        if (list.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("暂无新闻")
            }
        } else {
            LazyColumn(contentPadding = PaddingValues(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(list, key = { it.news.id }) { item ->
                    NewsCard(item, onClick = { onNewsClick(item.news.id) })
                }
            }
        }
    }
}

@Composable
private fun NewsCard(item: NewsItemUi, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(8.dp))
            .clickable(onClick = onClick)
            .padding(8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        AsyncImage(
            model = item.news.imageUrl,
            contentDescription = null,
            modifier = Modifier
                .height(72.dp)
                .clip(RoundedCornerShape(6.dp))
        )
        Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
            Text(
                text = item.news.title,
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Medium,
                maxLines = 2,
                color = if (item.isSubscribedHighlight) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = item.news.summary,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(text = item.news.author, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(text = formatTime(item.news.publishTime), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}

private fun formatTime(epochSec: Long): String {
    val diff = System.currentTimeMillis() / 1000 - epochSec
    return when {
        diff < 60 -> "${diff}秒前"
        diff < 3600 -> "${diff / 60}分钟前"
        diff < 86400 -> "${diff / 3600}小时前"
        else -> "${diff / 86400}天前"
    }
}

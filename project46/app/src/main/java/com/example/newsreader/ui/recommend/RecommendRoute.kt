package com.example.newsreader.ui.recommend

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

@Composable
fun RecommendRoute(viewModel: NewsReaderViewModel, onNewsClick: (String) -> Unit) {
    val list by viewModel.recommended.collectAsState()
    Column(modifier = Modifier.fillMaxSize()) {
        Text("为你推荐", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(16.dp))
        if (list.isEmpty()) {
            Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("暂无推荐，多阅读试试")
            }
        } else {
            LazyColumn(contentPadding = PaddingValues(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(list, key = { it.news.id }) { item ->
                    RecommendCard(item, onClick = { onNewsClick(item.news.id) })
                }
            }
        }
    }
}

@Composable
private fun RecommendCard(item: NewsItemUi, onClick: () -> Unit) {
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
            modifier = Modifier.height(72.dp).clip(RoundedCornerShape(6.dp))
        )
        Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
            Text(text = item.news.title, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Medium, maxLines = 2)
            Text(text = item.news.summary, style = MaterialTheme.typography.bodyMedium, maxLines = 2, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(modifier = Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(text = item.news.author, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(text = item.news.category, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
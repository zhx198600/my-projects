package com.example.newsreader.ui.mine

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.runtime.collectAsState
import com.example.newsreader.data.model.FilterType
import com.example.newsreader.data.model.News
import com.example.newsreader.ui.NewsReaderViewModel
import com.example.newsreader.ui.theme.ThemeMode

private enum class MineSection { ROOT, FAVORITES, HISTORY, STATS, FILTERS, THEME }

@Composable
fun MineRoute(viewModel: NewsReaderViewModel, onNewsClick: (String) -> Unit) {
    var section by remember { mutableStateOf(MineSection.ROOT) }
    when (section) {
        MineSection.ROOT -> MineRoot(onNavigate = { section = it })
        MineSection.FAVORITES -> FavoritesSection(viewModel, onBack = { section = MineSection.ROOT }, onNewsClick = onNewsClick)
        MineSection.HISTORY -> HistorySection(viewModel, onBack = { section = MineSection.ROOT }, onNewsClick = onNewsClick)
        MineSection.STATS -> StatsSection(viewModel, onBack = { section = MineSection.ROOT })
        MineSection.FILTERS -> FiltersSection(viewModel, onBack = { section = MineSection.ROOT })
        MineSection.THEME -> ThemeSection(viewModel, onBack = { section = MineSection.ROOT })
    }
}

@Composable
private fun MineRoot(onNavigate: (MineSection) -> Unit) {
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("我的", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        Divider(modifier = Modifier.padding(vertical = 16.dp))
        listOf(
            MineSection.FAVORITES to "我的收藏",
            MineSection.HISTORY to "阅读历史",
            MineSection.STATS to "阅读统计",
            MineSection.FILTERS to "内容过滤",
            MineSection.THEME to "夜间模式"
        ).forEach { (section, label) ->
            Row(
                modifier = Modifier.fillMaxWidth().clickable { onNavigate(section) }.padding(vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(label, style = MaterialTheme.typography.bodyLarge)
                Text(">", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Divider()
        }
    }
}

@Composable
private fun FavoritesSection(viewModel: NewsReaderViewModel, onBack: () -> Unit, onNewsClick: (String) -> Unit) {
    val list by viewModel.favorites.collectAsState()
    Column {
        SubHeader("我的收藏", onBack)
        if (list.isEmpty()) {
            EmptyHint("暂无收藏")
        } else {
            TextButton(onClick = { viewModel.clearFavorites() }) { Text("清空") }
            LazyColumn {
                items(list, key = { it.id }) { n -> NewsSimpleRow(n, onClick = { onNewsClick(n.id) }) }
            }
        }
    }
}

@Composable
private fun HistorySection(viewModel: NewsReaderViewModel, onBack: () -> Unit, onNewsClick: (String) -> Unit) {
    val list by viewModel.history.collectAsState()
    Column {
        SubHeader("阅读历史", onBack)
        if (list.isEmpty()) {
            EmptyHint("暂无历史")
        } else {
            TextButton(onClick = { viewModel.clearHistory() }) { Text("清空") }
            LazyColumn {
                items(list, key = { it.id }) { n -> NewsSimpleRow(n, onClick = { onNewsClick(n.id) }) }
            }
        }
    }
}

@Composable
private fun StatsSection(viewModel: NewsReaderViewModel, onBack: () -> Unit) {
    val stats by viewModel.readingStats.collectAsState()
    Column(modifier = Modifier.padding(16.dp)) {
        SubHeader("阅读统计", onBack)
        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("今日阅读", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("${stats.todayMs / 60000} 分钟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            }
        }
        Card(modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp)) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("本周阅读", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text("${stats.weekMs / 60000} 分钟", style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
            }
        }
        Text("最近 7 天（分钟）", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp))
        val max = stats.daily.maxOrNull()?.coerceAtLeast(1L) ?: 1L
        stats.daily.forEachIndexed { idx, ms ->
            Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("D${idx + 1}", modifier = Modifier.width(40.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                Spacer(Modifier.width(8.dp))
                androidx.compose.material3.Surface(
                    modifier = Modifier
                        .height(12.dp)
                        .weight(1f)
                        .clip(RoundedCornerShape(6.dp)),
                    color = MaterialTheme.colorScheme.surfaceVariant
                ) {
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier
                            .height(12.dp)
                            .fillMaxWidth((ms.toFloat() / max).coerceIn(0f, 1f))
                            .clip(RoundedCornerShape(6.dp))
                            .background(MaterialTheme.colorScheme.primary)
                    )
                }
                Spacer(Modifier.width(8.dp))
                Text("${ms / 60000}", modifier = Modifier.width(40.dp))
            }
        }
    }
}

@Composable
private fun FiltersSection(viewModel: NewsReaderViewModel, onBack: () -> Unit) {
    val filters by viewModel.filters.collectAsState()
    var kwInput by remember { mutableStateOf("") }
    var catInput by remember { mutableStateOf("") }
    Column(modifier = Modifier.padding(16.dp)) {
        SubHeader("内容过滤", onBack)
        Text("屏蔽关键词", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 8.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(value = kwInput, onValueChange = { kwInput = it }, label = { Text("关键词") }, modifier = Modifier.weight(1f), singleLine = true)
            Spacer(Modifier.width(8.dp))
            Button(onClick = {
                val w = kwInput.trim()
                if (w.isNotEmpty()) { viewModel.addFilterKeyword(w); kwInput = "" }
            }) { Text("添加") }
        }
        Text("屏蔽分类", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            OutlinedTextField(value = catInput, onValueChange = { catInput = it }, label = { Text("分类") }, modifier = Modifier.weight(1f), singleLine = true)
            Spacer(Modifier.width(8.dp))
            Button(onClick = {
                val w = catInput.trim()
                if (w.isNotEmpty()) { viewModel.addFilterCategory(w); catInput = "" }
            }) { Text("添加") }
        }
        Text("已屏蔽", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 16.dp))
        if (filters.isEmpty()) {
            EmptyHint("暂无屏蔽")
        } else {
            LazyColumn {
                items(filters, key = { "${it.type}-${it.value}" }) { f ->
                    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        AssistChip(
                            onClick = { viewModel.removeFilter(f.value) },
                            label = { Text("${if (f.type == FilterType.KEYWORD) "词" else "类"}: ${f.value}") },
                            trailingIcon = { androidx.compose.material3.Icon(Icons.Filled.Close, contentDescription = "删除") }
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ThemeSection(viewModel: NewsReaderViewModel, onBack: () -> Unit) {
    val current by viewModel.themeMode.collectAsState()
    Column(modifier = Modifier.padding(16.dp)) {
        SubHeader("夜间模式", onBack)
        ThemeMode.values().forEach { mode ->
            Row(modifier = Modifier.fillMaxWidth().clickable { viewModel.setThemeMode(mode) }.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                RadioButton(selected = current == mode, onClick = { viewModel.setThemeMode(mode) })
                Spacer(Modifier.width(8.dp))
                Text(
                    text = when (mode) {
                        ThemeMode.LIGHT -> "日间模式"
                        ThemeMode.DARK -> "夜间模式"
                        ThemeMode.SYSTEM -> "跟随系统"
                    },
                    style = MaterialTheme.typography.bodyLarge
                )
            }
        }
    }
}

@Composable
private fun SubHeader(title: String, onBack: () -> Unit) {
    Row(modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        TextButton(onClick = onBack) { Text("< 返回") }
        Spacer(Modifier.width(8.dp))
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun EmptyHint(text: String) {
    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text(text, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}

@Composable
private fun NewsSimpleRow(news: News, onClick: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().clickable(onClick = onClick).padding(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(news.title, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium, maxLines = 2)
            Text(news.category, fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
    Divider()
}
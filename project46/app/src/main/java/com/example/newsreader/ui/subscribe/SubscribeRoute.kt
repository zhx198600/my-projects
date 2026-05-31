package com.example.newsreader.ui.subscribe

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.collectAsState
import com.example.newsreader.ui.NewsReaderViewModel

@Composable
fun SubscribeRoute(viewModel: NewsReaderViewModel) {
    val keywords by viewModel.keywords.collectAsState()
    var input by remember { mutableStateOf("") }

    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("关键词订阅", style = MaterialTheme.typography.titleLarge, modifier = Modifier.padding(bottom = 8.dp))
        Text("添加关键词，匹配的新闻将在首页高亮", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant, modifier = Modifier.padding(bottom = 16.dp))
        OutlinedTextField(
            value = input,
            onValueChange = { input = it },
            label = { Text("输入关键词") },
            modifier = Modifier.fillMaxWidth(),
            singleLine = true
        )
        androidx.compose.material3.Button(
            onClick = {
                val word = input.trim()
                if (word.isNotEmpty()) {
                    viewModel.addKeyword(word)
                    input = ""
                }
            },
            modifier = Modifier.padding(top = 8.dp)
        ) { Text("添加") }
        Text("已订阅", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(top = 24.dp, bottom = 8.dp))
        if (keywords.isEmpty()) {
            Text("暂无订阅", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        } else {
            LazyColumn(contentPadding = PaddingValues(top = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(keywords, key = { it.word }) { kw ->
                    AssistChip(
                        onClick = { viewModel.removeKeyword(kw.word) },
                        label = { Text(kw.word) },
                        trailingIcon = {
                            Icon(Icons.Filled.Close, contentDescription = "删除")
                        },
                        colors = AssistChipDefaults.assistChipColors()
                    )
                }
            }
        }
    }
}
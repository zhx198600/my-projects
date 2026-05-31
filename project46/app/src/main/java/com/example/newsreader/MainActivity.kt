package com.example.newsreader

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.core.view.WindowCompat
import com.example.newsreader.ui.NewsReaderApp
import com.example.newsreader.ui.NewsReaderViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: com.example.newsreader.ui.NewsReaderViewModel by viewModels {
        val app = application as NewsReaderApplication
        NewsReaderViewModelFactory(app.container)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, false)
        setContent {
            NewsReaderApp(viewModel)
        }
    }
}

package com.example.newsreader

import android.app.Application
import com.example.newsreader.di.AppContainer

class NewsReaderApplication : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
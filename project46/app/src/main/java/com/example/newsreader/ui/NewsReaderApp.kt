package com.example.newsreader.ui

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.newsreader.ui.detail.NewsDetailRoute
import com.example.newsreader.ui.home.HomeRoute
import com.example.newsreader.ui.mine.MineRoute
import com.example.newsreader.ui.recommend.RecommendRoute
import com.example.newsreader.ui.subscribe.SubscribeRoute
import com.example.newsreader.ui.theme.NewsTheme
import androidx.compose.runtime.collectAsState

private enum class TopLevel(val route: String, val label: String) {
    HOME("home", "首页"),
    RECOMMEND("recommend", "推荐"),
    SUBSCRIBE("subscribe", "订阅"),
    MINE("mine", "我的")
}

@Composable
fun NewsReaderApp(viewModel: NewsReaderViewModel) {
    val themeMode by viewModel.themeMode.collectAsState()
    NewsTheme(themeMode = themeMode) {
        val navController = rememberNavController()
        Scaffold(
            bottomBar = {
                val backStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = backStackEntry?.destination?.route
                val topLevels = TopLevel.values()
                if (currentRoute in topLevels.map { it.route }) {
                    NavigationBar {
                        topLevels.forEach { screen ->
                            NavigationBarItem(
                                selected = currentRoute == screen.route,
                                onClick = {
                                    navController.navigate(screen.route) {
                                        popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                },
                                icon = {
                                    Icon(
                                        imageVector = when (screen) {
                                            TopLevel.HOME -> Icons.Filled.Home
                                            TopLevel.RECOMMEND -> Icons.Filled.Book
                                            TopLevel.SUBSCRIBE -> Icons.Filled.Notifications
                                            TopLevel.MINE -> Icons.Filled.Person
                                        },
                                        contentDescription = screen.label
                                    )
                                },
                                label = { Text(screen.label) }
                            )
                        }
                    }
                }
            }
        ) { innerPadding ->
            NavHost(
                navController = navController,
                startDestination = TopLevel.HOME.route,
                modifier = Modifier.padding(innerPadding)
            ) {
                composable(TopLevel.HOME.route) { HomeRoute(viewModel, onNewsClick = { id -> navController.navigate("detail/$id") }) }
                composable(TopLevel.RECOMMEND.route) { RecommendRoute(viewModel, onNewsClick = { id -> navController.navigate("detail/$id") }) }
                composable(TopLevel.SUBSCRIBE.route) { SubscribeRoute(viewModel) }
                composable(TopLevel.MINE.route) { MineRoute(viewModel, onNewsClick = { id -> navController.navigate("detail/$id") }) }
                composable("detail/{newsId}") { backStackEntry ->
                    val newsId = backStackEntry.arguments?.getString("newsId").orEmpty()
                    NewsDetailRoute(viewModel, newsId, onBack = { navController.popBackStack() })
                }
            }
        }
    }
}

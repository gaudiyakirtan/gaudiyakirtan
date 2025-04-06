package com.gaudiyakirtan.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.ui.home.HomeScreen

/**
 * Navigation screens for the Gaudiya Kirtan application
 */
sealed class Screen(val route: String, val iconResId: Int, val label: String) {
    object Home : Screen("home", R.drawable.ic_home, "Home")
    object Library : Screen("library", R.drawable.ic_library, "Library")
    object Search : Screen("search", R.drawable.ic_search, "Search")
    object Settings : Screen("settings", R.drawable.ic_settings, "Settings")
}

/**
 * Main navigation component for the Gaudiya Kirtan application
 * Handles navigation between main screens
 */
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val items = listOf(
        Screen.Home,
        Screen.Library,
        Screen.Search,
        Screen.Settings
    )
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(painter = painterResource(id = screen.iconResId), contentDescription = screen.label) },
                        label = { Text(screen.label) },
                        selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                        onClick = {
                            navController.navigate(screen.route) {
                                // Pop up to the start destination of the graph to
                                // avoid building up a large stack of destinations
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                // Avoid multiple copies of the same destination when reselecting the same item
                                launchSingleTop = true
                                // Restore state when reselecting a previously selected item
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) { HomeScreen() }
            // Add other screens when implemented
        }
    }
}
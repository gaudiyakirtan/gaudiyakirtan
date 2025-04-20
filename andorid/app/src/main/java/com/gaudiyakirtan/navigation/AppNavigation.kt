package com.gaudiyakirtan.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.ui.collections.CollectionsScreen
import com.gaudiyakirtan.myapplication.ui.home.HomeScreen
import com.gaudiyakirtan.myapplication.ui.theme.GaurNeutral
import com.gaudiyakirtan.myapplication.ui.theme.ShyamNeutral

/**
 * Navigation tabs for the Gaudiya Kirtan application
 * Matching the iOS implementation
 */
sealed class Tab(
    val route: String, 
    val outlineIcon: Int, 
    val filledIcon: Int, 
    val label: String
) {
    object Home : Tab(
        "home", 
        R.drawable.ic_home, 
        R.drawable.ic_home_filled, 
        "Home"
    )
    
    object Library : Tab(
        "library", 
        R.drawable.ic_library, 
        R.drawable.ic_library_filled, 
        "Library"
    )
    
    object Collection : Tab(
        "collection", 
        R.drawable.ic_stack, 
        R.drawable.ic_stack_filled, 
        "Collection"
    )
    
    object Search : Tab(
        "search", 
        R.drawable.ic_search, 
        R.drawable.ic_search_filled, 
        "Search"
    )
}

/**
 * Main navigation component for the Gaudiya Kirtan application
 * Handles navigation between main screens using iOS-style navigation
 */
@Composable
fun AppNavigation() {
    val navController = rememberNavController()
    val items = listOf(
        Tab.Home,
        Tab.Library,
        Tab.Collection,
        Tab.Search
    )
    
    // Removed currentTab state variable as it's not needed
    
    Scaffold(
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.background,
                contentColor = MaterialTheme.colorScheme.tertiary // This ensures all content uses the neutral color
            ) {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                items.forEach { tab ->
                    val selected = currentDestination?.hierarchy?.any { it.route == tab.route } == true
                    
                    NavigationBarItem(
                        icon = { 
                            Icon(
                                painter = painterResource(
                                    id = if (selected) tab.filledIcon else tab.outlineIcon
                                ), 
                                contentDescription = tab.label
                                // Not setting tint explicitly since it will inherit from contentColor
                            ) 
                        },
                        label = { 
                            Text(text = tab.label)
                            // Not setting color explicitly since it will inherit from contentColor
                        },
                        selected = selected,
                        colors = androidx.compose.material3.NavigationBarItemDefaults.colors(
                            selectedIconColor = MaterialTheme.colorScheme.tertiary,
                            unselectedIconColor = MaterialTheme.colorScheme.tertiary,
                            selectedTextColor = MaterialTheme.colorScheme.tertiary,
                            unselectedTextColor = MaterialTheme.colorScheme.tertiary,
                            indicatorColor = MaterialTheme.colorScheme.background // Make indicator invisible
                        ),
                        onClick = {
                            // Removed currentTab assignment that caused the type mismatch
                            navController.navigate(tab.route) {
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
            startDestination = Tab.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Tab.Home.route) { HomeScreen() }
            
            composable(Tab.Library.route) { 
                com.gaudiyakirtan.myapplication.ui.library.LibraryScreen()
            }
            
            composable(Tab.Collection.route) { 
                CollectionsScreen()
            }
            
            composable(Tab.Search.route) { 
                // Placeholder for Search screen
                Text(
                    text = "Search", 
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(innerPadding)
                ) 
            }
        }
    }
}
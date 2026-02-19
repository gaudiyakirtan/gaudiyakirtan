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
import androidx.compose.ui.unit.dp
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import androidx.navigation.navDeepLink
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.ui.collections.CollectionsScreen
import com.gaudiyakirtan.myapplication.ui.home.HomeScreen
import com.gaudiyakirtan.myapplication.ui.song.SongScreen
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
 * Additional routes outside the main tabs
 */
sealed class Route(val route: String) {
    object Song : Route("song/{songId}")
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
    
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    
    // Determine if we're on a main tab or a detail screen
    val isOnMainTab = items.any { 
        currentDestination?.hierarchy?.any { dest -> dest.route == it.route } == true 
    }
    
    Scaffold(
        bottomBar = {
            if (isOnMainTab) { // Only show bottom nav on main tabs
                NavigationBar(
                    containerColor = MaterialTheme.colorScheme.background,
                    contentColor = MaterialTheme.colorScheme.tertiary // This ensures all content uses the neutral color
                ) {
                    items.forEach { tab ->
                        val selected = currentDestination?.hierarchy?.any { it.route == tab.route } == true
                        
                        NavigationBarItem(
                            icon = { 
                                Icon(
                                    painter = painterResource(
                                        id = if (selected) tab.filledIcon else tab.outlineIcon
                                    ), 
                                    contentDescription = tab.label
                                ) 
                            },
                            label = { 
                                Text(text = tab.label)
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
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Tab.Home.route,
            modifier = if (isOnMainTab) Modifier.padding(innerPadding) else Modifier
        ) {
            // Main tab screens
            composable(Tab.Home.route) { 
                HomeScreen(
                    onSongClick = { song ->
                        navController.navigate("song/${song.uid}")
                    }
                ) 
            }
            
            composable(Tab.Library.route) { 
                com.gaudiyakirtan.myapplication.ui.library.LibraryScreen(
                    onSongClick = { song ->
                        navController.navigate("song/${song.uid}")
                    }
                )
            }
            
            composable(Tab.Collection.route) { 
                CollectionsScreen(
                    onSongClick = { song ->
                        navController.navigate("song/${song.uid}")
                    }
                )
            }
            
            composable(Tab.Search.route) { 
                // Placeholder for Search screen
                Text(
                    text = "Search", 
                    style = MaterialTheme.typography.headlineMedium,
                    modifier = Modifier.padding(innerPadding)
                ) 
            }
            
            // Song detail screen with deep link support
            composable(
                route = Route.Song.route,
                arguments = listOf(navArgument("songId") { type = NavType.StringType }),
                deepLinks = listOf(
                    navDeepLink { uriPattern = "https://gaudiyakirtan.com/songs/{songId}" }
                )
            ) { backStackEntry ->
                val songId = backStackEntry.arguments?.getString("songId") ?: ""
                // Find the song by uid
                val song = SampleData.songs.find { it.uid == songId }
                
                if (song != null) {
                    SongScreen(
                        song = song,
                        onBackClick = { navController.popBackStack() }
                    )
                } else {
                    // Error state if song not found
                    Text(
                        text = "Song not found",
                        style = MaterialTheme.typography.headlineMedium,
                        modifier = Modifier.padding(all = 16.dp)
                    )
                }
            }
        }
    }
}
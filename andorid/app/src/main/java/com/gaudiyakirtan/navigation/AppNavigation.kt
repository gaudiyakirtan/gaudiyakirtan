package com.gaudiyakirtan.navigation

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.gaudiyakirtan.myapplication.R
import com.gaudiyakirtan.myapplication.ui.author.AuthorSongsScreen
import com.gaudiyakirtan.myapplication.ui.author.AuthorSongsViewModel
import com.gaudiyakirtan.myapplication.ui.collections.CollectionsScreen
import com.gaudiyakirtan.myapplication.ui.group.GroupSongsScreen
import com.gaudiyakirtan.myapplication.ui.group.GroupSongsViewModel
import com.gaudiyakirtan.myapplication.ui.home.HomeScreen
import com.gaudiyakirtan.myapplication.ui.player.MiniPlayerBar
import com.gaudiyakirtan.myapplication.ui.player.PlayerScreen
import com.gaudiyakirtan.myapplication.ui.settings.SettingsScreen
import com.gaudiyakirtan.myapplication.ui.song.SongScreen
import com.gaudiyakirtan.myapplication.ui.song.SongViewModel
import com.gaudiyakirtan.myapplication.ui.theme.GaurNeutral
import com.gaudiyakirtan.myapplication.ui.theme.ShyamNeutral
import com.gaudiyakirtan.services.PlayerViewModel

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
    object Settings : Route("settings")
    object Author : Route("author/{authorUid}")
    object Group : Route("group/{groupUid}")
    object Player : Route("player")
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

    // The global playback service (docs/screens/player.md "a global playback service, not
    // per-screen state"). Instantiated here -- a sibling of NavHost, not inside any composable{}
    // route -- so its ViewModelStoreOwner is the host Activity and it survives navigation between
    // screens exactly like a single shared now-playing session.
    val playerViewModel: PlayerViewModel = viewModel(factory = PlayerViewModel.factory())
    val playerUiState by playerViewModel.uiState.collectAsState()

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination

    // Determine if we're on a main tab or a detail screen
    val isOnMainTab = items.any {
        currentDestination?.hierarchy?.any { dest -> dest.route == it.route } == true
    }
    // Hide the mini-player while the full Now Playing screen is already showing, to avoid
    // duplicating the same now-playing UI on screen at once.
    val isOnPlayerScreen = currentDestination?.hierarchy?.any { it.route == Route.Player.route } == true

    Scaffold(
        bottomBar = {
            Column {
                if (!isOnPlayerScreen) {
                    MiniPlayerBar(
                        uiState = playerUiState,
                        onExpandClick = { navController.navigate(Route.Player.route) },
                        onPlayPauseClick = { playerViewModel.togglePlayPause() }
                    )
                }
                if (isOnMainTab) { // Only show bottom nav on main tabs
                    NavigationBar(
                        containerColor = MaterialTheme.colorScheme.background,
                        contentColor = MaterialTheme.colorScheme.neutral // This ensures all content uses the neutral color
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
                                    // Active tab uses the accent/highlight token (docs/screens/browse.md
                                    // Navigation: "Active state uses the accent/highlight token").
                                    selectedIconColor = MaterialTheme.colorScheme.surfaceVariant,
                                    unselectedIconColor = MaterialTheme.colorScheme.neutral,
                                    selectedTextColor = MaterialTheme.colorScheme.surfaceVariant,
                                    unselectedTextColor = MaterialTheme.colorScheme.neutral,
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
                    onSongClick = { uid ->
                        navController.navigate("song/$uid")
                    },
                    onSettingsClick = {
                        navController.navigate(Route.Settings.route)
                    },
                    onSearchClick = {
                        // The Home search bar expands into the Search tab (docs/screens/search.md).
                        navController.navigate(Tab.Search.route) {
                            popUpTo(navController.graph.findStartDestination().id) { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                    onAuthorClick = { authorUid ->
                        navController.navigate("author/$authorUid")
                    },
                    onGroupClick = { groupUid ->
                        navController.navigate("group/$groupUid")
                    }
                )
            }

            composable(Tab.Library.route) {
                com.gaudiyakirtan.myapplication.ui.library.LibraryScreen(
                    onSongClick = { uid ->
                        navController.navigate("song/$uid")
                    },
                    onAuthorClick = { authorUid ->
                        navController.navigate("author/$authorUid")
                    },
                    onGroupClick = { groupUid ->
                        navController.navigate("group/$groupUid")
                    }
                )
            }

            composable(Tab.Collection.route) {
                CollectionsScreen(
                    onSongClick = { uid ->
                        navController.navigate("song/$uid")
                    }
                )
            }
            
            composable(Tab.Search.route) {
                com.gaudiyakirtan.myapplication.ui.search.SearchScreen(
                    onSongClick = { uid ->
                        navController.navigate("song/$uid")
                    }
                )
            }
            
            // Song detail screen: SongViewModel loads the full Song (offline, from
            // assets/songs/<uid>.json) by uid and owns all reader display state (script / toggles /
            // collapse), per docs/screens/song-detail.md. List screens never carry a full Song.
            composable(
                route = Route.Song.route,
                arguments = listOf(navArgument("songId") { type = NavType.StringType })
            ) { backStackEntry ->
                val songId = backStackEntry.arguments?.getString("songId") ?: ""
                val songViewModel: SongViewModel = viewModel(
                    key = "song/$songId",
                    factory = SongViewModel.factory(songId)
                )
                val songForPlayback by songViewModel.song.collectAsState()
                SongScreen(
                    viewModel = songViewModel,
                    onBackClick = { navController.popBackStack() },
                    onPlayClick = {
                        // song-detail play affordance (docs/screens/player.md interaction): start
                        // this song's track on the shared player + open/raise the player.
                        songForPlayback?.let { song ->
                            playerViewModel.play(song)
                            navController.navigate(Route.Player.route)
                        }
                    },
                    onAuthorClick = { authorUid ->
                        navController.navigate("author/$authorUid")
                    }
                )
            }

            // Author-filtered song list (songs-list.md `Library (Author)` variant), reached from
            // song-detail's author-tap and the Authors tab.
            composable(
                route = Route.Author.route,
                arguments = listOf(navArgument("authorUid") { type = NavType.StringType })
            ) { backStackEntry ->
                val authorUid = backStackEntry.arguments?.getString("authorUid") ?: ""
                val authorViewModel: AuthorSongsViewModel = viewModel(
                    key = "author/$authorUid",
                    factory = AuthorSongsViewModel.factory(authorUid)
                )
                AuthorSongsScreen(
                    viewModel = authorViewModel,
                    onSongClick = { uid -> navController.navigate("song/$uid") },
                    onBackClick = { navController.popBackStack() }
                )
            }

            // Book/Topic group song list (docs/data/collections.md `SongGroup`), reached from a
            // BookCard/TopicCard tap on the Library Books/Topics tabs or the Home sections.
            composable(
                route = Route.Group.route,
                arguments = listOf(navArgument("groupUid") { type = NavType.StringType })
            ) { backStackEntry ->
                val groupUid = backStackEntry.arguments?.getString("groupUid") ?: ""
                val groupViewModel: GroupSongsViewModel = viewModel(
                    key = "group/$groupUid",
                    factory = GroupSongsViewModel.factory(groupUid)
                )
                GroupSongsScreen(
                    viewModel = groupViewModel,
                    onSongClick = { uid -> navController.navigate("song/$uid") },
                    onBackClick = { navController.popBackStack() }
                )
            }

            // Settings screen: device-local persisted display/appearance settings (settings.md),
            // reached from the Home search bar's gear icon.
            composable(Route.Settings.route) {
                SettingsScreen(
                    onBackClick = { navController.popBackStack() }
                )
            }

            // Now Playing (docs/screens/player.md): raised by the song-detail play affordance and
            // by tapping the mini-player. Reads the *shared* playerViewModel's state -- not its own
            // ViewModel -- so it always reflects whatever the global playback service is doing.
            composable(Route.Player.route) {
                PlayerScreen(
                    uiState = playerUiState,
                    onBackClick = { navController.popBackStack() },
                    onPlayPauseClick = { playerViewModel.togglePlayPause() },
                    onSeek = { positionMs -> playerViewModel.seekTo(positionMs) },
                    onTrackSelected = { track -> playerViewModel.selectTrack(track) }
                )
            }
        }
    }
}
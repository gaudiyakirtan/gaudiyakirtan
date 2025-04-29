import SwiftUI
import Foundation

struct AppNavigation: View {
    @State private var selection: Tab = .home

    enum Tab {
        case home, library, collection, search

        var iconName: String {
            switch self {
            case .home: return "home"
            case .library: return "library"
            case .collection: return "stack"
            case .search: return "search"
            }
        }

        var filledIconName: String {
            switch self {
            case .home: return "home-filled"
            case .library: return "library-filled"
            case .collection: return "stack-filled"
            case .search: return "search-filled"
            }
        }
    }

    let gradient: LinearGradient = LinearGradient(
        colors: [
            Color.background.opacity(0),
            Color.background,
            Color.background
        ],
        startPoint: .top,
        endPoint: .bottom
    )

    var body: some View {
        TabView(selection: $selection) {
            NavigationView {
                HomeView()
                    .navigationBarHidden(true)
            }
            .tag(Tab.home)
            .tabItem {
                Image(selection == .home ? Tab.home.filledIconName : Tab.home.iconName)
                    .renderingMode(.template)
                    .foregroundColor(Color.neutral)
                Text("Home")
                    .foregroundColor(Color.neutral)
            }
            .background(Color.background)

            NavigationView {
                LibraryView()
                    .navigationBarHidden(true)
            }
            .tag(Tab.library)
            .tabItem {
                Image(selection == .library ? Tab.library.filledIconName : Tab.library.iconName)
                    .renderingMode(.template)
                    .foregroundColor(Color.neutral)
                Text("Library")
                    .foregroundColor(Color.neutral)
            }
            .background(Color.background)

            NavigationView {
                CollectionsView()
                    .navigationBarHidden(true)
            }
            .tag(Tab.collection)
            .tabItem {
                Image(
                    selection == .collection
                        ? Tab.collection.filledIconName : Tab.collection.iconName
                )
                .renderingMode(.template)
                .foregroundColor(Color.neutral)
                Text("Collections")
                    .foregroundColor(Color.neutral)
            }

            NavigationView {
                Text("Search")
                    .navigationBarHidden(true)
            }
            .tag(Tab.search)
            .tabItem {
                Image(selection == .search ? Tab.search.filledIconName : Tab.search.iconName)
                    .renderingMode(.template)
                    .foregroundColor(Color.neutral)
                Text("Search")
                    .foregroundColor(Color.neutral)
            }
        }
        .tint(Color.neutral)
        .onAppear() {
            UITabBar.appearance().backgroundColor = UIColor(Color.background)
            
            // Configure NavigationBar appearance to be hidden by default
            let appearance = UINavigationBarAppearance()
            appearance.configureWithTransparentBackground()
            UINavigationBar.appearance().standardAppearance = appearance
            UINavigationBar.appearance().compactAppearance = appearance
            UINavigationBar.appearance().scrollEdgeAppearance = appearance
        }
    }
}

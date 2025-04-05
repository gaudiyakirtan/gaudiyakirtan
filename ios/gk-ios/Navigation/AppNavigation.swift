import SwiftUI

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
//        NavigationStack {
            TabView(selection: $selection) {
                HomeView()
                    .tag(Tab.home)
                    .tabItem {
                        Image(selection == .home ? Tab.home.filledIconName : Tab.home.iconName)
                            .renderingMode(.template)
                            .foregroundColor(Color.neutral)
                        Text("Home")
                            .foregroundColor(Color.neutral)
                    }
                    .background(Color.background)

                Text("Library")
                    .tag(Tab.library)
                    .tabItem {
                        Image(selection == .library ? Tab.library.filledIconName : Tab.library.iconName)
                            .renderingMode(.template)
                            .foregroundColor(Color.neutral)
                        Text("Library")
                            .foregroundColor(Color.neutral)
                    }

                Text("Collection")
                    .tag(Tab.collection)
                    .tabItem {
                        Image(
                            selection == .collection
                                ? Tab.collection.filledIconName : Tab.collection.iconName
                        )
                        .renderingMode(.template)
                        .foregroundColor(Color.neutral)
                        Text("Collection")
                            .foregroundColor(Color.neutral)
                    }

                Text("Search")
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
            }
    }
}

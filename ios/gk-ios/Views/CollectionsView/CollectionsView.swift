import SwiftUI

struct CollectionsView: View {
    @StateObject private var viewModel = CollectionsViewModel()
    
    var body: some View {
        VStack(spacing: 16) {
            // Category selector (moved to top)
            CategorySelector(
                selection: $viewModel.selectedCategory,
                categories: CollectionsViewModel.Category.allCases
            )
            .padding(.top, 8)
            
            // Search bar
            SearchBar(
                searchText: $viewModel.searchText,
                placeholder: viewModel.searchPlaceholder
            )
            .padding(.horizontal)
            
            // Collections grid. No collection data ships in the current corpus (browse.md "Empty
            // groupings") — a tasteful empty state, never fake rows.
            if viewModel.filteredCollections.isEmpty {
                EmptyStateView(
                    systemImage: "square.stack",
                    title: "No \(viewModel.selectedCategory.rawValue.lowercased()) yet",
                    message: "Your \(viewModel.selectedCategory.rawValue.lowercased()) will appear here once you add some."
                )
            } else {
                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                    ForEach(viewModel.filteredCollections) { collection in
                        // Calculate song count
                        let songCount = collection.songIds.count

                        CollectionCard(
                            collection: collection,
                            songCount: songCount,
                            action: { /* Handle collection selection */ }
                        )
                    }
                }
                .padding(.horizontal)
            }

            Spacer(minLength: 0)
        }
        .background(Color.background)
    }
}

#Preview {
    CollectionsView()
}
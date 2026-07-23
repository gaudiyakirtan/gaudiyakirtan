import Foundation
import Combine

/// Drives the Search screen (docs/screens/search.md): holds the live query and the ranked results,
/// debouncing input and running the (abstracted) `SongSearcher` off the main thread. Depends only on
/// the `SongSearcher` protocol, so a future semantic tier can be injected without touching the view.
final class SearchViewModel: ObservableObject {
    @Published var query: String = ""
    @Published private(set) var results: [ManifestEntry] = []
    /// True once a non-empty query has been evaluated — lets the view distinguish the idle state
    /// (nothing typed) from the genuine no-results state.
    @Published private(set) var hasQuery: Bool = false

    private let searcher: SongSearcher
    private let resultLimit: Int
    private var cancellables = Set<AnyCancellable>()

    init(searcher: SongSearcher = SongRepository.shared.songSearcher, resultLimit: Int = 60) {
        self.searcher = searcher
        self.resultLimit = resultLimit

        $query
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
            .removeDuplicates()
            .debounce(for: .milliseconds(180), scheduler: DispatchQueue.main)
            .receive(on: DispatchQueue.global(qos: .userInitiated))
            .map { [searcher, resultLimit] trimmed -> (Bool, [ManifestEntry]) in
                trimmed.isEmpty ? (false, []) : (true, searcher.search(trimmed, limit: resultLimit))
            }
            .receive(on: DispatchQueue.main)
            .sink { [weak self] hasQuery, results in
                self?.hasQuery = hasQuery
                self?.results = results
            }
            .store(in: &cancellables)
    }
}

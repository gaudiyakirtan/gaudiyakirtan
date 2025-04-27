import SwiftUI

struct TopicsScrollView: View {
    let topics: [Topic]
    let songs: [Song]
    
    init(topics: [Topic], songs: [Song] = []) {
        self.topics = topics
        self.songs = songs
    }
    
    var body: some View {
        VStack(alignment: .leading) {
            Text("Topics")
                .font(.title2)
                .fontWeight(.bold)
                .padding()

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    Spacer().frame(width: 6)
                    ForEach(topics) { topic in
                        // Use actual song count if available, otherwise use the demo count
                        let songCount = songs.isEmpty ? topic.demoSongCount : songs.filter { song in
                            song.tags.contains(where: { $0.lowercased() == topic.name.lowercased() })
                        }.count
                        
                        TopicCard(topic: topic, songCount: songCount > 0 ? songCount : topic.demoSongCount)
                    }
                }
            }
        }
    }
}

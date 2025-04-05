import SwiftUI

struct TopicsScrollView: View {
    let topics: [Topic]
    
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
                        TopicCard(topic: topic)
                    }
                }
            }
        }
    }
}

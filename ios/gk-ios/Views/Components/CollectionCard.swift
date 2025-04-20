import SwiftUI

struct CollectionCard: View {
    let collection: Collection
    var songCount: Int? // Can be explicitly provided or defaults to songIds.count
    var action: () -> Void = {}
    
    init(collection: Collection, songCount: Int? = nil, action: @escaping () -> Void = {}) {
        self.collection = collection
        // Default to the collection's song count if not explicitly provided
        self.songCount = songCount ?? (collection.songIds.isEmpty ? nil : collection.songIds.count)
        self.action = action
    }
    
    var body: some View {
        Button(action: action) {
            ZStack {
                // Background
                getMediaColor(media: collection.name)
                    .frame(width: 176, height: 108)
                    .cornerRadius(12)
                
                // Content
                VStack(alignment: .leading, spacing: 0) {
                    // Collection name with fixed height
                    Text(collection.name)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                        .lineSpacing(3)
                        .lineLimit(2)
                        .truncationMode(.tail)
                        .frame(width: 136, height: 48, alignment: .topLeading)
                    
                    Spacer()
                    
                    // Song count (if provided and greater than 0)
                    if let count = songCount, count > 0 {
                        Text("\(count) songs")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.8))
                            .padding(.top, 4)
                            .lineLimit(1)
                    }
                }
                .padding(20)
                .frame(width: 176, alignment: .topLeading)
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}
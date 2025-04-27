import SwiftUI

struct TopicCard: View {
    let topic: Topic
    var songCount: Int? = nil
    var action: () -> Void = {}
    
    var body: some View {
        Button(action: action) {
            ZStack {
                // Background
                getMediaColor(media: topic.name)
                    .frame(width: 176, height: 108) // Match web minHeight of 108px
                    .cornerRadius(12)
                
                // Content
                VStack(alignment: .leading, spacing: 0) {
                    // Topic name with fixed height to match web
                    Text(topic.name)
                        .font(.system(size: 16, weight: .bold)) // Match web text-base
                        .foregroundColor(.white)
                        .lineSpacing(3) // To approximate web lineHeight: 1.2
                        .lineLimit(2)
                        .truncationMode(.tail) // Explicitly ensure truncation
                        .frame(width: 136, height: 48, alignment: .topLeading) // Fixed width to ensure truncation
                    
                    Spacer()
                    
                    // Song count badge at the bottom
                    if let count = songCount {
                        Tag(
                            text: "\(count) songs",
                            variant: .default,
                            size: .normal
                        )
                    }
                }
                .padding(20) // Match web padding of 1.25rem
                .frame(width: 176, alignment: .topLeading) // Fixed width to match card dimensions
            }
        }
        .buttonStyle(PlainButtonStyle())
    }
}

let colors: [Color] = [
    Color(red: 30/255, green: 50/255, blue: 100/255),    // blue
    Color(red: 186/255, green: 93/255, blue: 7/255),     // orange
    Color(red: 141/255, green: 103/255, blue: 171/255),  // purple
    Color(red: 20/255, green: 138/255, blue: 8/255),     // green
    Color(red: 216/255, green: 64/255, blue: 0/255),     // red-orange
    Color(red: 80/255, green: 55/255, blue: 80/255),     // dark-purple
    Color(red: 0/255, green: 100/255, blue: 80/255),     // dark-green
    Color(red: 233/255, green: 20/255, blue: 41/255),    // red
    Color(red: 83/255, green: 122/255, blue: 161/255),   // light-blue
    Color(red: 45/255, green: 70/255, blue: 185/255),    // royal-blue
    Color(red: 119/255, green: 119/255, blue: 119/255)   // gray
]

func getMediaColor(media: String) -> Color {
    let colorIndex = media.count % colors.count
    return colors[colorIndex]
}

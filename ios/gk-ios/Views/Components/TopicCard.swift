import SwiftUI

struct TopicCard: View {
    let topic: Topic
    
    var body: some View {
        ZStack(alignment: .topLeading) {  // Changed to topLeading alignment
            getMediaColor(media: topic.name)
                .frame(width: 176, height: 96)
                .cornerRadius(12)
            
            Text(topic.name)
                .font(.system(size: 20, weight: .bold))
                .foregroundColor(.white)
                .padding(.leading, 24)
                .padding(.top, 24)
                .fixedSize(horizontal: false, vertical: true)
                .lineLimit(2)
                .frame(maxWidth: 140, alignment: .leading)
        }
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

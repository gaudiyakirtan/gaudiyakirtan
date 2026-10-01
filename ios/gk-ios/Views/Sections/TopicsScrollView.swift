import SwiftUI

struct TopicsScrollView: View {
    let topics: [Topic]
    let layout: HomeLayout

    var body: some View {
        HomeShelf(title: "Topics", items: topics, itemWidth: 176, layout: layout) { topic in
            NavigationLink(destination: SongGroupSongsView(groupUid: topic.id, kind: .topic, title: topic.name)) {
                VStack(alignment: .leading, spacing: HomeSpacing.sm) {
                    Image(systemName: "tag")
                        .foregroundStyle(Color.secondaryText)
                        .accessibilityHidden(true)
                    Text(topic.name)
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(Color.primaryText)
                        .fixedSize(horizontal: false, vertical: true)
                    Text(topic.songUids.count == 1 ? "1 song" : "\(topic.songUids.count) songs")
                        .font(.subheadline)
                        .foregroundStyle(Color.tertiaryText)
                }
                .padding(HomeSpacing.lg)
                .frame(maxWidth: .infinity, minHeight: 112, alignment: .leading)
                .accessibilityElement(children: .combine)
            }
            .buttonStyle(HomeControlStyle(cornerRadius: HomeShape.medium))
            .accessibilityIdentifier("home.topic.\(topic.id)")
        }
    }
}

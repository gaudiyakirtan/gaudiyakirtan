import SwiftUI
import UIKit

/// Home's lead region — "Welcome + this month" (docs/screens/home.md §1), which embeds
/// docs/screens/today.md **v2**, backed by the lunar-calendar overlay (docs/data/calendar.md).
///
/// This is the screen's recommendation surface and **the only region that changes on its own**: the
/// lunar month turns over roughly monthly, so in Āṣāḍha it yields the Jagannātha/Ratha-yātrā songs
/// and in Kārtika the Dāmodarāṣṭakam set. Home without it recommends nothing, which is precisely why
/// the spec made it the hero.
///
/// ## Screen-design decisions (CLAUDE.md "Screen design process")
///
/// - **Goal / primary action:** "what do I sing right now?" — open one of this month's songs.
/// - **Layout:** one card holding a banner over a list. The spec's "banner left, songs right" is
///   web's *expanded* arrangement; at compact width web stacks them, and the phone is compact.
/// - **Hierarchy:** banner (which month it is) → song rows (what to sing) → the "sung this month"
///   label, a quiet tag on the list rather than a heading competing with the banner.
/// - **The one expressive focal element is the banner**, and it earns it by being the only thing on
///   Home that answers the screen's question by itself; everything else on Home is navigation. It
///   carries the emphasis through the gradient fill, the artwork slot and overlaid type — the rows
///   beneath stay deliberately quiet (the shared `SongListItem`, unchanged) so the contrast reads.
/// - **Motion:** none. Nothing here changes state, so animation would be decoration, which the
///   design contract forbids.
///
/// Honesty constraints from the spec, all load-bearing:
/// - A month with **no songs is a real case** (Pauṣa ships none). Say so plainly — never fabricate
///   rows to fill the region.
/// - When the date falls outside the calendar's precomputed range the caller has no `CalendarToday`
///   to pass, and the region disappears entirely rather than showing a wrong month.
/// - Nothing implies day-level precision: no countdown, no "day N", and the observances are named as
///   what falls *in the month*, never as what falls today.
/// - Song order is decided upstream by `CalendarRepositoryLogic.monthSongs(for:manifest:)` — the
///   month's shipped sequence, with playable songs stably lifted to the front. `basis` is not a sort
///   key (today.md v2) and is deliberately not badged on any row.
struct ThisMonthSection: View {
    let today: CalendarToday
    /// Already ordered by the repository. This view only caps how many it draws.
    let songs: [ManifestEntry]

    /// A **display** cap, applied after the repository's ordering and never in the data layer
    /// (today.md v2 "Display cap"). Kārtika alone references 15 songs, which would turn the lead
    /// region into the whole screen. Matches web's cap of 6.
    ///
    /// `static` so it stays out of the synthesized memberwise initializer.
    private static let displayLimit = 6

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            MonthBanner(
                title: today.window.lunarMonth,
                subtitle: today.window.gaudiyaMonth,
                caption: today.month.observances.isEmpty
                    ? nil
                    : today.month.observances.joined(separator: " · "),
                // An intercalary month is Puruṣottama and is genuinely unusual — worth naming.
                badge: today.window.adhika ? "adhika-māsa" : nil,
                artworkURL: ImageConfig.monthArtworkURL(forGaudiyaMonth: today.window.gaudiyaMonth)
            )

            VStack(alignment: .leading, spacing: 0) {
                // A quiet tag on the list, not a section heading: the banner directly above already
                // holds the emphasis, and two loud things next to each other read as neither.
                Text("SUNG THIS MONTH")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(Color.neutral.opacity(0.7))
                    .padding(.bottom, 6)

                if songs.isEmpty {
                    // A real state, not a failure: some months carry no songs in the shipped corpus.
                    Text("No songs are specific to \(today.window.lunarMonth).")
                        .font(.system(size: 14))
                        .foregroundColor(Color.neutral)
                        .padding(.vertical, 8)
                } else {
                    // TODO: web's playable rows also carry a recording picker (stacked singer avatars
                    // + take count) that starts a take in the mini-player without navigating. That
                    // needs player wiring this section does not have yet.
                    ForEach(songs.prefix(Self.displayLimit)) { entry in
                        SongListItem(entry: entry)
                    }
                }
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.backgroundOffset)
        .cornerRadius(16)
        // Token by name rather than symbol, matching the `Color("primaryText")` usage elsewhere in
        // this codebase; `border` is the theme.md token, resolved per palette by the asset catalog.
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color("border"), lineWidth: 1)
        )
    }
}

/// The month banner: artwork when there is any, a themed gradient when there is not, a dark scrim
/// over whichever it got, and the month's text overlaid bottom-left.
///
/// Artwork is best-effort by design — only Vāmana ships a file, so **the gradient is the normal
/// path, not an error** (docs/screens/home.md §1 "Artwork"). Nothing here signals failure: a missing
/// image simply leaves the gradient visible, which is why the gradient is painted as the base layer
/// rather than as a fallback swapped in on error.
private struct MonthBanner: View {
    let title: String
    let subtitle: String?
    let caption: String?
    let badge: String?
    let artworkURL: URL?

    /// The bundled file, if this month ships one. A synchronous read is right here: the file is
    /// local and small, so `AsyncImage` would spin up `URLSession` for something already on disk —
    /// and an offline-first app should not make its hero depend on a loader at all. For every month
    /// but Vāmana this is a single `nil` check with no decode.
    private var artwork: UIImage? {
        guard let url = artworkURL else { return nil }
        return UIImage(contentsOfFile: url.path)
    }

    /// Web's `from-accent/70 via-highlight/40 to-background-offset`, top-leading to bottom-trailing.
    /// `accent` and `highlight` resolve to the same token in both palettes, so this is one hue
    /// thinning out into the card's own surface — the banner reads as lit from the corner rather
    /// than as a slab.
    private var gradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [
                Color.highlight.opacity(0.7),
                Color.highlight.opacity(0.4),
                Color.backgroundOffset
            ]),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    /// Bottom-to-top black scrim, so the overlaid text stays legible over artwork whose colors we do
    /// not control. Fixed black rather than a theme token: a palette-following color would invert
    /// this into a *lightening* wash in Shyam (the same reasoning `BookCard`'s scrim uses).
    private var scrim: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [
                Color.black.opacity(0.75),
                Color.black.opacity(0.3),
                Color.clear
            ]),
            startPoint: .bottom,
            endPoint: .top
        )
    }

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            Rectangle()
                .fill(gradient)

            if let image = artwork {
                // Wrapped in a GeometryReader so the `.fill` aspect ratio is resolved against the
                // banner's own size. A bare `.aspectRatio(contentMode: .fill)` inside a ZStack can
                // grow the stack instead of overflowing it.
                GeometryReader { proxy in
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: proxy.size.width, height: proxy.size.height)
                        .clipped()
                }
                // Decorative: the month is named in the text right below it (web marks the same
                // image `aria-hidden` for this reason), so announcing it would repeat the heading.
                .accessibilityHidden(true)
            }

            Rectangle()
                .fill(scrim)

            VStack(alignment: .leading, spacing: 3) {
                if let badge = badge {
                    Text(badge)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(.white)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 2)
                        .background(Color.white.opacity(0.2))
                        .cornerRadius(4)
                }

                Text(title)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
                    .fixedSize(horizontal: false, vertical: true)

                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.system(size: 14))
                        .foregroundColor(Color.white.opacity(0.8))
                        .fixedSize(horizontal: false, vertical: true)
                }

                if let caption = caption {
                    Text(caption)
                        .font(.system(size: 12))
                        .foregroundColor(Color.white.opacity(0.75))
                        // An observance list can run long; two lines is the budget before it starts
                        // crowding out the month name it is annotating.
                        .lineLimit(2)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }
            .padding(12)
            // White-on-artwork is the one place the palette does not decide the text color:
            // `onHighlight` means "legible on the accent fill", and this text sits over a photograph
            // the theme knows nothing about. The shadow is what keeps it readable where the artwork
            // happens to be light.
            .shadow(color: Color.black.opacity(0.5), radius: 1.5, x: 0, y: 1)
        }
        // A minimum, not a fixed height: the observance line and the reader's Dynamic Type setting
        // both grow this box, and clipping either would be the accessibility trade the design
        // contract forbids.
        .frame(maxWidth: .infinity, minHeight: 160, alignment: .bottomLeading)
        .clipped()
        .cornerRadius(12)
    }
}

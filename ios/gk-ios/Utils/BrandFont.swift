import SwiftUI

/// The brand display face (5th Avenue), matching web's `--font-display` and Android's
/// `DisplayFontFamily`.
///
/// The wordmark and Home v7's featured Latin title only. It has no Indic coverage, so native-script
/// titles and all song body text stay on the script-capable system font. It ships **Regular only**;
/// never apply `.bold()` — the system would synthesize a weight and smear the script.
///
/// The file is bundled from `Resources/Fonts/5thAvenue.ttf` (picked up automatically by the
/// target's synchronized folder group) and registered via the `INFOPLIST_KEY_UIAppFonts` build
/// setting, since this project generates its Info.plist rather than checking one in.
extension Font {
    /// 5th Avenue at `size`, falling back to the system serif if the font failed to register.
    static func brandDisplay(size: CGFloat, relativeTo style: Font.TextStyle = .title) -> Font {
        .custom(brandDisplayName, size: size, relativeTo: style)
    }

    /// PostScript name as recorded in the font's `name` table — what `Font.custom` resolves against.
    private static let brandDisplayName = "5thAvenue"
}

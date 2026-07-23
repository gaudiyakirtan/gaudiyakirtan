import SwiftUI

/// The brand display face (5th Avenue), matching web's `--font-display` and Android's
/// `DisplayFontFamily`.
///
/// Branding only — the wordmark and the Home welcome heading. Deliberately NOT for song text: it is
/// a decorative Latin script with no Indic coverage, so verses in Bengali/Devanagari must stay on
/// the system font. It ships **Regular only**, so never apply `.bold()` to it — the system would
/// synthesize a weight and smear the script.
///
/// The file is bundled from `Resources/Fonts/5thAvenue.ttf` (picked up automatically by the
/// target's synchronized folder group) and registered via the `INFOPLIST_KEY_UIAppFonts` build
/// setting, since this project generates its Info.plist rather than checking one in.
extension Font {
    /// 5th Avenue at `size`, falling back to the system serif if the font failed to register.
    static func brandDisplay(size: CGFloat) -> Font {
        .custom(brandDisplayName, size: size)
    }

    /// PostScript name as recorded in the font's `name` table — what `Font.custom` resolves against.
    private static let brandDisplayName = "5thAvenue"
}

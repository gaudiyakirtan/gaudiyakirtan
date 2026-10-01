import SwiftUI
import UIKit

/// Named Home v6 roles. Raw values live with theme infrastructure, not in feature views.
enum HomePalette {
    static let canvas = adaptive(0xFBFAF7, 0x151515)
    static let card = adaptive(0xFFFFFF, 0x202020)
    static let mutedSurface = adaptive(0xF2F1ED, 0x292929)
    static let ink = adaptive(0x141414, 0xF2F1ED)
    static let muted = adaptive(0x6B6963, 0xAAA8A3)
    static let line = adaptive(0xE6E3DC, 0x353535)
    static let onInk = adaptive(0xFFFFFF, 0x151515)
    static let focus = color(0x101827)
    static let focusSoft = color(0x1A263C)
    static let focusText = color(0xFFFFFF)
    static let focusMuted = color(0xBDC5D0)

    static func topic(_ index: Int) -> Color {
        [color(0xC9E6DD), color(0xC9D8F2), color(0xF2D49B)][index % 3]
    }

    static func topicInk(_ index: Int) -> Color {
        [color(0x15211F), color(0x172033), color(0x3A2712)][index % 3]
    }

    static func swatch(_ index: Int) -> Color {
        [color(0x426F65), color(0xA15A3C), color(0x4E6698), color(0x806078)][index % 4]
    }

    private static func color(_ hex: UInt32) -> Color { Color(uiColor: uiColor(hex)) }

    private static func adaptive(_ light: UInt32, _ dark: UInt32) -> Color {
        Color(uiColor: UIColor { $0.userInterfaceStyle == .dark ? uiColor(dark) : uiColor(light) })
    }

    private static func uiColor(_ hex: UInt32) -> UIColor {
        UIColor(red: CGFloat((hex >> 16) & 255) / 255,
                green: CGFloat((hex >> 8) & 255) / 255,
                blue: CGFloat(hex & 255) / 255, alpha: 1)
    }
}

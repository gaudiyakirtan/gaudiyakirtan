import Foundation

/// Home v7 geometry, measured inside the navigation/player safe area.
enum HomeSpacing {
    static let xxs: CGFloat = 2
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
    static let xxxl: CGFloat = 48
}

enum HomeShape {
    static let small: CGFloat = 10
    static let medium: CGFloat = 16
    static let large: CGFloat = 22
}

struct HomeLayout {
    let availableWidth: CGFloat
    let accessibilitySize: Bool

    var gutter: CGFloat { 20 }
    var contentWidth: CGFloat { max(0, min(availableWidth - 2 * gutter, 840)) }
    var moduleGap: CGFloat { HomeSpacing.xl }

    /// Two complete covers and a next edge on phones; one wider book at large text sizes.
    /// The rail always scrolls horizontally, including on narrow phones.
    var bookWidth: CGFloat {
        if accessibilitySize { return max(0, min(240, contentWidth - HomeSpacing.xl)) }
        return max(0, min(160, (contentWidth - 2 * HomeSpacing.md - HomeSpacing.xl) / 2))
    }
}

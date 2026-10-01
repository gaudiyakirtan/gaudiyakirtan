import SwiftUI

/// Home v6 geometry, measured after navigation/safe areas and before page gutters.
enum HomeSpacing {
    static let xxs: CGFloat = 2
    static let xs: CGFloat = 4
    static let sm: CGFloat = 8
    static let md: CGFloat = 12
    static let lg: CGFloat = 16
    static let xl: CGFloat = 24
    static let xxl: CGFloat = 32
}

enum HomeShape {
    static let small: CGFloat = 10
    static let medium: CGFloat = 16
    static let large: CGFloat = 22
}

struct HomeLayout {
    let availableWidth: CGFloat
    let accessibilitySize: Bool

    var isExpanded: Bool { availableWidth >= 840 }
    var gutter: CGFloat {
        availableWidth < 600 ? HomeSpacing.lg : (isExpanded ? HomeSpacing.xxl : HomeSpacing.xl)
    }
    var contentWidth: CGFloat { max(0, min(availableWidth - 2 * gutter, 1120)) }
    var columnCount: Int {
        accessibilitySize || availableWidth < 600 ? 1 : (isExpanded ? 3 : 2)
    }
    var verticalShelves: Bool { accessibilitySize || contentWidth < 320 }
    var bookWidth: CGFloat { isExpanded ? 160 : 144 }

    var stackedModules: Bool { accessibilitySize || availableWidth < 700 }
    var moduleGap: CGFloat { stackedModules ? 32 : 28 }
    var topicColumns: Int {
        if verticalShelves { return 1 }
        return stackedModules ? 2 : (isExpanded ? 6 : 3)
    }
}

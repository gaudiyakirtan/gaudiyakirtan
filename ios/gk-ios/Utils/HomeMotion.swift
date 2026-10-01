import SwiftUI

/// Theme v5 utility motion. Navigation, sheets and the shared player keep OS/player motion.
enum HomeMotion {
    enum Token: CaseIterable {
        case instant, press, release, hover, selection, icon, panelEnter, panelExit, sectionEnter

        var duration: Double {
            switch self {
            case .instant: return 0
            case .press: return 0.08
            case .release, .hover, .panelExit: return 0.12
            case .selection, .icon: return 0.14
            case .panelEnter: return 0.18
            case .sectionEnter: return 0.22
            }
        }
    }

    static func animation(_ token: Token, reduceMotion: Bool) -> Animation? {
        guard !reduceMotion, token != .instant else { return nil }
        switch token {
        case .icon:
            return .linear(duration: token.duration)
        case .panelExit:
            return .timingCurve(0.3, 0, 1, 1, duration: token.duration)
        default:
            return .timingCurve(0.2, 0, 0, 1, duration: token.duration)
        }
    }
}

private struct HomeControlActiveKey: EnvironmentKey {
    static let defaultValue = false
}

extension EnvironmentValues {
    var homeControlActive: Bool {
        get { self[HomeControlActiveKey.self] }
        set { self[HomeControlActiveKey.self] = newValue }
    }
}

/// Native symbol replacement stays in one fixed box. Reduce Motion removes the transition,
/// including an inherited animation; fast changes interrupt SwiftUI's current replacement.
struct HomeStateSymbol: View {
    let name: String
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Image(systemName: name)
            .contentTransition(reduceMotion ? .identity : .symbolEffect(.replace))
            .animation(HomeMotion.animation(.icon, reduceMotion: reduceMotion), value: name)
            .transaction { transaction in
                if reduceMotion {
                    transaction.animation = nil
                    transaction.disablesAnimations = true
                }
            }
    }
}

struct HomeBrowseArrow: View {
    @Environment(\.homeControlActive) private var active
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Image(systemName: "arrow.right")
            .offset(x: active && !reduceMotion ? 2 : 0)
            .animation(HomeMotion.animation(.hover, reduceMotion: reduceMotion), value: active)
            .accessibilityHidden(true)
    }
}

struct HomeSearchSymbol: View {
    @Environment(\.homeControlActive) private var active
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    var body: some View {
        Image(systemName: "magnifyingglass")
            .foregroundStyle(active ? Color.primaryText : Color.secondaryText)
            .animation(HomeMotion.animation(.hover, reduceMotion: reduceMotion), value: active)
            .accessibilityHidden(true)
    }
}

/// One interaction state layer per target. Rows stay fixed; standalone controls may compress.
/// Native Button/NavigationLink owns activation and focus, without delayed commands.
struct HomeControlStyle: ButtonStyle {
    var cornerRadius: CGFloat = HomeShape.small
    var surface: Color = .backgroundOffset
    var stateLayer: Color = .primaryText
    var outlined: Bool = false
    var bordered: Bool = true
    var standalone: Bool = false
    var selected: Bool = false

    func makeBody(configuration: Configuration) -> some View {
        ControlBody(configuration: configuration, cornerRadius: cornerRadius,
                    surface: surface, stateLayer: stateLayer, outlined: outlined,
                    bordered: bordered, standalone: standalone, selected: selected)
    }

    private struct ControlBody: View {
        let configuration: ButtonStyleConfiguration
        let cornerRadius: CGFloat
        let surface: Color
        let stateLayer: Color
        let outlined: Bool
        let bordered: Bool
        let standalone: Bool
        let selected: Bool
        @Environment(\.accessibilityReduceMotion) private var reduceMotion
        @Environment(\.isFocused) private var isFocused
        @Environment(\.isEnabled) private var isEnabled
        @State private var isHovered = false

        private var shape: RoundedRectangle {
            RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
        }

        var body: some View {
            configuration.label
                .environment(\.homeControlActive, isEnabled && (isHovered || isFocused || configuration.isPressed))
                .background {
                    shape.fill(surface)
                    shape.fill(Color.highlight.opacity(selected ? 0.08 : 0))
                        .animation(HomeMotion.animation(.selection, reduceMotion: reduceMotion), value: selected)
                    shape.fill(stateLayer.opacity(!isEnabled ? 0 : (
                        configuration.isPressed || isFocused ? 0.10 : (isHovered ? 0.08 : 0)
                    )))
                    .animation(HomeMotion.animation(configuration.isPressed ? .press : .release,
                                                    reduceMotion: reduceMotion || isFocused),
                               value: configuration.isPressed)
                    .animation(HomeMotion.animation(.hover, reduceMotion: reduceMotion || isFocused),
                               value: isHovered)
                }
                .overlay {
                    if bordered { shape.strokeBorder(outlined ? Color.neutral : Color.border, lineWidth: 1) }
                }
                .scaleEffect(standalone && configuration.isPressed && !reduceMotion ? 0.98 : 1)
                .animation(HomeMotion.animation(configuration.isPressed ? .press : .release,
                                                reduceMotion: reduceMotion), value: configuration.isPressed)
                // Focus is outside the target and appears immediately; rails reserve 4 pt for it.
                .overlay {
                    if isFocused {
                        shape.strokeBorder(Color.background, lineWidth: 2).padding(-2)
                        shape.strokeBorder(Color.highlight, lineWidth: 2).padding(-4)
                    }
                }
                .contentShape(shape)
                .onHover { isHovered = $0 }
                .transaction { transaction in
                    if reduceMotion {
                        transaction.animation = nil
                        transaction.disablesAnimations = true
                    }
                }
        }
    }
}

import SwiftUI

/// Non-actionable row variant. Secondary text remains readable on neutral/20 in both palettes.
struct RowUidChip: View {
    let uid: String
    @ScaledMetric(relativeTo: .caption2) private var fontSize = 10.0

    var body: some View {
        Text(uid.uppercased())
            .font(.system(size: fontSize, weight: .medium))
            .foregroundStyle(Color.secondaryText)
            .padding(.horizontal, HomeSpacing.sm)
            .padding(.vertical, HomeSpacing.xxs)
            // UID chips keep the shared row shape, outside the general Home container scale.
            .background(Color.neutral.opacity(0.20),
                        in: RoundedRectangle(cornerRadius: 11, style: .continuous))
            .fixedSize()
    }
}

import Foundation
#if canImport(UIKit)
import UIKit
#endif

/// The app-wide haptic vocabulary (docs/theme/haptics.md).
///
/// The rule these exist to enforce: **a haptic marks a state change the user caused.** If nothing
/// changed, or the user did not cause it, the call site should not be reaching for one of these.
/// Content arriving — a list loading, audio buffering, artwork resolving — is never the user's
/// doing, and feedback there reads as a malfunction.
///
/// The cases are deliberately semantic rather than named after platform constants, so iOS and
/// Android call sites read the same and the two apps stay in step. The continuous seek-rail ladder
/// is the one specialised exception and lives in `ScrubHaptics`.
enum AppHapticEvent: Equatable {
    /// A discrete choice was committed — an index letter, a recording in the take picker.
    case selection
    /// Something started: playback began.
    case toggleOn
    /// Something stopped: playback paused.
    case toggleOff
    /// One crisp step — advancing to the next or previous recording.
    case tick
    /// A limit was reached or wrapped past: the ends of the index, the ends of the recording list.
    case boundary
    /// The action ran and produced nothing — the one genuinely informational haptic in the set.
    case warning
}

#if canImport(UIKit)
/// Plays the app's haptic vocabulary.
///
/// Generators are held and re-`prepare()`d rather than constructed per event: building a fresh
/// `UIFeedbackGenerator` at the moment you want it spins the Taptic Engine up cold, which is the
/// documented way to get late and inconsistent haptics.
///
/// Nothing here consults an app-level setting. iOS already honours the device's haptic preference
/// and silences the engine in Low Power Mode, so an in-app toggle would be a second, worse switch.
@MainActor
final class AppHaptics {
    static let shared = AppHaptics()

    private let selectionGenerator = UISelectionFeedbackGenerator()
    private let softGenerator = UIImpactFeedbackGenerator(style: .soft)
    private let lightGenerator = UIImpactFeedbackGenerator(style: .light)
    private let rigidGenerator = UIImpactFeedbackGenerator(style: .rigid)
    private let notificationGenerator = UINotificationFeedbackGenerator()

    /// Warms the generators ahead of a gesture that is about to emit a run of events.
    func prepare() {
        selectionGenerator.prepare()
        softGenerator.prepare()
        lightGenerator.prepare()
        rigidGenerator.prepare()
    }

    func play(_ event: AppHapticEvent) {
        switch event {
        case .selection:
            selectionGenerator.selectionChanged()
            selectionGenerator.prepare()
        case .toggleOn:
            softGenerator.impactOccurred(intensity: 0.6)
            softGenerator.prepare()
        case .toggleOff:
            softGenerator.impactOccurred(intensity: 0.4)
            softGenerator.prepare()
        case .tick:
            lightGenerator.impactOccurred(intensity: 0.55)
            lightGenerator.prepare()
        case .boundary:
            rigidGenerator.impactOccurred(intensity: 0.8)
            rigidGenerator.prepare()
        case .warning:
            notificationGenerator.notificationOccurred(.warning)
        }
    }
}
#endif

/// The phase a search screen is showing.
enum SearchPhase: Equatable {
    /// No query yet — the idle prompt. Not a result of anything the user searched for.
    case idle
    /// A query with hits.
    case results
    /// A query that ran and matched nothing.
    case empty
}

/// Pure arithmetic for search's feel.
///
/// Search here is incremental — there is no submit — so the meaningful event is not "a query was
/// entered" but "the query stopped matching anything". Firing on every keystroke that yields zero
/// results would rattle; firing on the *transition into* empty tells you the search ran and found
/// nothing, which is otherwise indistinguishable from it not having run.
enum SearchHaptics {
    static func phase(queryIsBlank: Bool, resultCount: Int) -> SearchPhase {
        if queryIsBlank { return .idle }
        return resultCount == 0 ? .empty : .results
    }

    static func warns(from previous: SearchPhase?, to next: SearchPhase) -> Bool {
        next == .empty && previous != .empty
    }
}

/// Pure arithmetic for the transport's feel.
enum TransportHaptics {
    /// Whether stepping `delta` places from `index` runs off an end of a `count`-length list.
    ///
    /// The transport wraps, so without this there is nothing to distinguish "advanced to the next
    /// recording" from "looped back to the first" except reading the title.
    static func wraps(index: Int, delta: Int, count: Int) -> Bool {
        guard count > 1 else { return false }
        let next = index + delta
        return next < 0 || next >= count
    }
}

/// What a move through the A–Z index earned.
enum IndexTick: Equatable {
    case none
    case selection
    case boundary
}

/// Pure arithmetic for the A–Z index's feel, kept free of UIKit so it is unit-testable.
///
/// Landing on the first or last *available* section is a boundary: without it there is no way to
/// tell by feel that you have run out of list, because the index keeps reporting letters while the
/// finger travels past the end of the real content.
enum AlphabeticalIndexHaptics {
    static func tick(
        from previous: String?,
        to next: String?,
        firstAvailable: String?,
        lastAvailable: String?
    ) -> IndexTick {
        guard let next, next != previous else { return .none }
        if next == firstAvailable || next == lastAvailable { return .boundary }
        return .selection
    }
}

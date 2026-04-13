import Foundation
import Capacitor

@objc(MediaButtonsPlugin)
@CAPPlugin(name = "MediaButtons")
public class MediaButtonsPlugin: CAPPlugin {
    /**
     * Supported button IDs that can be dispatched from native.
     */
    private let buttonVolumeUp = "media-volume-up"
    private let buttonVolumeDown = "media-volume-down"
    private let buttonTrackNext = "media-track-next"
    private let buttonTrackPrevious = "media-track-previous"

    /**
     * Dispatches a media button event to JavaScript listeners.
     *
     * Note: This plugin supports **manual dispatch only** - it does not hook into
     * iOS hardware media button events. Use the `dispatchButton` method to
     * programmatically trigger button events for testing or debugging purposes.
     */
    @objc func dispatchButton(_ call: CAPPluginCall) {
        guard let buttonId = call.getString("buttonId"), !buttonId.isEmpty else {
            call.reject("buttonId is required")
            return
        }

        guard isValidButtonId(buttonId) else {
            call.reject("Invalid buttonId: \(buttonId)")
            return
        }

        let eventData: [String: Any] = ["buttonId": buttonId]
        notifyListeners("mediaButton", data: eventData)

        call.resolve()
    }

    private func isValidButtonId(_ buttonId: String) -> Bool {
        return buttonId == buttonVolumeUp
            || buttonId == buttonVolumeDown
            || buttonId == buttonTrackNext
            || buttonId == buttonTrackPrevious
    }
}

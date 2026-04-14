import Foundation
import AVFoundation
import Capacitor
import MediaPlayer
import UIKit

@objc(MediaButtonsPlugin)
public class MediaButtonsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "MediaButtonsPlugin"
    public let jsName = "MediaButtons"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "dispatchButton", returnType: CAPPluginReturnPromise)
    ]

    private let buttonTrackNext = "media-track-next"
    private let buttonTrackPrevious = "media-track-previous"
    private var isListening = false
    private var audioEngine: AVAudioEngine?
    private var silentPlayer: AVAudioPlayerNode?
    private var nextTrackTarget: Any?
    private var previousTrackTarget: Any?

    @objc func startListening(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            do {
                try self.configureRemoteCommandsIfNeeded()
                call.resolve()
            } catch {
                call.reject("Failed to start media button listening: \(error.localizedDescription)")
            }
        }
    }

    @objc func stopListening(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            self.stopRemoteCommands()
            call.resolve()
        }
    }

    /**
     * Dispatches a media button event to JavaScript listeners.
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

        emitButton(buttonId)

        call.resolve()
    }

    private func configureRemoteCommandsIfNeeded() throws {
        if isListening {
            return
        }

        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.playback, mode: .default, options: [.mixWithOthers])
        try session.setActive(true)

        try startSilentPlaybackIfNeeded()
        UIApplication.shared.beginReceivingRemoteControlEvents()

        MPNowPlayingInfoCenter.default().nowPlayingInfo = [
            MPMediaItemPropertyTitle: "Padel Buddy",
            MPMediaItemPropertyArtist: "Match Remote",
            MPMediaItemPropertyAlbumTitle: "Score Control",
            MPNowPlayingInfoPropertyPlaybackRate: 1.0
        ]

        let commandCenter = MPRemoteCommandCenter.shared()
        commandCenter.nextTrackCommand.isEnabled = true
        commandCenter.previousTrackCommand.isEnabled = true

        nextTrackTarget = commandCenter.nextTrackCommand.addTarget { [weak self] _ in
            self?.emitButton(self?.buttonTrackNext ?? "")
            return .success
        }

        previousTrackTarget = commandCenter.previousTrackCommand.addTarget { [weak self] _ in
            self?.emitButton(self?.buttonTrackPrevious ?? "")
            return .success
        }

        isListening = true
    }

    private func stopRemoteCommands() {
        if !isListening {
            return
        }

        let commandCenter = MPRemoteCommandCenter.shared()

        if let nextTrackTarget {
            commandCenter.nextTrackCommand.removeTarget(nextTrackTarget)
        }

        if let previousTrackTarget {
            commandCenter.previousTrackCommand.removeTarget(previousTrackTarget)
        }

        nextTrackTarget = nil
        previousTrackTarget = nil
        commandCenter.nextTrackCommand.isEnabled = false
        commandCenter.previousTrackCommand.isEnabled = false

        silentPlayer?.stop()
        audioEngine?.stop()
        silentPlayer = nil
        audioEngine = nil

        MPNowPlayingInfoCenter.default().nowPlayingInfo = nil
        UIApplication.shared.endReceivingRemoteControlEvents()
        try? AVAudioSession.sharedInstance().setActive(false, options: [.notifyOthersOnDeactivation])

        isListening = false
    }

    private func startSilentPlaybackIfNeeded() throws {
        if audioEngine != nil {
            return
        }

        let engine = AVAudioEngine()
        let player = AVAudioPlayerNode()
        let sampleRate = 44_100.0
        let frameCount = AVAudioFrameCount(sampleRate / 4)

        guard let format = AVAudioFormat(standardFormatWithSampleRate: sampleRate, channels: 1),
              let buffer = AVAudioPCMBuffer(pcmFormat: format, frameCapacity: frameCount),
              let channelData = buffer.floatChannelData else {
            throw NSError(domain: "MediaButtons", code: -1, userInfo: [
                NSLocalizedDescriptionKey: "Unable to create silent audio buffer"
            ])
        }

        buffer.frameLength = frameCount

        for frameIndex in 0 ..< Int(frameCount) {
            channelData[0][frameIndex] = 0
        }

        engine.attach(player)
        engine.connect(player, to: engine.mainMixerNode, format: format)
        engine.mainMixerNode.outputVolume = 0
        engine.prepare()
        try engine.start()

        player.scheduleBuffer(buffer, at: nil, options: [.loops], completionHandler: nil)
        player.play()

        audioEngine = engine
        silentPlayer = player
    }

    private func emitButton(_ buttonId: String) {
        guard !buttonId.isEmpty else {
            return
        }

        let eventData: [String: Any] = ["buttonId": buttonId]
        notifyListeners("mediaButton", data: eventData)
    }

    private func isValidButtonId(_ buttonId: String) -> Bool {
        return buttonId == buttonTrackNext
            || buttonId == buttonTrackPrevious
    }
}

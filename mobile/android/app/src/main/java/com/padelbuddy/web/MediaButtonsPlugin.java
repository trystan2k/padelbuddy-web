package com.padelbuddy.web;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaButtons")
public class MediaButtonsPlugin extends Plugin {
    /**
     * Note: This plugin only supports manual button dispatch via dispatchButton().
     * It does NOT hook into actual Android hardware media/volume button events.
     * Hardware button interception requires more complex implementation.
     *
     * Supported button IDs that can be dispatched from native.
     */
    private static final String BUTTON_VOLUME_UP = "media-volume-up";
    private static final String BUTTON_VOLUME_DOWN = "media-volume-down";
    private static final String BUTTON_TRACK_NEXT = "media-track-next";
    private static final String BUTTON_TRACK_PREVIOUS = "media-track-previous";

    @PluginMethod
    public void dispatchButton(PluginCall call) {
        String buttonId = call.getString("buttonId");

        if (buttonId == null || buttonId.isEmpty()) {
            call.reject("buttonId is required");
            return;
        }

        // Validate button ID
        if (!isValidButtonId(buttonId)) {
            call.reject("Invalid buttonId: " + buttonId);
            return;
        }

        // Emit the event to JavaScript
        JSObject eventData = new JSObject();
        eventData.put("buttonId", buttonId);

        notifyListeners("mediaButton", eventData);

        call.resolve();
    }

    private boolean isValidButtonId(String buttonId) {
        return BUTTON_VOLUME_UP.equals(buttonId)
            || BUTTON_VOLUME_DOWN.equals(buttonId)
            || BUTTON_TRACK_NEXT.equals(buttonId)
            || BUTTON_TRACK_PREVIOUS.equals(buttonId);
    }
}

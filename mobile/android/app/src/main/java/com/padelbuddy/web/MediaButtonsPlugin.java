package com.padelbuddy.web;

import android.view.KeyEvent;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "MediaButtons")
public class MediaButtonsPlugin extends Plugin {
    private static volatile MediaButtonsPlugin activeInstance;

    /**
     * Supported button IDs that can be dispatched from native.
     */
    private static final String BUTTON_TRACK_NEXT = "media-track-next";
    private static final String BUTTON_TRACK_PREVIOUS = "media-track-previous";

    @Override
    public void load() {
        super.load();
        activeInstance = this;
    }

    @Override
    protected void handleOnDestroy() {
        if (activeInstance == this) {
            activeInstance = null;
        }

        super.handleOnDestroy();
    }

    @PluginMethod
    public void startListening(PluginCall call) {
        call.resolve();
    }

    @PluginMethod
    public void stopListening(PluginCall call) {
        call.resolve();
    }

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

        emitButton(buttonId);

        call.resolve();
    }

    public static boolean handleHardwareKey(int keyCode) {
        MediaButtonsPlugin plugin = activeInstance;

        if (plugin == null) {
            return false;
        }

        String buttonId = plugin.buttonIdFromKeyCode(keyCode);

        if (buttonId == null) {
            return false;
        }

        plugin.emitButton(buttonId);
        return true;
    }

    private void emitButton(String buttonId) {
        JSObject eventData = new JSObject();
        eventData.put("buttonId", buttonId);
        notifyListeners("mediaButton", eventData);
    }

    private String buttonIdFromKeyCode(int keyCode) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_MEDIA_NEXT:
                return BUTTON_TRACK_NEXT;
            case KeyEvent.KEYCODE_MEDIA_PREVIOUS:
                return BUTTON_TRACK_PREVIOUS;
            default:
                return null;
        }
    }

    private boolean isValidButtonId(String buttonId) {
        return BUTTON_TRACK_NEXT.equals(buttonId)
            || BUTTON_TRACK_PREVIOUS.equals(buttonId);
    }
}

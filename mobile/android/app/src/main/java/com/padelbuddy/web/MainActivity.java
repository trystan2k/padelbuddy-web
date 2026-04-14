package com.padelbuddy.web;

import android.os.Bundle;
import android.view.KeyEvent;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(LicensePlugin.class);
        registerPlugin(MediaButtonsPlugin.class);
        super.onCreate(savedInstanceState);
    }

    @Override
    public boolean dispatchKeyEvent(KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN && event.getRepeatCount() == 0) {
            if (MediaButtonsPlugin.handleHardwareKey(event.getKeyCode())) {
                return true;
            }
        }

        return super.dispatchKeyEvent(event);
    }
}

package com.padelbuddy.web;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(LicensePlugin.class);
        super.onCreate(savedInstanceState);
    }
}

package com.padelbuddy.web;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.licenseverification.LicenseVerificationClient;
import com.google.android.gms.licenseverification.LicenseVerificationData;

@CapacitorPlugin(name = "License")
public class LicensePlugin extends Plugin {
    private static final String TAG = "LicensePlugin";
    private static final int LICENSED_RESPONSE = 0x010c0000;
    private static final long GRACE_PERIOD_MS = 24 * 60 * 60 * 1000L;
    private static final String PREFS_NAME = "PadelBuddyLicense";
    private static final String KEY_LICENSE_STATUS = "license_status";
    private static final String KEY_LICENSE_TIMESTAMP = "license_timestamp";

    private static volatile int lastLicenseStatus = -1;

    public static int getLastLicenseStatus() {
        return lastLicenseStatus;
    }

    @Override
    public void load() {
        super.load();
        runLicenseCheckInBackground();
    }

    private void runLicenseCheckInBackground() {
        Context ctx = getContext();
        if (ctx == null) return;
        LicenseVerificationClient client = LicenseVerificationClient.getInstance(ctx);
        client.isAllowed(new LicenseVerificationData())
            .addOnSuccessListener(response -> {
                int code = response.getResponseCode();
                int status = (code == LICENSED_RESPONSE) ? LicenseResult.LICENSED : LicenseResult.NOT_LICENSED;
                lastLicenseStatus = status;
                saveLicenseResult(status);
                Log.d(TAG, "LVL check done: " + status);
            })
            .addOnFailureListener(e -> {
                int status = LicenseResult.ERROR;
                if (e instanceof ApiException) {
                    int sc = ((ApiException) e).getStatusCode();
                    if (sc == CommonStatusCodes.ERROR_SERVICE_DISABLED) {
                        status = LicenseResult.ERROR;
                    }
                }
                lastLicenseStatus = status;
                saveLicenseResult(status);
                Log.e(TAG, "LVL check failed", e);
            });
    }

    private void saveLicenseResult(int status) {
        Context ctx = getContext();
        if (ctx == null) return;
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putInt(KEY_LICENSE_STATUS, status)
            .putLong(KEY_LICENSE_TIMESTAMP, System.currentTimeMillis())
            .apply();
    }

    private int getCachedLicenseResult() {
        Context ctx = getContext();
        if (ctx == null) return LicenseResult.NOT_LICENSED;
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long timestamp = prefs.getLong(KEY_LICENSE_TIMESTAMP, 0);
        long now = System.currentTimeMillis();
        if (timestamp == 0 || (now - timestamp) > GRACE_PERIOD_MS) {
            return LicenseResult.NOT_LICENSED;
        }
        return prefs.getInt(KEY_LICENSE_STATUS, LicenseResult.UNKNOWN);
    }

    private boolean isGraceActive() {
        Context ctx = getContext();
        if (ctx == null) return false;
        SharedPreferences prefs = ctx.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long timestamp = prefs.getLong(KEY_LICENSE_TIMESTAMP, 0);
        return timestamp > 0 && (System.currentTimeMillis() - timestamp) <= GRACE_PERIOD_MS;
    }

    @PluginMethod
    public void checkLicense(PluginCall call) {
        int status = lastLicenseStatus;
        if (status == -1) {
            status = getCachedLicenseResult();
        }
        JSObject result = new JSObject();
        result.put("status", status);
        result.put("timestamp", System.currentTimeMillis());
        result.put("isLicensed", status == LicenseResult.LICENSED);
        result.put("isGraceActive", isGraceActive());
        call.resolve(result);
    }

    @PluginMethod
    public void getLicenseStatus(PluginCall call) {
        int status = lastLicenseStatus;
        if (status == -1) {
            status = getCachedLicenseResult();
        }
        JSObject result = new JSObject();
        result.put("status", status);
        result.put("isLicensed", status == LicenseResult.LICENSED);
        result.put("isGraceActive", isGraceActive());
        call.resolve(result);
    }
}
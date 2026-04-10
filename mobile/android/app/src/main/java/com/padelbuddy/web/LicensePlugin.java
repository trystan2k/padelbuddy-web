package com.padelbuddy.web;

import android.content.Context;
import android.content.SharedPreferences;
import android.content.pm.InstallSourceInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "License")
public class LicensePlugin extends Plugin {
    private static final String TAG = "LicensePlugin";
    private static final long GRACE_PERIOD_MS = 24 * 60 * 60 * 1000L;
    private static final String PREFS_NAME = "PadelBuddyLicense";
    private static final String KEY_LICENSE_STATUS = "license_status";
    private static final String KEY_LICENSE_TIMESTAMP = "license_timestamp";
    private static final String PLAY_STORE_PACKAGE = "com.android.vending";

    private static volatile int lastLicenseStatus = -1;

    @Override
    public void load() {
        super.load();
        refreshLicenseStatus();
    }

    private void refreshLicenseStatus() {
        Context context = getContext();

        if (context == null) {
            lastLicenseStatus = LicenseResult.ERROR;
            return;
        }

        int status = isInstalledFromPlayStore(context)
            ? LicenseResult.LICENSED
            : LicenseResult.NOT_LICENSED;

        lastLicenseStatus = status;
        saveLicenseResult(status);
        Log.d(TAG, "Install source check done: " + status);
    }

    private boolean isInstalledFromPlayStore(Context context) {
        try {
            PackageManager packageManager = context.getPackageManager();
            String installerPackage;

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                InstallSourceInfo installSourceInfo = packageManager.getInstallSourceInfo(context.getPackageName());
                installerPackage = installSourceInfo.getInstallingPackageName();
            } else {
                installerPackage = packageManager.getInstallerPackageName(context.getPackageName());
            }

            return PLAY_STORE_PACKAGE.equals(installerPackage);
        } catch (PackageManager.NameNotFoundException | IllegalArgumentException | SecurityException exception) {
            Log.e(TAG, "Failed to read install source", exception);
            return false;
        }
    }

    private void saveLicenseResult(int status) {
        Context context = getContext();

        if (context == null) {
            return;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putInt(KEY_LICENSE_STATUS, status)
            .putLong(KEY_LICENSE_TIMESTAMP, System.currentTimeMillis())
            .apply();
    }

    private int getCachedLicenseResult() {
        Context context = getContext();

        if (context == null) {
            return LicenseResult.NOT_LICENSED;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long timestamp = prefs.getLong(KEY_LICENSE_TIMESTAMP, 0);
        long now = System.currentTimeMillis();

        if (timestamp == 0 || (now - timestamp) > GRACE_PERIOD_MS) {
            return LicenseResult.NOT_LICENSED;
        }

        return prefs.getInt(KEY_LICENSE_STATUS, LicenseResult.UNKNOWN);
    }

    private boolean isGraceActive() {
        Context context = getContext();

        if (context == null) {
            return false;
        }

        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        long timestamp = prefs.getLong(KEY_LICENSE_TIMESTAMP, 0);
        return timestamp > 0 && (System.currentTimeMillis() - timestamp) <= GRACE_PERIOD_MS;
    }

    @PluginMethod
    public void checkLicense(PluginCall call) {
        refreshLicenseStatus();
        resolveStatus(call);
    }

    @PluginMethod
    public void getLicenseStatus(PluginCall call) {
        resolveStatus(call);
    }

    private void resolveStatus(PluginCall call) {
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
}

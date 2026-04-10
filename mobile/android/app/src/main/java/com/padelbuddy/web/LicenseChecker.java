package com.padelbuddy.web;

import android.content.Context;
import android.util.Log;

import com.google.android.gms.common.api.ApiException;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.licenseverification.LicenseVerificationClient;
import com.google.android.gms.licenseverification.LicenseVerificationData;

public class LicenseChecker {
    private static final String TAG = "LicenseChecker";
    private static final int LICENSED_RESPONSE = 0x010c0000;
    private static final long GRACE_PERIOD_MS = 24 * 60 * 60 * 1000L;

    private final LicenseVerificationClient licenseClient;

    public interface LicenseCallback {
        void onResult(LicenseResult result);
    }

    public LicenseChecker(Context context) {
        this.licenseClient = LicenseVerificationClient.getInstance(context);
    }

    public void check(final LicenseCallback callback) {
        Log.d(TAG, "Starting license check...");

        licenseClient.isAllowed(new LicenseVerificationData())
            .addOnSuccessListener(response -> {
                int responseCode = response.getResponseCode();
                Log.d(TAG, "License check success. Response code: " + responseCode);
                if (responseCode == LICENSED_RESPONSE) {
                    callback.onResult(new LicenseResult(LicenseResult.LICENSED));
                } else {
                    callback.onResult(new LicenseResult(LicenseResult.NOT_LICENSED));
                }
            })
            .addOnFailureListener(e -> {
                Log.e(TAG, "License check failed", e);
                int statusCode = 0;
                if (e instanceof ApiException) {
                    statusCode = ((ApiException) e).getStatusCode();
                }
                if (statusCode == CommonStatusCodes.ERROR_SERVICE_DISABLED) {
                    callback.onResult(new LicenseResult(LicenseResult.ERROR));
                } else {
                    callback.onResult(new LicenseResult(LicenseResult.ERROR));
                }
            });
    }

    public LicenseResult getLastKnownResult() {
        return new LicenseResult(LicenseResult.UNKNOWN);
    }

    public void clearCache() {
    }
}
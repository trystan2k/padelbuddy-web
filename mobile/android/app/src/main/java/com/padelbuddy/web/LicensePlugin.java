package com.padelbuddy.web;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryPurchasesParams;

import java.util.List;

@CapacitorPlugin(name = "License")
public class LicensePlugin extends Plugin implements PurchasesUpdatedListener {
    private static final String TAG = "LicensePlugin";
    private static final long GRACE_PERIOD_MS = 24 * 60 * 60 * 1000L;
    private static final String PREFS_NAME = "PadelBuddyLicense";
    private static final String KEY_LICENSE_STATUS = "license_status";
    private static final String KEY_LICENSE_TIMESTAMP = "license_timestamp";

    private static volatile int lastLicenseStatus = -1;
    private static volatile boolean hasActivePurchase = false;

    private BillingClient billingClient;

    public static int getLastLicenseStatus() {
        return lastLicenseStatus;
    }

    @Override
    public void load() {
        super.load();
        initBillingClient();
    }

    private void initBillingClient() {
        Context ctx = getContext();
        if (ctx == null) return;

        billingClient = new BillingClient.Builder(ctx)
            .setListener(this)
            .enablePendingPurchases()
            .build();

        billingClient.startConnection(new BillingClientStateListener() {
            @Override
            public void onBillingServiceDisconnected() {
                Log.d(TAG, "Billing service disconnected");
                int cached = getCachedLicenseResult();
                lastLicenseStatus = cached;
            }

            @Override
            public void onBillingSetupFinished(BillingResult result) {
                if (result.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    Log.d(TAG, "Billing client connected");
                    queryPurchases();
                } else {
                    Log.e(TAG, "Billing setup failed: " + result.getResponseCode());
                    int cached = getCachedLicenseResult();
                    lastLicenseStatus = cached;
                }
            }
        });
    }

    private void queryPurchases() {
        if (billingClient == null || !billingClient.isConnected()) return;

        billingClient.queryPurchasesAsync(
            QueryPurchasesParams.newBuilder()
                .setProductType(BillingClient.ProductType.APP)
                .build(),
            (billingResult, purchases) -> {
                if (billingResult.getResponseCode() == BillingClient.BillingResponseCode.OK) {
                    boolean purchased = purchases != null && !purchases.isEmpty();
                    hasActivePurchase = purchased;
                    lastLicenseStatus = purchased ? LicenseResult.LICENSED : LicenseResult.NOT_LICENSED;
                    saveLicenseResult(lastLicenseStatus);
                    Log.d(TAG, "Purchase check done: purchased=" + purchased + ", count=" + (purchases != null ? purchases.size() : 0));
                } else {
                    Log.e(TAG, "queryPurchases failed: " + billingResult.getResponseCode());
                    int cached = getCachedLicenseResult();
                    lastLicenseStatus = cached;
                }
            }
        );
    }

    @Override
    public void onPurchasesUpdated(BillingResult result, List<Purchase> purchases) {
        if (result.getResponseCode() == BillingClient.BillingResponseCode.OK && purchases != null) {
            boolean purchased = !purchases.isEmpty();
            hasActivePurchase = purchased;
            lastLicenseStatus = purchased ? LicenseResult.LICENSED : LicenseResult.NOT_LICENSED;
            saveLicenseResult(lastLicenseStatus);
            Log.d(TAG, "Purchase updated: " + purchased);
        }
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
        if (billingClient != null && billingClient.isConnected()) {
            queryPurchases();
        }
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
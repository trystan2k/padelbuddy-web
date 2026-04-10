package com.padelbuddy.web;

public class LicenseResult {
    public static final int LICENSED = 0;
    public static final int NOT_LICENSED = 1;
    public static final int ERROR = 2;
    public static final int UNKNOWN = 3;

    public final int status;
    public final long timestamp;

    public LicenseResult(int status) {
        this.status = status;
        this.timestamp = System.currentTimeMillis();
    }

    public boolean isLicensed() {
        return status == LICENSED;
    }

    public boolean isNotLicensed() {
        return status == NOT_LICENSED;
    }

    public boolean isError() {
        return status == ERROR;
    }

    public boolean isUnknown() {
        return status == UNKNOWN;
    }
}
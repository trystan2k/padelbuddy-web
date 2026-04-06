package com.padelbuddy.web;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import androidx.appcompat.app.AppCompatActivity;

public class LaunchActivity extends AppCompatActivity {
    private static final long LAUNCH_DELAY_MS = 450L;

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable launchMainActivity = new Runnable() {
        @Override
        public void run() {
            Intent intent = new Intent(LaunchActivity.this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            overridePendingTransition(android.R.anim.fade_in, android.R.anim.fade_out);
            finish();
        }
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_launch);
        handler.postDelayed(launchMainActivity, LAUNCH_DELAY_MS);
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacks(launchMainActivity);
        super.onDestroy();
    }
}

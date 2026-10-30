package com.pepitolabs.generator;

import android.os.Bundle;
import android.view.WindowManager;
import androidx.appcompat.app.AppCompatDelegate;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private void applySystemBarStyles() {
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        getWindow().setStatusBarColor(android.graphics.Color.TRANSPARENT);
        getWindow().setNavigationBarColor(android.graphics.Color.TRANSPARENT);

        WindowInsetsControllerCompat controller = WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.setAppearanceLightStatusBars(false); // false = jasne (białe) ikony statusu na ciemnym tle
            controller.setAppearanceLightNavigationBars(false); // false = jasne ikony nawigacji na ciemnym tle
        }
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        AppCompatDelegate.setDefaultNightMode(AppCompatDelegate.MODE_NIGHT_YES);
        super.onCreate(savedInstanceState);

        // 1. Edge-to-Edge: rysowanie za paskami systemowymi
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);

        // 2. Programowe wymuszenie BIAŁYCH ikon na pasku statusu i pasku nawigacji
        applySystemBarStyles();

        // 3. Mostek marginesów systemowych (WindowInsets -> CSS variables)
        // Przekazuje precyzyjną wysokość paska nawigacji (np. 48dp dla 3 przycisków lub 24dp dla gestów)
        ViewCompat.setOnApplyWindowInsetsListener(getWindow().getDecorView(), (v, windowInsets) -> {
            applySystemBarStyles();
            Insets insets = windowInsets.getInsets(
                WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout()
            );
            float density = getResources().getDisplayMetrics().density;
            int topDp = (int) (insets.top / density);
            int bottomDp = (int) (insets.bottom / density);

            if (getBridge() != null && getBridge().getWebView() != null) {
                getBridge().getWebView().post(() -> {
                    getBridge().getWebView().evaluateJavascript(
                        String.format(
                            "document.documentElement.style.setProperty('--safe-area-inset-top', '%dpx');" +
                            "document.documentElement.style.setProperty('--safe-area-inset-bottom', '%dpx');",
                            topDp, bottomDp
                        ),
                        null
                    );
                });
            }
            return windowInsets;
        });
    }

    @Override
    public void onResume() {
        super.onResume();
        applySystemBarStyles();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            applySystemBarStyles();
        }
    }
}

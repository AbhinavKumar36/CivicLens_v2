package com.civiclens.connect

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Color
import android.os.Bundle
import android.view.View
import android.webkit.GeolocationPermissions
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.view.WindowCompat

class WebFeatureActivity : AppCompatActivity() {

    private val PERMISSION_REQUEST_CODE = 100
    private lateinit var webView: WebView
    private lateinit var loadingBar: ProgressBar
    private var isLoginMode = false

    // Javascript interface to receive URL updates from the SPA
    inner class WebAppInterface {
        @JavascriptInterface
        fun onUrlChanged(url: String) {
            runOnUiThread {
                checkLoginRedirect(url)
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.statusBarColor     = Color.parseColor("#060e20")
        window.navigationBarColor = Color.parseColor("#060e20")
        setContentView(R.layout.activity_web_feature)

        webView    = findViewById(R.id.webView)
        loadingBar = findViewById(R.id.loadingBar)

        val url   = intent.getStringExtra("WEB_URL")   ?: "https://10.237.127.217:5173"
        val title = intent.getStringExtra("PAGE_TITLE") ?: "CivicLens"
        isLoginMode = intent.getBooleanExtra("IS_LOGIN_MODE", false)

        findViewById<TextView>(R.id.txtPageTitle).text = title
        findViewById<Button>(R.id.btnBack).setOnClickListener {
            if (webView.canGoBack()) webView.goBack() else finish()
        }

        setupWebView()
        requestPermissions()
        webView.loadUrl(url)
    }

    private fun checkLoginRedirect(url: String) {
        if (!isLoginMode) return

        val path = url.substringAfter("#/").substringBefore("?").trim()
        when {
            path == "dashboard" || path.startsWith("dashboard/") -> {
                val i = Intent(this@WebFeatureActivity, CitizenHomeActivity::class.java)
                i.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
                startActivity(i)
                finish()
            }
            path == "worker" && !path.startsWith("worker/login") -> {
                val i = Intent(this@WebFeatureActivity, WorkerHomeActivity::class.java)
                i.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
                startActivity(i)
                finish()
            }
        }
    }

    private fun setupWebView() {
        webView.settings.apply {
            javaScriptEnabled                = true
            domStorageEnabled                = true
            setGeolocationEnabled(true)
            mediaPlaybackRequiresUserGesture  = false
            mixedContentMode                 = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
            cacheMode                        = WebSettings.LOAD_NO_CACHE
        }
        webView.setBackgroundColor(Color.parseColor("#060e20"))

        // Add the JS interface
        webView.addJavascriptInterface(WebAppInterface(), "Android")

        webView.webViewClient = object : WebViewClient() {
            override fun onReceivedSslError(view: WebView?, handler: android.webkit.SslErrorHandler?, error: android.net.http.SslError?) {
                // Ignore SSL errors for local development with basic-ssl
                handler?.proceed()
            }

            override fun onPageStarted(view: WebView, url: String?, favicon: Bitmap?) {
                loadingBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView, url: String?) {
                loadingBar.visibility = View.GONE

                // Inject a script that listens for hash changes (React HashRouter)
                // and sends the updated URL back to Android via the JavascriptInterface
                view.evaluateJavascript(
                    """
                    (function() {
                        if (window.__androidListenerInjected) return;
                        window.__androidListenerInjected = true;
                        
                        // Send initial URL
                        Android.onUrlChanged(window.location.href);

                        // Listen to hash changes
                        window.addEventListener('hashchange', function() {
                            Android.onUrlChanged(window.location.href);
                        });
                        
                        // Also monkey-patch pushState/replaceState just in case
                        var originalPushState = history.pushState;
                        history.pushState = function() {
                            originalPushState.apply(this, arguments);
                            Android.onUrlChanged(window.location.href);
                        };
                        var originalReplaceState = history.replaceState;
                        history.replaceState = function() {
                            originalReplaceState.apply(this, arguments);
                            Android.onUrlChanged(window.location.href);
                        };
                    })();
                    """.trimIndent(), null
                )
            }
        }

        webView.webChromeClient = object : WebChromeClient() {
            override fun onGeolocationPermissionsShowPrompt(
                origin: String, callback: GeolocationPermissions.Callback
            ) {
                callback.invoke(origin, true, false)
            }
            override fun onPermissionRequest(request: PermissionRequest) {
                request.grant(request.resources)
            }
        }
    }

    private fun requestPermissions() {
        val needed = arrayOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        ).filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), PERMISSION_REQUEST_CODE)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (webView.canGoBack()) webView.goBack() else super.onBackPressed()
    }
}

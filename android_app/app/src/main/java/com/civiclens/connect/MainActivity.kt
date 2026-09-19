package com.civiclens.connect

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.view.WindowCompat

class MainActivity : AppCompatActivity() {

    private val BASE = "https://10.237.127.217:5173"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.statusBarColor     = Color.parseColor("#060e20")
        window.navigationBarColor = Color.parseColor("#060e20")
        setContentView(R.layout.activity_main)

        // Request permissions immediately on app start
        requestPermissions()

        // Citizen — Login
        findViewById<CardView>(R.id.cardCitizenLogin).setOnClickListener {
            openLogin("$BASE/#/login", "Citizen Login")
        }

        // Citizen — Register (same detection after registration redirects to login/dashboard)
        findViewById<CardView>(R.id.cardCitizenRegister).setOnClickListener {
            openLogin("$BASE/#/register", "Create Account")
        }

        // Worker — Login (IS_LOGIN_MODE = true → detects /worker and opens WorkerHome)
        findViewById<CardView>(R.id.cardWorkerLogin).setOnClickListener {
            openLogin("$BASE/#/worker/login", "Worker Login")
        }
    }

    private fun openLogin(url: String, title: String) {
        startActivity(
            Intent(this, WebFeatureActivity::class.java)
                .putExtra("WEB_URL", url)
                .putExtra("PAGE_TITLE", title)
                .putExtra("IS_LOGIN_MODE", true)
        )
    }

    private fun requestPermissions() {
        val needed = arrayOf(
            android.Manifest.permission.ACCESS_FINE_LOCATION,
            android.Manifest.permission.ACCESS_COARSE_LOCATION,
            android.Manifest.permission.RECORD_AUDIO,
            android.Manifest.permission.CAMERA
        ).filter {
            androidx.core.content.ContextCompat.checkSelfPermission(this, it) != android.content.pm.PackageManager.PERMISSION_GRANTED
        }
        if (needed.isNotEmpty()) {
            androidx.core.app.ActivityCompat.requestPermissions(this, needed.toTypedArray(), 100)
        }
    }
}

package com.civiclens.connect

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.view.WindowCompat

class WorkerHomeActivity : AppCompatActivity() {

    private val BASE = "https://10.237.127.217:5173"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.statusBarColor     = Color.parseColor("#060e20")
        window.navigationBarColor = Color.parseColor("#060e20")
        setContentView(R.layout.activity_worker_home)

        val name = intent.getStringExtra("USER_NAME") ?: "Worker"
        findViewById<TextView>(R.id.txtWorkerName).text = name

        card(R.id.cardWorkerDashboard) { open("$BASE/#/worker",        "Worker Dashboard") }
        card(R.id.cardWorkerMap)       { open("$BASE/#/map",           "City Map")         }
        card(R.id.cardSOS)             { open("$BASE/#/emergency",     "Emergency SOS")    }
        card(R.id.cardAI)              { open("$BASE/#/ai",            "CivicLens AI")     }
        card(R.id.cardNotifications)   { open("$BASE/#/notifications", "Notifications")    }

        // Logout
        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            android.webkit.WebStorage.getInstance().deleteAllData()
            val i = Intent(this, MainActivity::class.java)
            i.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(i)
            finish()
        }
    }

    private fun card(id: Int, action: () -> Unit) {
        findViewById<CardView>(id).setOnClickListener { action() }
    }

    private fun open(url: String, title: String) {
        startActivity(
            Intent(this, WebFeatureActivity::class.java)
                .putExtra("WEB_URL", url)
                .putExtra("PAGE_TITLE", title)
        )
    }
}

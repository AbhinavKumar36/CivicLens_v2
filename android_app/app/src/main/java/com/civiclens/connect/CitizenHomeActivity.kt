package com.civiclens.connect

import android.content.Intent
import android.graphics.Color
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.core.view.WindowCompat

class CitizenHomeActivity : AppCompatActivity() {

    private val BASE = "https://10.237.127.217:5173"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        WindowCompat.setDecorFitsSystemWindows(window, true)
        window.statusBarColor     = Color.parseColor("#060e20")
        window.navigationBarColor = Color.parseColor("#060e20")
        setContentView(R.layout.activity_citizen_home)

        // Personalise greeting
        val name = intent.getStringExtra("USER_NAME") ?: "Citizen"
        findViewById<TextView>(R.id.txtUserName).text = name
        greet()

        // ── Quick actions ────────────────────────────────────────────────
        card(R.id.cardReport)        { open("$BASE/#/report",           "Report Issue")    }
        card(R.id.cardTrack)         { open("$BASE/#/report?tab=history","My Issues")      }
        card(R.id.cardAI)            { open("$BASE/#/ai",               "CivicLens AI")    }
        card(R.id.cardMap)           { open("$BASE/#/map",              "City Map")        }

        // ── Account ──────────────────────────────────────────────────────
        card(R.id.cardDashboard)     { open("$BASE/#/dashboard",        "Dashboard")       }
        card(R.id.cardServices)      { open("$BASE/#/services",         "Services Hub")    }
        card(R.id.cardRewards)       { open("$BASE/#/rewards",          "Civic Rewards")   }
        card(R.id.cardProfile)       { open("$BASE/#/profile",          "My Profile")      }
        card(R.id.cardNotifications) { open("$BASE/#/notifications",    "Notifications")   }
        card(R.id.cardSupport)       { open("$BASE/#/support",          "Help & Support")  }

        // Logout
        findViewById<Button>(R.id.btnLogout).setOnClickListener {
            // Clear all WebView storage (localStorage where the auth token is kept)
            android.webkit.WebStorage.getInstance().deleteAllData()
            
            val i = Intent(this, MainActivity::class.java)
            i.flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NEW_TASK
            startActivity(i)
            finish()
        }
    }

    private fun greet() {
        val hour = java.util.Calendar.getInstance().get(java.util.Calendar.HOUR_OF_DAY)
        val greeting = when {
            hour < 12 -> "Good morning,"
            hour < 17 -> "Good afternoon,"
            else      -> "Good evening,"
        }
        findViewById<TextView>(R.id.txtGreeting).text = greeting
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

package com.civiclens.connect

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private val BASE_URL = "http://192.168.29.118:5173"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnCitizenProfile).setOnClickListener {
            openWebFeature("$BASE_URL/profile")
        }

        findViewById<Button>(R.id.btnWorkerDashboard).setOnClickListener {
            openWebFeature("$BASE_URL/worker")
        }

        findViewById<Button>(R.id.btnEmergencySOS).setOnClickListener {
            openWebFeature("$BASE_URL/emergency")
        }

        findViewById<Button>(R.id.btnMapDashboard).setOnClickListener {
            openWebFeature("$BASE_URL/admin")
        }
    }

    private fun openWebFeature(url: String) {
        val intent = Intent(this, WebFeatureActivity::class.java)
        intent.putExtra("WEB_URL", url)
        startActivity(intent)
    }
}

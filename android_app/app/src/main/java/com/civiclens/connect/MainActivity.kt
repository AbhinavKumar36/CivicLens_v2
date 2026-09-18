package com.civiclens.connect

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        findViewById<Button>(R.id.btnCitizen).setOnClickListener {
            startActivity(Intent(this, CitizenReportActivity::class))
        }

        findViewById<Button>(R.id.btnWorker).setOnClickListener {
            startActivity(Intent(this, WorkerDashboardActivity::class))
        }
    }
}

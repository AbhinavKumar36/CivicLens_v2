package com.civiclens.connect

import android.os.Bundle
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity

class WorkerDashboardActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_worker_dashboard)

        val txtStatus = findViewById<TextView>(R.id.txtStatus)
        txtStatus.text = "Waiting for SOS Alerts..."
        
        // In a real app, we would connect to SSE or WebSocket here.
    }
}

package com.civiclens.connect

import android.os.Bundle
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity

class CitizenReportActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_citizen_report)

        findViewById<Button>(R.id.btnRecordVoice).setOnClickListener {
            Toast.makeText(this, "Recording started...", Toast.LENGTH_SHORT).show()
            // In a real implementation, we would start MediaRecorder and send to /api/planning/demands/normalize
        }
    }
}

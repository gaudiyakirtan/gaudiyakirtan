package com.gaudiyakirtan.myapplication

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import com.gaudiyakirtan.data.SampleData
import com.gaudiyakirtan.myapplication.ui.theme.GaudiyaKirtanTheme
import com.gaudiyakirtan.navigation.AppNavigation

/**
 * Main entry point for the Gaudiya Kirtan Android application
 */
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        SampleData.init(applicationContext)
        enableEdgeToEdge()
        setContent {
            GaudiyaKirtanTheme {
                AppNavigation()
            }
        }
    }
}
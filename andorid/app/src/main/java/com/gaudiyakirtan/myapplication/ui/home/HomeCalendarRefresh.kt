package com.gaudiyakirtan.myapplication.ui.home

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.compose.runtime.*
import androidx.compose.ui.platform.LocalContext
import androidx.core.content.ContextCompat
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.lifecycle.repeatOnLifecycle
import java.time.Duration
import java.time.ZonedDateTime
import kotlinx.coroutines.delay

/** Recompute local midnight each time, including 23/25-hour DST days and timezone changes. */
internal fun millisUntilNextLocalDay(now: ZonedDateTime): Long =
    Duration.between(now, now.toLocalDate().plusDays(1).atStartOfDay(now.zone))
        .toMillis().coerceAtLeast(1L)

@Composable
internal fun HomeCalendarRefresh(viewModel: HomeViewModel) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    var clockRevision by remember { mutableIntStateOf(0) }
    DisposableEffect(context) {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) { clockRevision++ }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_DATE_CHANGED)
            addAction(Intent.ACTION_TIME_CHANGED)
            addAction(Intent.ACTION_TIMEZONE_CHANGED)
        }
        ContextCompat.registerReceiver(context, receiver, filter, ContextCompat.RECEIVER_NOT_EXPORTED)
        onDispose { context.unregisterReceiver(receiver) }
    }
    LaunchedEffect(lifecycle, clockRevision, viewModel) {
        lifecycle.repeatOnLifecycle(Lifecycle.State.RESUMED) {
            while (true) {
                // Resume and timezone changes resolve immediately. No entry or layout animation.
                val now = ZonedDateTime.now()
                viewModel.refreshCalendar(now.toLocalDate())
                delay(millisUntilNextLocalDay(now))
            }
        }
    }
}

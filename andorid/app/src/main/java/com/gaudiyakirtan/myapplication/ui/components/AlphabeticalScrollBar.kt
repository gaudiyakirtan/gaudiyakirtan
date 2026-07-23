package com.gaudiyakirtan.myapplication.ui.components

import com.gaudiyakirtan.myapplication.ui.theme.neutral

import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.ui.graphics.Color
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.hapticfeedback.HapticFeedbackType
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/**
 * AlphabeticalScrollBar component for fast scrolling through alphabetically organized lists
 * Shows a vertical list of letters A-Z on the right side of the screen
 */
@Composable
fun AlphabeticalScrollBar(
    lazyListState: LazyListState,
    sectionMap: Map<String, Int>,
    modifier: Modifier = Modifier
) {
    val alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".map { it.toString() } + "#"
    val coroutineScope = rememberCoroutineScope()
    val haptic = LocalHapticFeedback.current
    var activeIndex by remember { mutableStateOf<String?>(null) }
    var showLetterIndicator by remember { mutableStateOf(false) }

    // Clear active index after a delay
    LaunchedEffect(activeIndex) {
        if (activeIndex != null) {
            showLetterIndicator = true
            delay(800)
            showLetterIndicator = false
            delay(200)
            activeIndex = null
        }
    }
    
    Box(modifier = modifier.fillMaxHeight()) {
        // Background for the index
        Box(
            modifier = Modifier
                .fillMaxHeight()
                .width(18.dp)
                .padding(vertical = 10.dp)
                .clip(RoundedCornerShape(topStart = 8.dp, bottomStart = 8.dp, topEnd = 0.dp, bottomEnd = 0.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.2f))
                .align(Alignment.CenterEnd)
        )
        
        // Letter indicator that appears when a letter is selected
        if (showLetterIndicator && activeIndex != null) {
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(CircleShape)
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.7f))
                    .align(Alignment.Center),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = activeIndex ?: "",
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontSize = 40.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        
        // Alphabet letter column
        Column(
            modifier = Modifier
                .fillMaxHeight()
                .width(18.dp)
                .padding(vertical = 10.dp)
                .align(Alignment.CenterEnd)
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { offset ->
                            val progress = offset.y / size.height
                            val index = (progress * alphabet.size).toInt().coerceIn(0, alphabet.size - 1)
                            val letter = alphabet[index]
                            if (sectionMap.containsKey(letter) && activeIndex != letter) {
                                activeIndex = letter
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                coroutineScope.launch {
                                    sectionMap[letter]?.let { position ->
                                        lazyListState.scrollToItem(position)
                                    }
                                }
                            }
                        },
                        onDrag = { change, _ ->
                            val progress = change.position.y / size.height
                            val index = (progress * alphabet.size).toInt().coerceIn(0, alphabet.size - 1)
                            val letter = alphabet[index]
                            if (sectionMap.containsKey(letter) && activeIndex != letter) {
                                activeIndex = letter
                                haptic.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                                coroutineScope.launch {
                                    sectionMap[letter]?.let { position ->
                                        lazyListState.scrollToItem(position)
                                    }
                                }
                            }
                        }
                    )
                },
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            alphabet.forEach { letter ->
                val isActive = activeIndex == letter
                val isAvailable = sectionMap.containsKey(letter)
                
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .clip(CircleShape)
                        .background(
                            if (isActive && isAvailable) MaterialTheme.colorScheme.surfaceVariant
                            else Color.Transparent
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = letter,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = when {
                            isActive && isAvailable -> MaterialTheme.colorScheme.onSurfaceVariant
                            isAvailable -> MaterialTheme.colorScheme.neutral
                            else -> MaterialTheme.colorScheme.neutral.copy(alpha = 0.3f)
                        }
                    )
                }
            }
        }
    }
}
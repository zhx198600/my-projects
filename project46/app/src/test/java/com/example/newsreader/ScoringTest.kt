package com.example.newsreader

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

data class NewsSignal(
    val id: String,
    val isFavorite: Boolean,
    val historyCount: Int,
    val readMinutes: Double,
    val hasSubscribedKeywordHit: Boolean,
    val recencyDays: Double
)

object Scoring {
    fun scoreOf(s: NewsSignal): Double {
        var score = 0.0
        if (s.isFavorite) score += 3.0
        score += s.historyCount * 1.0
        score += s.readMinutes * 2.0
        if (s.hasSubscribedKeywordHit) score += 2.0
        score += 10.0 / (1.0 + s.recencyDays)
        return score
    }
}

class ScoringTest {
    @Test
    fun favorite_boostsScore() {
        val a = NewsSignal("a", isFavorite = true, 0, 0.0, false, 1.0)
        val b = NewsSignal("b", isFavorite = false, 0, 0.0, false, 1.0)
        assertTrue(Scoring.scoreOf(a) > Scoring.scoreOf(b))
    }

    @Test
    fun subscription_boostsScore() {
        val a = NewsSignal("a", false, 0, 0.0, true, 1.0)
        val b = NewsSignal("b", false, 0, 0.0, false, 1.0)
        assertTrue(Scoring.scoreOf(a) > Scoring.scoreOf(b))
    }

    @Test
    fun recency_matters() {
        val recent = NewsSignal("a", false, 0, 0.0, false, 0.1)
        val old = NewsSignal("b", false, 0, 0.0, false, 10.0)
        assertTrue(Scoring.scoreOf(recent) > Scoring.scoreOf(old))
    }

    @Test
    fun score_deterministic() {
        val s = NewsSignal("x", true, 2, 3.5, true, 0.5)
        assertEquals(Scoring.scoreOf(s), Scoring.scoreOf(s), 0.0001)
    }
}
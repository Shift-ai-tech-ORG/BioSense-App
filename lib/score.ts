/**
 * Health Score engine — ported and adapted from JARVIS getSuperhermanScore()
 *
 * Base weights (pillars sum to 100):
 *   sleep 30 | recovery 25 | stress 20 | activity 15 | biomarkers 10
 *
 * Weights personalise over time — the system adjusts them based on what
 * most strongly correlates with the user's own check-in scores.
 */

export const DEFAULT_WEIGHTS = {
  sleep: 0.30,
  recovery: 0.25,
  stress: 0.20,
  activity: 0.15,
  biomarkers: 0.10,
}

interface CheckinData {
  energy: number     // 1-10
  sleep: number      // 1-10
  mood: number       // 1-10
  stress: number     // 1-10 (lower is better in checkin, so invert)
}

interface WearableData {
  hrv?: number        // ms, higher is better
  rhr?: number        // bpm, lower is better (ideal ~50-60)
  steps?: number      // daily steps
  activeMinutes?: number
  sleepScore?: number // 0-100 from device
}

interface BloodData {
  t1Count: number     // normal markers
  t2Count: number     // moderate
  t3Count: number     // red flag
}

interface ScoreInput {
  checkin?: CheckinData
  wearable?: WearableData
  blood?: BloodData
  personalWeights?: Record<string, number>
}

interface ScoreBreakdown {
  sleep: number
  recovery: number
  stress: number
  activity: number
  biomarkers: number
}

export function calcHealthScore(input: ScoreInput): {
  score: number
  breakdown: ScoreBreakdown
} {
  const weights = {
    ...DEFAULT_WEIGHTS,
    ...(input.personalWeights ?? {}),
  }

  // --- Sleep (0-100) ---
  let sleepScore = 50 // default when no data
  if (input.wearable?.sleepScore != null) {
    sleepScore = input.wearable.sleepScore
  } else if (input.checkin?.sleep != null) {
    sleepScore = (input.checkin.sleep / 10) * 100
  }

  // --- Recovery (0-100) ---
  let recoveryScore = 50
  if (input.wearable?.hrv != null) {
    // HRV: map 20ms (poor) → 0, 100ms (excellent) → 100
    recoveryScore = Math.min(100, Math.max(0, ((input.wearable.hrv - 20) / 80) * 100))
  } else if (input.checkin?.energy != null) {
    recoveryScore = (input.checkin.energy / 10) * 100
  }

  // RHR nudge: if elevated (>80), pull recovery score down
  if (input.wearable?.rhr && input.wearable.rhr > 80) {
    recoveryScore *= 0.85
  }

  // --- Stress (0-100, inverted from check-in — lower stress = higher score) ---
  let stressScore = 50
  if (input.checkin?.stress != null) {
    stressScore = ((10 - input.checkin.stress) / 10) * 100
  }

  // --- Activity (0-100) ---
  let activityScore = 50
  if (input.wearable?.steps != null) {
    // 10,000 steps = 100, scale linearly from 0
    activityScore = Math.min(100, (input.wearable.steps / 10000) * 100)
  } else if (input.wearable?.activeMinutes != null) {
    // 60 active mins = 100
    activityScore = Math.min(100, (input.wearable.activeMinutes / 60) * 100)
  }

  // --- Biomarkers (0-100) ---
  let biomarkersScore = 75 // default (no blood uploaded yet)
  if (input.blood) {
    const total = input.blood.t1Count + input.blood.t2Count + input.blood.t3Count
    if (total > 0) {
      const goodPct = input.blood.t1Count / total
      const modPct = input.blood.t2Count / total
      biomarkersScore = goodPct * 100 + modPct * 50
    }
  }

  const breakdown: ScoreBreakdown = {
    sleep: Math.round(sleepScore),
    recovery: Math.round(recoveryScore),
    stress: Math.round(stressScore),
    activity: Math.round(activityScore),
    biomarkers: Math.round(biomarkersScore),
  }

  const score =
    sleepScore * weights.sleep +
    recoveryScore * weights.recovery +
    stressScore * weights.stress +
    activityScore * weights.activity +
    biomarkersScore * weights.biomarkers

  return {
    score: Math.round(Math.min(100, Math.max(0, score))),
    breakdown,
  }
}

export function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 85) return { label: 'Excellent', color: '#22C55E' }
  if (score >= 70) return { label: 'Good',      color: '#3B82F6' }
  if (score >= 55) return { label: 'Fair',      color: '#F59E0B' }
  if (score >= 40) return { label: 'Low',       color: '#EF4444' }
  return { label: 'Critical', color: '#DC2626' }
}

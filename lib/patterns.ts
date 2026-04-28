/**
 * Pattern detection engine — ported from JARVIS correlations.js runLagAnalysis()
 * Finds lag correlations between behaviours (sleep, stress) and outcomes (energy, HRV)
 */

export interface CheckinPoint {
  date: string
  energy: number
  sleep: number
  mood: number
  stress: number
}

export interface DetectedPattern {
  type: string
  description: string
  confidence: 'HIGH' | 'MEDIUM' | 'LOW'
  scoreImpact?: number
  relatedActions?: string[]
}

/**
 * Pearson correlation coefficient between two numeric arrays
 */
function pearson(x: number[], y: number[]): number {
  const n = Math.min(x.length, y.length)
  if (n < 3) return 0

  const meanX = x.reduce((s, v) => s + v, 0) / n
  const meanY = y.reduce((s, v) => s + v, 0) / n

  let num = 0
  let denomX = 0
  let denomY = 0

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX
    const dy = y[i] - meanY
    num += dx * dy
    denomX += dx * dx
    denomY += dy * dy
  }

  const denom = Math.sqrt(denomX * denomY)
  return denom === 0 ? 0 : num / denom
}

function confidenceFromR(r: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  const abs = Math.abs(r)
  if (abs >= 0.7) return 'HIGH'
  if (abs >= 0.45) return 'MEDIUM'
  return 'LOW'
}

/**
 * Lag analysis: does X today predict Y tomorrow/2-days?
 */
export function runLagAnalysis(checkins: CheckinPoint[]): DetectedPattern[] {
  if (checkins.length < 7) return []

  const sorted = [...checkins].sort((a, b) => a.date.localeCompare(b.date))
  const patterns: DetectedPattern[] = []

  const fields: (keyof CheckinPoint)[] = ['energy', 'sleep', 'mood', 'stress']
  const outcomes: (keyof CheckinPoint)[] = ['energy', 'mood']
  const lags = [1, 2]

  for (const predictor of fields) {
    for (const outcome of outcomes) {
      if (predictor === outcome) continue

      for (const lag of lags) {
        const x = sorted.slice(0, -lag).map((c) => c[predictor] as number)
        const y = sorted.slice(lag).map((c) => c[outcome] as number)

        const r = pearson(x, y)
        if (Math.abs(r) < 0.45) continue

        const conf = confidenceFromR(r)
        const direction = r > 0 ? 'higher' : 'lower'
        const lagLabel = lag === 1 ? 'the next day' : '2 days later'
        const predictorLabel = String(predictor)
        const outcomeLabel = String(outcome)

        let desc = ''
        let actions: string[] = []

        if (predictor === 'sleep' && outcome === 'energy') {
          desc =
            r > 0
              ? `Better sleep quality may be associated with ${direction} energy ${lagLabel}`
              : `Lower sleep scores may be associated with lower energy ${lagLabel}`
          actions = ['Prioritise 7-8 hours of sleep', 'Maintain a consistent sleep schedule']
        } else if (predictor === 'stress' && outcome === 'mood') {
          desc = `Higher stress on a given day may be associated with ${direction} mood ${lagLabel}`
          actions = ['Explore stress reduction techniques', 'Consider evening wind-down routine']
        } else {
          desc = `${predictorLabel} may be associated with ${direction} ${outcomeLabel} ${lagLabel} (r=${r.toFixed(2)})`
        }

        patterns.push({
          type: `${predictor}_${outcome}_lag${lag}`,
          description: desc,
          confidence: conf,
          scoreImpact: Math.round(Math.abs(r) * 10),
          relatedActions: actions,
        })
      }
    }
  }

  return patterns.slice(0, 10)
}

/**
 * Get weekly stats for report generation
 */
export function getWeeklyStats(checkins: CheckinPoint[]) {
  if (checkins.length === 0) return null

  const avg = (arr: number[]) => arr.reduce((s, v) => s + v, 0) / arr.length

  const energies = checkins.map((c) => c.energy)
  const sleeps = checkins.map((c) => c.sleep)
  const moods = checkins.map((c) => c.mood)
  const stresses = checkins.map((c) => c.stress)

  const best = checkins.reduce((best, c) => {
    const score = c.energy + c.sleep + c.mood + (11 - c.stress)
    const bestScore = best.energy + best.sleep + best.mood + (11 - best.stress)
    return score > bestScore ? c : best
  })

  const worst = checkins.reduce((worst, c) => {
    const score = c.energy + c.sleep + c.mood + (11 - c.stress)
    const worstScore = worst.energy + worst.sleep + worst.mood + (11 - worst.stress)
    return score < worstScore ? c : worst
  })

  return {
    avgEnergy: avg(energies),
    avgSleep: avg(sleeps),
    avgMood: avg(moods),
    avgStress: avg(stresses),
    bestDay: best.date,
    worstDay: worst.date,
    checkinsCompleted: checkins.length,
  }
}

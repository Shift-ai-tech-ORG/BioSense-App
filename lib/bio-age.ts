/**
 * Biological age calculation — ported from JARVIS jarvis.js calcBiologicalAge()
 * Uses VO2max, HRV, RHR, sleep quality weighted average
 */

interface BioAgeInput {
  calendarAge: number
  hrv?: number          // ms (higher = younger)
  rhr?: number          // bpm (lower = younger)
  vo2max?: number       // ml/kg/min (higher = younger)
  bodyFatPct?: number   // % (lower = younger in most contexts)
  sleepAvg?: number     // 1-10 avg from check-ins
  energyAvg?: number    // 1-10 avg from check-ins
}

interface BioAgeResult {
  bioAge: number
  delta: number       // calendarAge - bioAge (positive = biologically younger)
  drivers: {
    positive: string[]
    negative: string[]
  }
}

export function calcBiologicalAge(input: BioAgeInput): BioAgeResult {
  const { calendarAge } = input
  let ageAdjustment = 0
  const positive: string[] = []
  const negative: string[] = []

  // HRV contribution (weight: 30%)
  if (input.hrv != null) {
    // Population median by age: roughly age/3 + 20 ms
    const expectedHrv = Math.max(20, calendarAge / 3 + 20)
    const diff = input.hrv - expectedHrv
    const adjustment = -(diff / expectedHrv) * 5 // ±5 years max
    ageAdjustment += adjustment * 0.30
    if (diff > 5) positive.push(`HRV ${input.hrv.toFixed(0)}ms — above expected`)
    else if (diff < -5) negative.push(`HRV ${input.hrv.toFixed(0)}ms — below expected`)
  }

  // RHR contribution (weight: 25%)
  if (input.rhr != null) {
    const idealRhr = 55
    const diff = input.rhr - idealRhr // positive = worse
    const adjustment = (diff / idealRhr) * 4 // ±4 years max
    ageAdjustment += adjustment * 0.25
    if (diff < -5) positive.push(`Resting HR ${input.rhr}bpm — excellent`)
    else if (diff > 15) negative.push(`Resting HR ${input.rhr}bpm — elevated`)
  }

  // VO2max contribution (weight: 30%)
  if (input.vo2max != null) {
    // Age-adjusted VO2max norms for males (rough average)
    const expectedVo2 = Math.max(25, 55 - calendarAge * 0.3)
    const diff = input.vo2max - expectedVo2
    const adjustment = -(diff / expectedVo2) * 6 // ±6 years max
    ageAdjustment += adjustment * 0.30
    if (diff > 5) positive.push(`VO2max ${input.vo2max.toFixed(0)} ml/kg/min — above average`)
    else if (diff < -5) negative.push(`VO2max ${input.vo2max.toFixed(0)} ml/kg/min — below average`)
  }

  // Sleep quality contribution (weight: 15%)
  if (input.sleepAvg != null) {
    const diff = input.sleepAvg - 7 // ideal 7/10
    const adjustment = -(diff / 7) * 2 // ±2 years
    ageAdjustment += adjustment * 0.15
    if (diff > 1) positive.push(`Sleep quality ${input.sleepAvg.toFixed(1)}/10 — good`)
    else if (diff < -2) negative.push(`Sleep quality ${input.sleepAvg.toFixed(1)}/10 — needs attention`)
  }

  const bioAge = Math.max(18, Math.round(calendarAge + ageAdjustment))
  const delta = calendarAge - bioAge

  return { bioAge, delta, drivers: { positive, negative } }
}

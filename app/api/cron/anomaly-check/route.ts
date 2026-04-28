/**
 * Anomaly check — ported from JARVIS checkAnomalies()
 * Smart notification triggers: energy ≤3 for 3 days, sleep ≤3 for 3 days, positive trends
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const threeDaysAgo = new Date()
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  const users = await prisma.user.findMany({
    where: { onboardingDone: true, hasConsented: true },
    select: { id: true },
  })

  const triggered: string[] = []

  for (const user of users) {
    const recent = await prisma.dailyCheckin.findMany({
      where: { userId: user.id, date: { gte: threeDaysAgo } },
      orderBy: { date: 'desc' },
      take: 3,
    })

    if (recent.length < 3) continue

    const avgEnergy = recent.reduce((s, c) => s + c.energy, 0) / recent.length
    const avgSleep = recent.reduce((s, c) => s + c.sleep, 0) / recent.length
    const allEnergyLow = recent.every((c) => c.energy <= 3)
    const allSleepLow = recent.every((c) => c.sleep <= 3)

    // Check for previous week's avg to detect positive trends
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const prevWeek = await prisma.dailyCheckin.findMany({
      where: { userId: user.id, date: { gte: weekAgo, lt: threeDaysAgo } },
    })
    const prevAvgRecovery = prevWeek.length
      ? prevWeek.reduce((s, c) => s + (c.energy + c.sleep) / 2, 0) / prevWeek.length
      : null

    let trigger = ''
    let message = ''

    if (allEnergyLow) {
      trigger = 'energy_low_3d'
      message = 'Energy has been trending down for 3 days. Want a quick plan?'
    } else if (allSleepLow) {
      trigger = 'sleep_low_3d'
      message = "Sleep quality has been low for 3 days. Let's look at what might be affecting it."
    } else if (
      prevAvgRecovery != null &&
      (recent[0].energy + recent[0].sleep) / 2 > prevAvgRecovery + 1.5
    ) {
      trigger = 'positive_trend'
      message = 'Strong week — your recovery has improved. See what worked.'
    }

    if (trigger) {
      // Log notification (actual delivery via Resend/Push in Phase 6)
      await prisma.notificationLog.create({
        data: { userId: user.id, trigger, message, channel: 'push' },
      })
      triggered.push(`${user.id}:${trigger}`)
    }
  }

  return NextResponse.json({ triggered, checked: users.length })
}

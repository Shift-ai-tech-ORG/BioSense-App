/**
 * CRON endpoint — called every Sunday 7am via Vercel Cron
 * Generates weekly reports for all active users with enough check-in data
 */
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateWeeklyReport } from '@/lib/reports'

export async function POST(req: NextRequest) {
  // Verify cron secret
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const year = now.getFullYear()
  const week = getISOWeek(now)
  const period = `${year}-W${String(week).padStart(2, '0')}`

  const users = await prisma.user.findMany({
    where: { onboardingDone: true, hasConsented: true },
    select: { id: true },
  })

  let generated = 0
  const errors: string[] = []

  for (const user of users) {
    try {
      const report = await generateWeeklyReport(user.id, period)
      if (report) generated++
    } catch (err) {
      errors.push(user.id)
      console.error(`Weekly report failed for ${user.id}:`, err)
    }
  }

  return NextResponse.json({ generated, errors, period })
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7))
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateMonthlyReport } from '@/lib/reports'

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cron-secret')
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const users = await prisma.user.findMany({
    where: { onboardingDone: true, hasConsented: true },
    select: { id: true },
  })

  let generated = 0
  const errors: string[] = []

  for (const user of users) {
    try {
      const report = await generateMonthlyReport(user.id, period)
      if (report) generated++
    } catch (err) {
      errors.push(user.id)
      console.error(`Monthly report failed for ${user.id}:`, err)
    }
  }

  return NextResponse.json({ generated, errors, period })
}

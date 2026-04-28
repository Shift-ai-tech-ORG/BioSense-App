import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { DashboardClient } from './dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [user, latestCheckin, latestScore, checkinStreak, recentCheckins, latestBlood, wearables] =
    await Promise.all([
      prisma.user.findUnique({ where: { id: session.user.id } }),
      prisma.dailyCheckin.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
      }),
      prisma.healthScore.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
      }),
      // Streak: count consecutive days ending today
      prisma.dailyCheckin.count({
        where: { userId: session.user.id },
      }),
      prisma.dailyCheckin.findMany({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
        take: 7,
      }),
      prisma.bloodResult.findFirst({
        where: { userId: session.user.id },
        orderBy: { drawDate: 'desc' },
      }),
      prisma.wearableSync.findMany({
        where: { userId: session.user.id },
      }),
    ])

  const today = new Date().toISOString().split('T')[0]
  const hasCheckinToday = latestCheckin
    ? new Date(latestCheckin.date).toISOString().split('T')[0] === today
    : false

  return (
    <DashboardClient
      user={{
        name: user?.name ?? '',
        goalType: user?.goalType ?? null,
        goalText: user?.goalText ?? null,
      }}
      healthScore={latestScore?.score ?? null}
      scoreBreakdown={
        (latestScore?.breakdown as Record<string, number> | null) ?? null
      }
      hasCheckinToday={hasCheckinToday}
      checkinCount={checkinStreak}
      recentCheckins={recentCheckins.map((c) => ({
        date: c.date.toISOString().split('T')[0],
        energy: c.energy,
        sleep: c.sleep,
        mood: c.mood,
        stress: c.stress,
      }))}
      hasBlood={!!latestBlood}
      connectedWearables={wearables.map((w) => w.provider)}
    />
  )
}

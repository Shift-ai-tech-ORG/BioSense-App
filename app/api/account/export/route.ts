import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [user, checkins, healthScores, bloodResults, patterns, chatMessages, consents] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
          name: true,
          email: true,
          age: true,
          goalType: true,
          goalText: true,
          allergies: true,
          conditions: true,
          lifestyle: true,
          createdAt: true,
        },
      }),
      prisma.dailyCheckin.findMany({ where: { userId: session.user.id } }),
      prisma.healthScore.findMany({ where: { userId: session.user.id } }),
      prisma.bloodResult.findMany({
        where: { userId: session.user.id },
        select: { drawDate: true, markers: true, aiSummary: true },
      }),
      prisma.pattern.findMany({ where: { userId: session.user.id } }),
      prisma.chatMessage.findMany({ where: { userId: session.user.id } }),
      prisma.consent.findMany({ where: { userId: session.user.id } }),
    ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    user,
    checkins,
    healthScores,
    bloodResults,
    patterns,
    chatMessages,
    consents,
  }

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="biosense-data-${session.user.id}.json"`,
    },
  })
}

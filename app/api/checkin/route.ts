import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calcHealthScore } from '@/lib/score'
import { z } from 'zod'

const schema = z.object({
  energy: z.number().int().min(1).max(10),
  sleep: z.number().int().min(1).max(10),
  mood: z.number().int().min(1).max(10),
  stress: z.number().int().min(1).max(10),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const checkin = await prisma.dailyCheckin.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      create: { userId: session.user.id, date: today, ...data },
      update: data,
    })

    // Recalculate health score from check-in data
    const { score, breakdown } = calcHealthScore({
      checkin: {
        energy: data.energy,
        sleep: data.sleep,
        mood: data.mood,
        stress: data.stress,
      },
    })

    // Get existing weights if any
    const existingScore = await prisma.healthScore.findFirst({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    })

    await prisma.healthScore.upsert({
      where: { userId_date: { userId: session.user.id, date: today } },
      create: {
        userId: session.user.id,
        date: today,
        score,
        breakdown: breakdown as unknown as import('@prisma/client').Prisma.InputJsonValue,
        personalWeights: (existingScore?.personalWeights ?? null) as import('@prisma/client').Prisma.NullableJsonNullValueInput | import('@prisma/client').Prisma.InputJsonValue,
      },
      update: {
        score,
        breakdown: breakdown as unknown as import('@prisma/client').Prisma.InputJsonValue,
      },
    })

    return NextResponse.json({ success: true, checkin, score })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 })
    }
    console.error('Checkin error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const limit = parseInt(searchParams.get('limit') ?? '30')

  const checkins = await prisma.dailyCheckin.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: limit,
  })

  return NextResponse.json(checkins)
}

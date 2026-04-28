import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const checkin = await prisma.dailyCheckin.findUnique({
    where: { userId_date: { userId: session.user.id, date: today } },
  })

  return NextResponse.json({ done: !!checkin, checkin })
}

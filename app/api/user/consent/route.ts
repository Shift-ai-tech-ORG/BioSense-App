import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  await prisma.$transaction([
    prisma.consent.create({
      data: {
        userId: session.user.id,
        tcVersion: '1.0',
        privacyVersion: '1.0',
        consentVersion: '1.0',
        dataConsentFlag: true,
        ipAddress: ip,
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { hasConsented: true },
    }),
  ])

  return NextResponse.json({ success: true })
}

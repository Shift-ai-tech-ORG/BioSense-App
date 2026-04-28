import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  goalType: z.enum(['PERFORMANCE', 'HEALTH', 'BODY_COMP', 'WELLBEING']),
  goalText: z.string().min(1),
  goalDeadline: z.string().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  lifestyle: z.string().optional(),
  preferences: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        goalType: data.goalType,
        goalText: data.goalText,
        goalDeadline: data.goalDeadline ? new Date(data.goalDeadline) : null,
        allergies: data.allergies ?? [],
        conditions: data.conditions ?? [],
        lifestyle: data.lifestyle ?? '',
        preferences: data.preferences ?? [],
        onboardingDone: true,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 })
    }
    console.error('Onboarding error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

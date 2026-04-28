import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().min(18).max(120).nullable().optional(),
  goalType: z.enum(['PERFORMANCE', 'HEALTH', 'BODY_COMP', 'WELLBEING']).optional(),
  goalText: z.string().optional(),
  goalDeadline: z.string().nullable().optional(),
  allergies: z.array(z.string()).optional(),
  conditions: z.array(z.string()).optional(),
  lifestyle: z.string().optional(),
})

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const data = schema.parse(body)

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...data,
        goalDeadline: data.goalDeadline ? new Date(data.goalDeadline) : data.goalDeadline,
      },
    })

    return NextResponse.json({ success: true, name: updated.name })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      age: true,
      goalType: true,
      goalText: true,
      goalDeadline: true,
      allergies: true,
      conditions: true,
      lifestyle: true,
      onboardingDone: true,
    },
  })

  return NextResponse.json(user)
}

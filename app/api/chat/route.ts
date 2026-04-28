/**
 * Ask Anything — ported from JARVIS /api/chat
 * Full context: profile + 30-day check-ins + latest blood + patterns
 * All output constrained by App 5 language rules via BIOSENSE_SYSTEM_PROMPT
 */
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callClaude, BIOSENSE_SYSTEM_PROMPT } from '@/lib/claude'
import { z } from 'zod'

const schema = z.object({
  message: z.string().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), content: z.string() }))
    .max(20)
    .optional(),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const { message, history } = schema.parse(body)

    // Gather user context
    const [user, recentCheckins, latestScore, latestBlood, patterns, chatHistory] =
      await Promise.all([
        prisma.user.findUnique({ where: { id: session.user.id } }),
        prisma.dailyCheckin.findMany({
          where: { userId: session.user.id },
          orderBy: { date: 'desc' },
          take: 30,
        }),
        prisma.healthScore.findFirst({
          where: { userId: session.user.id },
          orderBy: { date: 'desc' },
        }),
        prisma.bloodResult.findFirst({
          where: { userId: session.user.id },
          orderBy: { drawDate: 'desc' },
        }),
        prisma.pattern.findMany({
          where: { userId: session.user.id },
          orderBy: { discoveredAt: 'desc' },
          take: 5,
        }),
        prisma.chatMessage.findMany({
          where: { userId: session.user.id },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),
      ])

    // Build context string
    const checkinSummary =
      recentCheckins.length > 0
        ? recentCheckins
            .slice(0, 7)
            .map(
              (c) =>
                `${new Date(c.date).toISOString().split('T')[0]}: energy=${c.energy} sleep=${c.sleep} mood=${c.mood} stress=${c.stress}`,
            )
            .join('\n')
        : 'No check-ins yet'

    const bloodSummary = latestBlood
      ? `Latest blood (${new Date(latestBlood.drawDate).toISOString().split('T')[0]}): ${latestBlood.aiSummary ?? 'No summary available'}`
      : 'No blood results uploaded'

    const patternSummary =
      patterns.length > 0
        ? patterns.map((p) => `- ${p.description} (${p.confidence} confidence)`).join('\n')
        : 'No patterns detected yet'

    const previousQuestions =
      chatHistory.length > 0
        ? chatHistory
            .filter((m) => m.role === 'user')
            .slice(0, 3)
            .map((m) => `"${m.content.slice(0, 100)}"`)
            .join(', ')
        : null

    const contextBlock = `
USER PROFILE:
- Name: ${user?.name ?? 'Unknown'}
- Goal: ${user?.goalType ?? 'Not set'} — "${user?.goalText ?? ''}"
- Conditions: ${user?.conditions?.join(', ') || 'None stated'}
- Lifestyle: ${user?.lifestyle || 'Not specified'}

CURRENT HEALTH SCORE: ${latestScore?.score ?? 'Not calculated'}

LAST 7 CHECK-INS (energy/sleep/mood/stress out of 10):
${checkinSummary}

BLOOD RESULTS:
${bloodSummary}

PATTERNS:
${patternSummary}
${previousQuestions ? `\nPREVIOUS QUESTIONS: ${previousQuestions}` : ''}
`.trim()

    const systemPrompt = `${BIOSENSE_SYSTEM_PROMPT}

--- USER CONTEXT ---
${contextBlock}
--- END CONTEXT ---

Use the above context to personalise your educational response. Reference specific data points where relevant. Always follow the mandatory response structure.`

    // Build conversation
    const conversationHistory =
      history?.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })) ?? []

    const userContent =
      conversationHistory.length > 0
        ? `[Previous conversation context provided]\n\n${message}`
        : message

    const reply = await callClaude(systemPrompt, userContent, 2000)

    // Persist messages
    await prisma.chatMessage.createMany({
      data: [
        { userId: session.user.id, role: 'user', content: message },
        { userId: session.user.id, role: 'assistant', content: reply },
      ],
    })

    return NextResponse.json({ reply })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.issues[0]?.message ?? "Validation error" }, { status: 400 })
    }
    console.error('Chat error:', err)
    return NextResponse.json({ error: 'Failed to get response' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { callClaude, BLOOD_ANALYSIS_PROMPT } from '@/lib/claude'

// Dynamically import to avoid edge runtime issues
async function parsePdf(buffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require('pdf-parse')
  const result = await pdfParse(buffer)
  return result.text
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const drawDate = formData.get('drawDate') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No PDF file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 10MB' }, { status: 400 })
    }

    // Extract text from PDF
    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfText = await parsePdf(buffer)

    if (!pdfText || pdfText.trim().length < 50) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Please ensure the file is not scanned/image-only.' },
        { status: 422 },
      )
    }

    // Upload to R2 if configured
    let pdfUrl: string | null = null
    if (process.env.R2_ACCOUNT_ID) {
      const { uploadPdf } = await import('@/lib/storage')
      const key = await uploadPdf(session.user.id, buffer, file.name)
      pdfUrl = key
    }

    // Claude blood analysis
    const aiResponse = await callClaude(
      BLOOD_ANALYSIS_PROMPT,
      `Analyse this blood test result and extract all biomarkers:\n\n${pdfText.slice(0, 8000)}`,
      2000,
    )

    let markers: object[] = []
    let aiSummary = ''
    let t1Count = 0
    let t2Count = 0
    let t3Count = 0

    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        markers = parsed.markers ?? []
        aiSummary = parsed.summary ?? ''
        t1Count = parsed.t1Count ?? 0
        t2Count = parsed.t2Count ?? 0
        t3Count = parsed.t3Count ?? 0
      }
    } catch {
      aiSummary = aiResponse
    }

    // Store in DB
    const blood = await prisma.bloodResult.create({
      data: {
        userId: session.user.id,
        drawDate: drawDate ? new Date(drawDate) : new Date(),
        markers,
        pdfUrl,
        aiSummary,
      },
    })

    // Recalculate health score with new blood data
    if (markers.length > 0) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const latestCheckin = await prisma.dailyCheckin.findFirst({
        where: { userId: session.user.id },
        orderBy: { date: 'desc' },
      })

      const { calcHealthScore } = await import('@/lib/score')
      const { score, breakdown } = calcHealthScore({
        checkin: latestCheckin
          ? {
              energy: latestCheckin.energy,
              sleep: latestCheckin.sleep,
              mood: latestCheckin.mood,
              stress: latestCheckin.stress,
            }
          : undefined,
        blood: { t1Count, t2Count, t3Count },
      })

      await prisma.healthScore.upsert({
        where: { userId_date: { userId: session.user.id, date: today } },
        create: {
          userId: session.user.id,
          date: today,
          score,
          breakdown: breakdown as unknown as import('@prisma/client').Prisma.InputJsonValue,
        },
        update: {
          score,
          breakdown: breakdown as unknown as import('@prisma/client').Prisma.InputJsonValue,
        },
      })
    }

    return NextResponse.json({
      success: true,
      bloodId: blood.id,
      markerCount: markers.length,
      t1Count,
      t2Count,
      t3Count,
      aiSummary,
    })
  } catch (err) {
    console.error('Blood upload error:', err)
    return NextResponse.json({ error: 'Failed to process blood results' }, { status: 500 })
  }
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const results = await prisma.bloodResult.findMany({
    where: { userId: session.user.id },
    orderBy: { drawDate: 'desc' },
    select: {
      id: true,
      drawDate: true,
      markers: true,
      aiSummary: true,
      createdAt: true,
    },
  })

  return NextResponse.json(results)
}

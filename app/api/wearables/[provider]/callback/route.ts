import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params
  const { searchParams } = new URL(req.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/wearables?error=${encodeURIComponent(error)}`, req.url),
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL('/wearables?error=missing_params', req.url))
  }

  try {
    const { userId } = JSON.parse(Buffer.from(state, 'base64url').toString())

    // Exchange code for tokens
    const TOKEN_URLS: Record<string, string> = {
      oura: 'https://api.ouraring.com/oauth/token',
      whoop: 'https://api.prod.whoop.com/oauth/oauth2/token',
      garmin: 'https://connectapi.garmin.com/oauth-service/oauth/token',
    }

    const CLIENT_IDS: Record<string, string> = {
      oura: process.env.OURA_CLIENT_ID ?? '',
      whoop: process.env.WHOOP_CLIENT_ID ?? '',
      garmin: process.env.GARMIN_CONSUMER_KEY ?? '',
    }

    const CLIENT_SECRETS: Record<string, string> = {
      oura: process.env.OURA_CLIENT_SECRET ?? '',
      whoop: process.env.WHOOP_CLIENT_SECRET ?? '',
      garmin: process.env.GARMIN_CONSUMER_SECRET ?? '',
    }

    const tokenUrl = TOKEN_URLS[provider]
    let accessToken = ''
    let refreshToken = ''

    if (tokenUrl && CLIENT_IDS[provider]) {
      const redirectUri = `${process.env.NEXTAUTH_URL}/api/wearables/${provider}/callback`

      const tokenRes = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          client_id: CLIENT_IDS[provider],
          client_secret: CLIENT_SECRETS[provider],
        }),
      })

      const tokens = await tokenRes.json()
      accessToken = tokens.access_token ?? ''
      refreshToken = tokens.refresh_token ?? ''
    }

    await prisma.wearableSync.upsert({
      where: { userId_provider: { userId, provider } },
      create: {
        userId,
        provider,
        accessToken,
        refreshToken,
        lastSync: new Date(),
      },
      update: {
        accessToken,
        refreshToken,
        lastSync: new Date(),
      },
    })

    return NextResponse.redirect(new URL('/wearables?connected=1', req.url))
  } catch (err) {
    console.error('Wearable callback error:', err)
    return NextResponse.redirect(new URL('/wearables?error=callback_failed', req.url))
  }
}

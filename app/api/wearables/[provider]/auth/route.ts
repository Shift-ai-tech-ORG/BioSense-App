import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const OAUTH_CONFIGS: Record<
  string,
  { authUrl: string; clientId: string; scope: string; responseType?: string }
> = {
  oura: {
    authUrl: 'https://cloud.ouraring.com/oauth/authorize',
    clientId: process.env.OURA_CLIENT_ID ?? '',
    scope: 'daily heartrate personal sleep workout',
  },
  whoop: {
    authUrl: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    clientId: process.env.WHOOP_CLIENT_ID ?? '',
    scope: 'offline read:profile read:recovery read:sleep read:workout',
  },
  garmin: {
    authUrl: 'https://connect.garmin.com/oauthConfirm',
    clientId: process.env.GARMIN_CONSUMER_KEY ?? '',
    scope: '',
  },
  samsung: {
    authUrl: 'https://account.samsung.com/accounts/v1/oauth2/authorize',
    clientId: process.env.SAMSUNG_CLIENT_ID ?? '',
    scope: 'health.data.read',
  },
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { provider } = await params
  const config = OAUTH_CONFIGS[provider]

  if (!config) {
    return NextResponse.json({ error: 'Unknown provider' }, { status: 400 })
  }

  if (!config.clientId) {
    return NextResponse.json(
      { error: `${provider} OAuth is not configured yet. Add ${provider.toUpperCase()}_CLIENT_ID to your .env` },
      { status: 501 },
    )
  }

  const state = Buffer.from(JSON.stringify({ userId: session.user.id, provider })).toString(
    'base64url',
  )
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/wearables/${provider}/callback`

  const url = new URL(config.authUrl)
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', config.responseType ?? 'code')
  url.searchParams.set('scope', config.scope)
  url.searchParams.set('state', state)

  return NextResponse.json({ url: url.toString() })
}

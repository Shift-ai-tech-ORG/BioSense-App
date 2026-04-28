# BioSense — Full App

A continuous, personalised health intelligence platform. Upload blood results, connect wearables, complete daily check-ins — BioSense learns your biology and turns your data into clear, educational insights.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router, TypeScript) |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js v4 (credentials + JWT) |
| AI | Anthropic Claude |
| PDF processing | pdf-parse |
| File storage | Cloudflare R2 |
| Wearables | Oura, Whoop, Garmin, Samsung Health, Apple Health |
| Email | Resend |
| Payments | Stripe |
| Deployment | Vercel |

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Database (PostgreSQL)
Use [Neon](https://neon.tech) (free tier, no credit card) or Supabase:
```bash
# Copy env file
cp .env.example .env
# Add your DATABASE_URL from Neon/Supabase

# Generate Prisma client and push schema
npx prisma generate
npx prisma db push
```

### 3. Environment variables
Fill in `.env` with your keys (see `.env.example` for all required vars):
- `DATABASE_URL` — PostgreSQL connection string (Neon recommended)
- `NEXTAUTH_SECRET` — run `openssl rand -base64 32`
- `ANTHROPIC_API_KEY` — from [console.anthropic.com](https://console.anthropic.com)
- `STRIPE_*` — from [dashboard.stripe.com](https://dashboard.stripe.com)
- `RESEND_API_KEY` — from [resend.com](https://resend.com)
- Wearable OAuth credentials (see each provider's developer portal)

### 4. Run locally
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel
```bash
npx vercel
```
Set all environment variables in the Vercel dashboard. Vercel Cron handles weekly/monthly reports and anomaly checks automatically (see `vercel.json`).

## Phases

| Phase | Features | Status |
|-------|----------|--------|
| 1 | Auth, legal consent, onboarding | ✅ |
| 2 | Daily check-in, health score, dashboard | ✅ |
| 3 | Blood PDF upload, Claude analysis, biomarker tiers | ✅ |
| 4 | Wearable OAuth (Oura/Whoop/Garmin), Apple Health JSON | ✅ |
| 5 | Ask Anything AI, weekly/monthly reports, pattern detection | ✅ |
| 6 | Stripe billing, Web Push, Resend email | ✅ |

## Legal Compliance

- **App 1 (T&Cs):** Age gate at signup, liability disclaimer on every screen
- **App 2 (Privacy Policy — UAE PDPL):** Data export, deletion, consent withdrawal in profile
- **App 3 (Medical Disclaimer):** Persistent footer on all app pages
- **App 4 (User Consent):** Hard-block popup on first dashboard load
- **App 5 (AI Behaviour):** Claude system prompt enforces prohibited/approved language + mandatory output structure
- **App 6 (Red Flag Biomarkers):** T1/T2/T3 tier system, trend-based escalation, structured red flag response

## Key architectural decisions

- **Prisma + PostgreSQL** — multi-user production-ready from day 1
- **JWT sessions** — credentials auth with no DB session table overhead
- **JARVIS code reuse** — biological age, health score, pattern detection, Apple Health ingest all ported from JARVIS with userId added and SQLite → Prisma
- **Vercel Cron** — Sunday 7am weekly reports, last-of-month monthly reports, 5-min anomaly checks
- **App 5 enforced at prompt level** — Claude system prompt is the compliance layer, not the UI

## Notes

- Wearable OAuth requires adding redirect URIs in each provider's dev portal: `https://yourdomain.com/api/wearables/{provider}/callback`
- For Stripe webhooks, configure the endpoint: `https://yourdomain.com/api/billing/webhook`
- Apple Health requires the [Health Auto Export](https://www.healthautoexport.com) app for web JSON upload

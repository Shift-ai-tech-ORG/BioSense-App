# ── Stage 1: deps (ALL deps including devDeps needed for Next.js build) ────────
FROM node:22-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
# Install ALL dependencies (Tailwind/PostCSS devDeps are required at build time)
RUN npm ci

# ── Stage 2: builder ───────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Copy all deps (including dev) and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate (needs the schema)
RUN npx prisma generate

# Build Next.js standalone bundle
ENV NEXT_TELEMETRY_DISABLED=1
# Use placeholder values so the build doesn't fail without real secrets
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/biosense"
ENV NEXTAUTH_SECRET="build-time-placeholder-32-chars-long"
ENV NEXTAUTH_URL="http://localhost:3000"
RUN npm run build

# ── Stage 3: runner ────────────────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone bundle
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma client (needed at runtime)
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]

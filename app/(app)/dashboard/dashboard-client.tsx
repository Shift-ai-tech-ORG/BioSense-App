'use client'

import Link from 'next/link'
import { ClipboardCheck, Droplets, Wifi, Dna, CheckCircle } from 'lucide-react'
import { scoreLabel } from '@/lib/score'
import { Card, CardLabel } from '@/components/ui/card'

function greet(name: string) {
  const h = new Date().getHours()
  const first = name.split(' ')[0]
  if (h < 12) return `Good morning, ${first}.`
  if (h < 17) return `Good afternoon, ${first}.`
  if (h < 21) return `Good evening, ${first}.`
  return `Evening, ${first}.`
}

const PILLAR_LABELS: Record<string, string> = {
  sleep: 'Sleep',
  recovery: 'Recovery',
  stress: 'Stress',
  activity: 'Activity',
  biomarkers: 'Biomarkers',
}

const GOAL_LABELS: Record<string, string> = {
  PERFORMANCE: 'Performance',
  HEALTH: 'Longevity & Health',
  BODY_COMP: 'Body Composition',
  WELLBEING: 'Wellbeing',
}

interface DashboardClientProps {
  user: { name: string; goalType: string | null; goalText: string | null }
  healthScore: number | null
  scoreBreakdown: Record<string, number> | null
  hasCheckinToday: boolean
  checkinCount: number
  recentCheckins: {
    date: string
    energy: number
    sleep: number
    mood: number
    stress: number
  }[]
  hasBlood: boolean
  connectedWearables: string[]
}

export function DashboardClient({
  user,
  healthScore,
  scoreBreakdown,
  hasCheckinToday,
  checkinCount,
  recentCheckins,
  hasBlood,
  connectedWearables,
}: DashboardClientProps) {
  const sl = healthScore != null ? scoreLabel(healthScore) : null
  const hasData = healthScore != null

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

  return (
    <div className="space-y-6 pt-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-1">
            {user.goalType ? GOAL_LABELS[user.goalType] : 'Health'} Dashboard
          </div>
          <h1 className="font-serif text-[26px] font-bold text-t1 tracking-[-0.02em] leading-tight">
            {greet(user.name || 'there')}
          </h1>
          {user.goalText && (
            <p className="text-[13px] text-t2 mt-1 leading-relaxed">
              Goal: <em className="text-t1">{user.goalText}</em>
            </p>
          )}
        </div>

        {!hasCheckinToday && (
          <Link
            href="/checkin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12.5px] font-semibold text-bg bg-accent hover:brightness-110 transition-all flex-shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-bg animate-pulse" />
            Daily check-in →
          </Link>
        )}
      </div>

      {/* Top row — Health Score + streak */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Health Score */}
        <Card
          accent={hasData}
          className="sm:col-span-2 flex items-center gap-6"
        >
          {/* Ring */}
          <div className="relative flex-shrink-0">
            <svg width="90" height="90" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="38" fill="none" stroke="#222222" strokeWidth="8" />
              {hasData && (
                <circle
                  cx="45"
                  cy="45"
                  r="38"
                  fill="none"
                  stroke={sl!.color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 38}`}
                  strokeDashoffset={`${2 * Math.PI * 38 * (1 - healthScore! / 100)}`}
                  transform="rotate(-90 45 45)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-mono text-[22px] font-bold leading-none"
                style={{ color: sl?.color ?? '#4f6b57' }}
              >
                {hasData ? healthScore : '—'}
              </span>
              {hasData && (
                <span className="text-[9px] font-bold tracking-widest text-t3 uppercase mt-0.5">
                  /100
                </span>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <CardLabel>Health Score</CardLabel>
            <div
              className="text-[18px] font-bold mb-1 leading-tight"
              style={{ color: sl?.color ?? '#4f6b57' }}
            >
              {sl?.label ?? 'No data yet'}
            </div>
            {hasData && scoreBreakdown ? (
              <div className="space-y-1.5">
                {Object.entries(scoreBreakdown).map(([key, val]) => (
                  <div key={key} className="flex items-center gap-2">
                    <span className="text-[10.5px] text-t3 w-[72px] flex-shrink-0">
                      {PILLAR_LABELS[key] ?? key}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-s3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${val}%`, background: scoreLabel(val).color }}
                      />
                    </div>
                    <span className="font-mono text-[10.5px] text-t2 w-[28px] text-right">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[12px] text-t3 leading-relaxed">
                Complete your first check-in to start calculating your score
              </p>
            )}
          </div>
        </Card>

        {/* Streak */}
        <Card className="flex flex-col justify-between">
          <CardLabel>Check-in streak</CardLabel>
          <div>
            <span className="font-mono text-[40px] font-bold text-t1 leading-none">
              {checkinCount}
            </span>
            <span className="text-[13px] text-t3 ml-2">days</span>
          </div>

          {/* Mini week grid */}
          <div className="flex gap-1 mt-4">
            {weekDays.map((day, i) => {
              const filled = i <= todayIdx && checkinCount > 0
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full h-6 rounded-md transition-all"
                    style={{
                      background: filled ? 'rgba(240,77,77,0.25)' : '#222222',
                      border: i === todayIdx ? '1px solid rgba(240,77,77,0.4)' : 'none',
                    }}
                  />
                  <span className="text-[8.5px] text-t4">{day[0]}</span>
                </div>
              )
            })}
          </div>

          {checkinCount === 0 && (
            <p className="text-[11px] text-t3 mt-2">Start your streak today →</p>
          )}
        </Card>
      </div>

      {/* Weekly check-in trend */}
      {recentCheckins.length > 0 && (
        <Card>
          <CardLabel>This week — energy / sleep / mood</CardLabel>
          <div className="flex items-end gap-1 h-[60px]">
            {recentCheckins
              .slice()
              .reverse()
              .map((c) => {
                const avg = (c.energy + c.sleep + c.mood) / 3
                const pct = (avg / 10) * 100
                return (
                  <div
                    key={c.date}
                    className="flex-1 rounded-sm transition-all"
                    style={{
                      height: `${Math.max(8, pct)}%`,
                      background: `rgba(240,77,77,${0.2 + (avg / 10) * 0.6})`,
                    }}
                    title={`${c.date}: avg ${avg.toFixed(1)}/10`}
                  />
                )
              })}
          </div>
        </Card>
      )}

      {/* Action cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Daily check-in */}
        <Link href="/checkin">
          <Card
            className={`cursor-pointer hover:border-[var(--b1)] transition-all h-full ${hasCheckinToday ? 'opacity-60' : ''}`}
          >
            <div className="mb-3 text-accent"><ClipboardCheck className="w-5 h-5" /></div>
            <div className="text-[13px] font-semibold text-t1 mb-1">
              {hasCheckinToday ? <span className="flex items-center gap-1.5">Check-in done <CheckCircle className="w-3.5 h-3.5 text-opt inline" /></span> : 'Daily check-in'}
            </div>
            <div className="text-[12px] text-t3 leading-relaxed">
              {hasCheckinToday
                ? 'Come back tomorrow'
                : '4 sliders · takes under 15 seconds'}
            </div>
          </Card>
        </Link>

        {/* Blood upload */}
        <Link href="/blood">
          <Card className="cursor-pointer hover:border-[var(--b1)] transition-all h-full">
            <div className="mb-3 text-accent"><Droplets className="w-5 h-5" /></div>
            <div className="text-[13px] font-semibold text-t1 mb-1">
              {hasBlood ? 'Upload new results' : 'Upload blood results'}
            </div>
            <div className="text-[12px] text-t3 leading-relaxed">
              {hasBlood
                ? 'Add your latest lab panel for trend analysis'
                : 'Upload a lab PDF · AI analysis in seconds'}
            </div>
          </Card>
        </Link>

        {/* Wearables */}
        <Link href="/wearables">
          <Card className="cursor-pointer hover:border-[var(--b1)] transition-all h-full">
            <div className="mb-3 text-accent"><Wifi className="w-5 h-5" /></div>
            <div className="text-[13px] font-semibold text-t1 mb-1">
              {connectedWearables.length > 0
                ? `${connectedWearables.length} connected`
                : 'Connect wearables'}
            </div>
            <div className="text-[12px] text-t3 leading-relaxed">
              {connectedWearables.length > 0
                ? connectedWearables.join(', ')
                : 'Oura, Whoop, Garmin, Apple Health'}
            </div>
          </Card>
        </Link>
      </div>

      {/* Ask Anything CTA */}
      <Link href="/chat">
        <div
          className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer hover:brightness-105 transition-all"
          style={{
            background:
              'linear-gradient(135deg, rgba(240,77,77,0.06) 0%, rgba(118,37,176,0.04) 100%)',
            border: '1px solid rgba(240,77,77,0.15)',
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(240,77,77,0.1)', border: '1px solid rgba(240,77,77,0.2)' }}
          >
            <Dna className="w-5 h-5 text-accent" />
          </div>
          <div>
            <div className="text-[13px] font-semibold text-t1 mb-0.5">Ask Anything</div>
            <div className="text-[12px] text-t3">
              Your AI health co-pilot · Powered by your data · Not medical advice
            </div>
          </div>
          <div className="ml-auto text-t3 text-sm">→</div>
        </div>
      </Link>
    </div>
  )
}

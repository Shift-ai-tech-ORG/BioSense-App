'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { Zap, Leaf, Flame, Brain, Watch, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type GoalType = 'PERFORMANCE' | 'HEALTH' | 'BODY_COMP' | 'WELLBEING'

const goals: { type: GoalType; Icon: React.ElementType; title: string; desc: string }[] = [
  { type: 'PERFORMANCE', Icon: Zap,   title: 'Performance',       desc: 'Optimise training, VO2max, and peak physical output' },
  { type: 'HEALTH',      Icon: Leaf,  title: 'Longevity & Health', desc: 'Reduce biological age and build sustainable health' },
  { type: 'BODY_COMP',   Icon: Flame, title: 'Body Composition',   desc: 'Change body fat, muscle mass, and metabolic health' },
  { type: 'WELLBEING',   Icon: Brain, title: 'Wellbeing',          desc: 'Improve sleep, energy, mood, and stress management' },
]

const wearables = [
  { id: 'oura',    label: 'Oura Ring',       Icon: Watch },
  { id: 'whoop',   label: 'Whoop',           Icon: Watch },
  { id: 'garmin',  label: 'Garmin',          Icon: Watch },
  { id: 'samsung', label: 'Samsung Health',  Icon: Watch },
  { id: 'apple',   label: 'Apple Health',    Icon: Watch },
  { id: 'none',    label: 'None yet',        Icon: Plus  },
]

const TOTAL_STEPS = 5

export default function OnboardingPage() {
  const router = useRouter()
  const { update } = useSession()

  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)

  // Form state
  const [goalType, setGoalType] = useState<GoalType | null>(null)
  const [goalText, setGoalText] = useState('')
  const [goalDeadline, setGoalDeadline] = useState('')
  const [allergies, setAllergies] = useState('')
  const [conditions, setConditions] = useState('')
  const [lifestyle, setLifestyle] = useState('')
  const [selectedWearables, setSelectedWearables] = useState<string[]>([])

  function toggleWearable(id: string) {
    setSelectedWearables((prev) =>
      prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id],
    )
  }

  async function handleComplete() {
    setLoading(true)
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType,
          goalText,
          goalDeadline: goalDeadline || null,
          allergies: allergies
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          conditions: conditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          lifestyle,
          preferences: selectedWearables,
        }),
      })

      if (!res.ok) throw new Error()
      await update()
      toast.success('Welcome to BioSense! 🎉')
      router.push('/dashboard')
    } catch {
      toast.error('Failed to save your profile. Please try again.')
      setLoading(false)
    }
  }

  const progress = (step / TOTAL_STEPS) * 100

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6">
      {/* Progress bar */}
      <div className="w-full max-w-[520px] mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3">
            Setup {step} of {TOTAL_STEPS}
          </span>
          <span className="text-[10.5px] text-t4">{Math.round(progress)}% complete</span>
        </div>
        <div className="h-[3px] rounded-full bg-s3 overflow-hidden">
          <div
            className="h-full rounded-full bg-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div
        className="w-full max-w-[520px] rounded-2xl p-8"
        style={{
          background: '#111111',
          border: '1px solid rgba(255,255,255,0.055)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
        }}
      >
        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="w-6 h-6 rounded-[6px] flex items-center justify-center font-serif text-xs font-bold text-accent"
            style={{ background: 'rgba(240,77,77,0.08)', border: '1px solid rgba(240,77,77,0.2)' }}
          >
            B
          </div>
          <span className="font-serif text-[14px] font-semibold text-t1">BioSense</span>
        </div>

        {/* STEP 1 — Goal type */}
        {step === 1 && (
          <div>
            <h2 className="font-serif text-[22px] font-bold text-t1 mb-1.5 leading-tight">
              What's your primary health goal?
            </h2>
            <p className="text-[13px] text-t2 mb-6 leading-relaxed">
              BioSense personalises your health score, insights, and recommendations around this
              goal.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {goals.map((g) => (
                <button
                  key={g.type}
                  onClick={() => setGoalType(g.type)}
                  className={cn(
                    'text-left p-4 rounded-xl border transition-all duration-150',
                    goalType === g.type
                      ? 'border-[var(--a-ring)] bg-[var(--a-bg)]'
                      : 'border-[var(--b0)] bg-s2 hover:border-[var(--b1)]',
                  )}
                >
                  <g.Icon className="w-4 h-4 text-accent mb-2" />
                  <div className="text-[13px] font-semibold text-t1 mb-0.5">{g.title}</div>
                  <div className="text-[11.5px] text-t3 leading-relaxed">{g.desc}</div>
                </button>
              ))}
            </div>
            <Button
              variant="primary"
              size="lg"
              className="w-full mt-6"
              disabled={!goalType}
              onClick={() => setStep(2)}
            >
              Continue →
            </Button>
          </div>
        )}

        {/* STEP 2 — Goal text + deadline */}
        {step === 2 && (
          <div>
            <h2 className="font-serif text-[22px] font-bold text-t1 mb-1.5 leading-tight">
              Describe your goal
            </h2>
            <p className="text-[13px] text-t2 mb-6 leading-relaxed">
              The more specific you are, the better BioSense can personalise for you.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
                  My goal is to…
                </label>
                <textarea
                  rows={3}
                  placeholder={
                    goalType === 'PERFORMANCE'
                      ? 'e.g. Complete an Ironman triathlon in under 10 hours by November 2026'
                      : goalType === 'HEALTH'
                        ? 'e.g. Reduce my biological age by 5 years in 12 months'
                        : goalType === 'BODY_COMP'
                          ? 'e.g. Reduce body fat from 22% to 15% while maintaining muscle'
                          : 'e.g. Sleep 8 hours a night and reduce my stress score below 4'
                  }
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm placeholder:text-t4 outline-none focus:border-[var(--a-ring)] resize-none transition-colors"
                />
              </div>
              <Input
                label="Target date (optional)"
                type="date"
                value={goalDeadline}
                onChange={(e) => setGoalDeadline(e.target.value)}
                placeholder="YYYY-MM-DD"
              />
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" size="lg" onClick={() => setStep(1)} className="flex-1">
                ← Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={goalText.length < 5}
                onClick={() => setStep(3)}
              >
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 3 — Health context */}
        {step === 3 && (
          <div>
            <h2 className="font-serif text-[22px] font-bold text-t1 mb-1.5 leading-tight">
              Health context
            </h2>
            <p className="text-[13px] text-t2 mb-2 leading-relaxed">
              Optional. Helps BioSense personalise insights and flag anything relevant.
            </p>
            <div
              className="flex items-center gap-2 rounded-lg px-3 py-2 mb-5"
              style={{ background: 'rgba(240,77,77,0.06)', border: '1px solid rgba(240,77,77,0.12)' }}
            >
              <span className="text-[11px] text-accent font-semibold">🔒 Encrypted end-to-end.</span>
              <span className="text-[11px] text-t3">Only you can see this data.</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
                  Dietary restrictions or allergies
                </label>
                <input
                  placeholder="e.g. Gluten-free, lactose intolerant, nut allergy"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm placeholder:text-t4 outline-none focus:border-[var(--a-ring)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
                  Known conditions or family history
                </label>
                <input
                  placeholder="e.g. Family history of diabetes, mild hypertension"
                  value={conditions}
                  onChange={(e) => setConditions(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm placeholder:text-t4 outline-none focus:border-[var(--a-ring)] transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
                  Lifestyle notes
                </label>
                <input
                  placeholder="e.g. Works night shifts, travels frequently, vegan"
                  value={lifestyle}
                  onChange={(e) => setLifestyle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm placeholder:text-t4 outline-none focus:border-[var(--a-ring)] transition-colors"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" size="lg" onClick={() => setStep(2)} className="flex-1">
                ← Back
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(4)}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 4 — Wearable picker */}
        {step === 4 && (
          <div>
            <h2 className="font-serif text-[22px] font-bold text-t1 mb-1.5 leading-tight">
              Which wearables do you use?
            </h2>
            <p className="text-[13px] text-t2 mb-6 leading-relaxed">
              Select all that apply. You can connect them on your dashboard.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {wearables.map((w) => (
                <button
                  key={w.id}
                  onClick={() => toggleWearable(w.id)}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all',
                    selectedWearables.includes(w.id)
                      ? 'border-[var(--a-ring)] bg-[var(--a-bg)]'
                      : 'border-[var(--b0)] bg-s2 hover:border-[var(--b1)]',
                  )}
                >
                  <w.Icon className="w-4 h-4 text-t3" />
                  <span className="text-[13px] font-medium text-t1">{w.label}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" size="lg" onClick={() => setStep(3)} className="flex-1">
                ← Back
              </Button>
              <Button variant="primary" size="lg" className="flex-1" onClick={() => setStep(5)}>
                Continue →
              </Button>
            </div>
          </div>
        )}

        {/* STEP 5 — Ready */}
        {step === 5 && (
          <div className="text-center">
            <div className="mb-6"><Leaf className="w-10 h-10 text-accent" /></div>
            <h2 className="font-serif text-[24px] font-bold text-t1 mb-3 leading-tight">
              You're all set.
            </h2>
            <p className="text-[13.5px] text-t2 mb-6 leading-[1.75] max-w-[350px] mx-auto">
              BioSense is calibrating your personal health baseline. Your dashboard is ready — start
              with a quick daily check-in to begin building your data.
            </p>

            <div className="space-y-2 text-left mb-8">
              {[
                '✓ Health score personalises as you add data',
                '✓ Upload a blood test PDF at any time',
                '✓ Connect your wearables from the dashboard',
                '✓ Ask Anything — your AI health co-pilot is ready',
              ].map((t) => (
                <div key={t} className="text-[12.5px] text-t2 py-1">
                  {t}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" size="lg" onClick={() => setStep(4)} className="flex-1">
                ← Back
              </Button>
              <Button
                variant="primary"
                size="lg"
                loading={loading}
                className="flex-1"
                onClick={handleComplete}
              >
                Open my dashboard →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

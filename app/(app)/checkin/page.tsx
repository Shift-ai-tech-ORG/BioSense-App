'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Zap, Moon, Smile, Waves } from 'lucide-react'
import { Button } from '@/components/ui/button'

const sliders = [
  { id: 'energy' as const, label: 'Energy',        Icon: Zap,    low: 'Exhausted', high: 'Energised' },
  { id: 'sleep'  as const, label: 'Sleep quality', Icon: Moon,   low: 'Very poor', high: 'Excellent' },
  { id: 'mood'   as const, label: 'Mood',          Icon: Smile,  low: 'Very low',  high: 'Great'     },
  { id: 'stress' as const, label: 'Stress',        Icon: Waves,  low: 'None',      high: 'Very high' },
]

type SliderKey = 'energy' | 'sleep' | 'mood' | 'stress'

function getSliderColor(val: number, inverted = false) {
  const v = inverted ? 11 - val : val
  if (v >= 8) return '#F04D4D'
  if (v >= 6) return '#7625B0'
  if (v >= 4) return '#c89840'
  if (v >= 2) return '#c07040'
  return '#c05050'
}

export default function CheckinPage() {
  const router = useRouter()
  const [values, setValues] = useState<Record<SliderKey, number>>({
    energy: 5,
    sleep: 5,
    mood: 5,
    stress: 5,
  })
  const [loading, setLoading] = useState(false)
  const [alreadyDone, setAlreadyDone] = useState(false)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // Check if already done today
    fetch('/api/checkin/today')
      .then((r) => r.json())
      .then((d) => {
        if (d.done) {
          setAlreadyDone(true)
          setValues({
            energy: d.checkin.energy,
            sleep: d.checkin.sleep,
            mood: d.checkin.mood,
            stress: d.checkin.stress,
          })
        }
      })
      .catch(() => {})
  }, [])

  async function handleSubmit() {
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    setLoading(true)
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values }),
      })
      if (!res.ok) throw new Error()
      const msg =
        elapsed <= 15
          ? `Logged in ${elapsed}s`
          : 'Check-in saved!'
      toast.success(msg)
      router.push('/dashboard')
    } catch {
      toast.error('Failed to save check-in')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto pt-4">
      <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-2">
        {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
      </div>
      <h1 className="font-serif text-[24px] font-bold text-t1 mb-1 tracking-[-0.02em]">
        How are you feeling?
      </h1>
      <p className="text-[13px] text-t2 mb-8 leading-relaxed">
        4 quick sliders. Your score updates instantly.{' '}
        {alreadyDone && <span className="text-attn">You've already checked in today.</span>}
      </p>

      <div className="space-y-6">
        {sliders.map((s) => {
          const val = values[s.id]
          const isStress = s.id === 'stress'
          const color = getSliderColor(val, isStress)

          return (
            <div
              key={s.id}
              className="rounded-2xl p-5"
              style={{
                background: '#111111',
                border: '1px solid rgba(255,255,255,0.055)',
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <s.Icon className="w-4 h-4 text-t3" />
                  <span className="text-[13.5px] font-semibold text-t1">{s.label}</span>
                </div>
                <span
                  className="font-mono text-[26px] font-bold leading-none transition-colors duration-200"
                  style={{ color }}
                >
                  {val}
                </span>
              </div>

              <input
                type="range"
                min={1}
                max={10}
                value={val}
                disabled={alreadyDone}
                onChange={(e) => setValues((prev) => ({ ...prev, [s.id]: Number(e.target.value) }))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${color} 0%, ${color} ${(val - 1) / 9 * 100}%, #222222 ${(val - 1) / 9 * 100}%, #222222 100%)`,
                  outline: 'none',
                }}
              />

              <div className="flex justify-between mt-2">
                <span className="text-[10.5px] text-t4">{s.low}</span>
                <span className="text-[10.5px] text-t4">{s.high}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Preview score */}
      <div
        className="flex items-center justify-between mt-6 mb-6 rounded-xl px-4 py-3"
        style={{ background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.055)' }}
      >
        <span className="text-[12px] text-t3">Combined today</span>
        <span className="font-mono text-[15px] font-bold text-t1">
          {((values.energy + values.sleep + values.mood + (11 - values.stress)) / 4).toFixed(1)} / 10
        </span>
      </div>

      {!alreadyDone && (
        <Button
          variant="primary"
          size="lg"
          loading={loading}
          onClick={handleSubmit}
          className="w-full"
        >
          Save check-in →
        </Button>
      )}

      <p className="text-[10.5px] text-t4 mt-4 text-center leading-relaxed">
        Educational data only · Not a clinical assessment
      </p>
    </div>
  )
}

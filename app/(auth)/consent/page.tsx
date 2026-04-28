'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ConsentPage() {
  const router = useRouter()
  const { update } = useSession()
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleAccept() {
    if (!accepted) {
      toast.error('Please tick the checkbox to continue')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/user/consent', { method: 'POST' })
      if (!res.ok) throw new Error()
      // Pass a truthy value so the JWT callback's `session` param is defined
      // and triggers the DB re-read of hasConsented
      await update({ refresh: true })
      router.push('/onboarding')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[420px] w-full">
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
        style={{ background: 'rgba(240,77,77,0.08)', border: '1px solid rgba(240,77,77,0.2)' }}
      >
        <ShieldCheck className="w-5 h-5 text-accent" />
      </div>

      <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-t3 mb-3">
        Before you continue
      </div>
      <h2 className="font-serif text-[24px] font-bold tracking-[-0.02em] text-t1 mb-5 leading-tight">
        Important — please read
      </h2>

      <div
        className="rounded-xl p-5 mb-6 space-y-4"
        style={{
          background: 'rgba(240,77,77,0.04)',
          border: '1px solid rgba(240,77,77,0.15)',
        }}
      >
        <p className="text-[13.5px] text-t1 font-semibold leading-relaxed">
          BioSense provides educational health insights only.
        </p>
        <p className="text-[13px] text-t2 leading-[1.75]">
          BioSense is not a medical service. The platform does not provide medical advice,
          diagnoses, or treatment recommendations. All insights are generated using AI and are
          intended for general educational and informational purposes only.
        </p>
        <p className="text-[13px] text-t2 leading-[1.75]">
          You must consult a qualified healthcare professional before making any changes to your
          health, medication, or lifestyle based on anything you see in BioSense.
        </p>
      </div>

      <div className="space-y-3 mb-6">
        {[
          'Insights are AI-generated and may not always be accurate or complete',
          'BioSense does not replace your doctor or any clinical service',
          'You are responsible for how you interpret and act on information in the platform',
          'If you experience symptoms, always seek professional medical advice',
        ].map((item) => (
          <div key={item} className="flex items-start gap-3 text-[12.5px] text-t2">
            <span className="text-accent font-bold mt-0.5 flex-shrink-0">✓</span>
            {item}
          </div>
        ))}
      </div>

      {/* Consent checkbox */}
      <label
        className="flex items-start gap-3 cursor-pointer mb-6"
        style={{ borderTop: '1px solid rgba(255,255,255,0.055)', paddingTop: '20px' }}
      >
        <div
          onClick={() => setAccepted(!accepted)}
          className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all
            ${accepted ? 'bg-accent border-accent' : 'border-[var(--b1)] bg-s1 hover:border-[var(--b2)]'}`}
        >
          {accepted && (
            <svg
              className="w-2.5 h-2.5 text-bg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-[13px] text-t1 leading-relaxed">
          I agree to the{' '}
          <a href="/consent-agreement" target="_blank" className="text-accent underline">
            User Consent Agreement
          </a>
          . I understand that BioSense provides educational insights only and does not provide
          medical advice.
        </span>
      </label>

      <Button
        variant="primary"
        size="lg"
        loading={loading}
        disabled={!accepted}
        className="w-full"
        onClick={handleAccept}
      >
        I understand — continue →
      </Button>
    </div>
  )
}

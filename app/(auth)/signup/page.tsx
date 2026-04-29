'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { signupSchema, type SignupInput } from '@/lib/validations'

function Checkbox({
  id,
  checked,
  onChange,
  label,
  error,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
  label: React.ReactNode
  error?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
        <div
          onClick={() => onChange(!checked)}
          className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all
            ${checked ? 'bg-accent border-accent' : 'border-[var(--b1)] bg-s1 hover:border-[var(--b2)]'}`}
        >
          {checked && (
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
        <span className="text-[12.5px] text-t2 leading-relaxed">{label}</span>
      </label>
      {error && <p className="mt-1 ml-7 text-xs text-urg">{error}</p>}
    </div>
  )
}

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      ageVerified: undefined as unknown as true,
      tcAccepted: undefined as unknown as true,
      privacyAccepted: undefined as unknown as true,
      dataConsentAccepted: undefined as unknown as true,
    },
  })

  const [ageV, tcV, privV, dataV] = [
    watch('ageVerified'),
    watch('tcAccepted'),
    watch('privacyAccepted'),
    watch('dataConsentAccepted'),
  ]

  async function onSubmit(data: SignupInput) {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        toast.error(json.error || 'Failed to create account')
        setLoading(false)
        return
      }

      toast.success('Account created! Signing you in…')

      const { signIn } = await import('next-auth/react')
      await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      router.push('/consent')
      router.refresh()
    } catch {
      toast.error('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-[400px] w-full">
      <div className="text-[10.5px] font-bold tracking-[0.12em] uppercase text-t3 mb-4">
        Create your account
      </div>
      <h2 className="font-serif text-[24px] font-bold tracking-[-0.02em] text-t1 mb-1.5 leading-tight">
        Start your health journey.
      </h2>
      <p className="text-[13px] text-t2 mb-7 leading-relaxed">
        Your data stays private. Educational insights only — not medical advice.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Full name"
          id="name"
          type="text"
          placeholder="Your name"
          autoComplete="name"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email address"
          id="email"
          type="email"
          placeholder="name@example.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Password"
          id="password"
          type="password"
          placeholder="Min. 8 chars, 1 uppercase, 1 number"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />

        {/* Legal checkboxes */}
        <div
          className="space-y-3 pt-4 mt-4"
          style={{ borderTop: '1px solid rgba(26,26,22,0.07)' }}
        >
          <Checkbox
            id="age"
            checked={!!ageV}
            onChange={(v) => setValue('ageVerified', v as true, { shouldValidate: true })}
            error={errors.ageVerified?.message}
            label="I confirm I am 18 years of age or over"
          />
          <Checkbox
            id="tc"
            checked={!!tcV}
            onChange={(v) => setValue('tcAccepted', v as true, { shouldValidate: true })}
            error={errors.tcAccepted?.message}
            label={
              <>
                I agree to the{' '}
                <Link href="/terms" target="_blank" className="text-accent underline">
                  Terms & Conditions
                </Link>
              </>
            }
          />
          <Checkbox
            id="priv"
            checked={!!privV}
            onChange={(v) => setValue('privacyAccepted', v as true, { shouldValidate: true })}
            error={errors.privacyAccepted?.message}
            label={
              <>
                I agree to the{' '}
                <Link href="/privacy" target="_blank" className="text-accent underline">
                  Privacy Policy
                </Link>{' '}
                (UAE PDPL compliant)
              </>
            }
          />
          <Checkbox
            id="data"
            checked={!!dataV}
            onChange={(v) => setValue('dataConsentAccepted', v as true, { shouldValidate: true })}
            error={errors.dataConsentAccepted?.message}
            label="I consent to the processing of my personal and health data as described in the Privacy Policy"
          />
        </div>

        <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full mt-6">
          Create account <span className="ml-1">→</span>
        </Button>
      </form>

      <p className="text-[11px] text-t4 mt-5 leading-relaxed">
        <span className="text-t3">Already have an account?</span>{' '}
        <Link href="/login" className="text-accent font-semibold hover:brightness-110">
          Sign in →
        </Link>
      </p>
    </div>
  )
}

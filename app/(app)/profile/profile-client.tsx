'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardLabel } from '@/components/ui/card'

const GOAL_OPTIONS = [
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'HEALTH', label: 'Longevity & Health' },
  { value: 'BODY_COMP', label: 'Body Composition' },
  { value: 'WELLBEING', label: 'Wellbeing' },
]

interface ProfileData {
  id: string
  name: string | null
  email: string
  age: number | null
  goalType: string | null
  goalText: string | null
  goalDeadline: string | null
  allergies: string[]
  conditions: string[]
  lifestyle: string | null
  subscriptionStatus: string
  createdAt: string
}

export function ProfileClient({ user }: { user: ProfileData }) {
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: user.name ?? '',
    age: user.age?.toString() ?? '',
    goalType: user.goalType ?? 'HEALTH',
    goalText: user.goalText ?? '',
    goalDeadline: user.goalDeadline ?? '',
    allergies: user.allergies.join(', '),
    conditions: user.conditions.join(', '),
    lifestyle: user.lifestyle ?? '',
  })

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          age: form.age ? parseInt(form.age) : null,
          goalType: form.goalType,
          goalText: form.goalText,
          goalDeadline: form.goalDeadline || null,
          allergies: form.allergies
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          conditions: form.conditions
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          lifestyle: form.lifestyle,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('Profile updated')
      setEditing(false)
    } catch {
      toast.error('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  async function handleExport() {
    const res = await fetch('/api/account/export')
    if (!res.ok) return toast.error('Export failed')
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `biosense-data-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Permanently delete your account and all data? This cannot be undone.'))
      return
    const res = await fetch('/api/account', { method: 'DELETE' })
    if (res.ok) window.location.href = '/login'
    else toast.error('Failed to delete account')
  }

  return (
    <div className="max-w-xl mx-auto pt-4 space-y-5">
      <div>
        <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-2">
          Account
        </div>
        <h1 className="font-serif text-[24px] font-bold text-t1 mb-1 tracking-[-0.02em]">
          Profile
        </h1>
        <p className="text-[13px] text-t2">
          Member since {new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} ·{' '}
          <span
            className="px-2 py-0.5 rounded-full text-[10.5px] font-semibold"
            style={{
              background: user.subscriptionStatus === 'ACTIVE' ? 'rgba(240,77,77,0.1)' : '#222222',
              color: user.subscriptionStatus === 'ACTIVE' ? '#F04D4D' : '#4f6b57',
              border: user.subscriptionStatus === 'ACTIVE' ? '1px solid rgba(240,77,77,0.2)' : '1px solid rgba(255,255,255,0.055)',
            }}
          >
            {user.subscriptionStatus}
          </span>
        </p>
      </div>

      {/* Profile fields */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <CardLabel className="mb-0">Personal details</CardLabel>
          {!editing && (
            <Button variant="subtle" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <Input
            label="Full name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            disabled={!editing}
          />
          <Input
            label="Email address"
            value={user.email}
            disabled
            className="opacity-60"
          />
          <Input
            label="Age"
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
            disabled={!editing}
            placeholder="e.g. 34"
          />
        </div>
      </Card>

      <Card>
        <CardLabel>Goal</CardLabel>
        <div className="space-y-4">
          <div>
            <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
              Goal type
            </label>
            <select
              value={form.goalType}
              onChange={(e) => setForm({ ...form, goalType: e.target.value })}
              disabled={!editing}
              className="w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm outline-none focus:border-[var(--a-ring)] transition-colors disabled:opacity-60"
            >
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className="bg-s1">
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
              Goal description
            </label>
            <textarea
              rows={2}
              value={form.goalText}
              onChange={(e) => setForm({ ...form, goalText: e.target.value })}
              disabled={!editing}
              className="w-full px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm placeholder:text-t4 outline-none focus:border-[var(--a-ring)] resize-none transition-colors disabled:opacity-60"
            />
          </div>
          <Input
            label="Target date"
            type="date"
            value={form.goalDeadline}
            onChange={(e) => setForm({ ...form, goalDeadline: e.target.value })}
            disabled={!editing}
          />
        </div>
      </Card>

      <Card>
        <CardLabel>Health context</CardLabel>
        <div className="space-y-4">
          <Input
            label="Dietary restrictions / allergies"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
            disabled={!editing}
            placeholder="Comma-separated"
          />
          <Input
            label="Conditions / family history"
            value={form.conditions}
            onChange={(e) => setForm({ ...form, conditions: e.target.value })}
            disabled={!editing}
            placeholder="Comma-separated"
          />
          <Input
            label="Lifestyle notes"
            value={form.lifestyle}
            onChange={(e) => setForm({ ...form, lifestyle: e.target.value })}
            disabled={!editing}
          />
        </div>
      </Card>

      {editing && (
        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={() => setEditing(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            loading={saving}
            onClick={handleSave}
            className="flex-1"
          >
            Save changes
          </Button>
        </div>
      )}

      {/* PDPL / Data rights */}
      <Card>
        <CardLabel>Data & privacy (UAE PDPL)</CardLabel>
        <div className="space-y-2 text-[12.5px] text-t2 mb-4 leading-relaxed">
          <p>
            Under the UAE Federal Decree-Law No. 45 of 2021 (PDPL), you have the right to access,
            export, correct, and delete your personal data at any time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="subtle" size="sm" onClick={handleExport}>
            Export my data
          </Button>
          <Button
            variant="subtle"
            size="sm"
            className="text-urg border-urg/20 hover:bg-urg/5"
            onClick={handleDeleteAccount}
          >
            Delete account
          </Button>
        </div>
      </Card>
    </div>
  )
}

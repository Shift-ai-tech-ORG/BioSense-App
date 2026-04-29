'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardLabel } from '@/components/ui/card'
import { ExternalLink, CheckCircle, Upload, Watch, Smartphone } from 'lucide-react'

const WEARABLES = [
  { id: 'oura',    name: 'Oura Ring',       Icon: Watch,       desc: 'Sleep, HRV, readiness, temperature',    type: 'oauth',  status: 'available' },
  { id: 'whoop',   name: 'Whoop',           Icon: Watch,       desc: 'Recovery, strain, sleep performance',   type: 'oauth',  status: 'available' },
  { id: 'garmin',  name: 'Garmin',          Icon: Watch,       desc: 'Activity, HRV, steps, VO2max',          type: 'oauth',  status: 'available' },
  { id: 'samsung', name: 'Samsung Health',  Icon: Smartphone,  desc: 'Steps, heart rate, sleep (Android)',    type: 'oauth',  status: 'available' },
  { id: 'apple',   name: 'Apple Health',    Icon: Smartphone,  desc: 'Upload Health Auto Export JSON',        type: 'upload', status: 'available' },
]

interface WearableSync {
  provider: string
  lastSync: string | null
}

export default function WearablesPage() {
  const [connected, setConnected] = useState<WearableSync[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/wearables')
      .then((r) => r.json())
      .then(setConnected)
      .catch(() => {})
  }, [])

  function isConnected(id: string) {
    return connected.some((c) => c.provider === id)
  }

  function lastSync(id: string) {
    const sync = connected.find((c) => c.provider === id)
    if (!sync?.lastSync) return null
    return new Date(sync.lastSync).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function handleConnect(id: string) {
    setLoading(id)
    try {
      const res = await fetch(`/api/wearables/${id}/auth`)
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error || 'Failed to start OAuth')
      }
    } catch {
      toast.error('Connection failed')
    } finally {
      setLoading(null)
    }
  }

  async function handleAppleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading('apple')
    const fd = new FormData()
    fd.append('file', file)

    try {
      const res = await fetch('/api/wearables/apple/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Apple Health imported — ${data.recordCount} records`)
        const res2 = await fetch('/api/wearables')
        setConnected(await res2.json())
      } else {
        toast.error(data.error || 'Import failed')
      }
    } catch {
      toast.error('Upload failed')
    } finally {
      setLoading(null)
    }
  }

  async function handleDisconnect(id: string) {
    setLoading(id)
    try {
      await fetch(`/api/wearables/${id}`, { method: 'DELETE' })
      toast.success(`${id} disconnected`)
      setConnected((prev) => prev.filter((c) => c.provider !== id))
    } catch {
      toast.error('Failed to disconnect')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 space-y-6">
      <div>
        <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-2">
          Data sources
        </div>
        <h1 className="font-serif text-[24px] font-bold text-t1 mb-1 tracking-[-0.02em]">
          Connect wearables
        </h1>
        <p className="text-[13px] text-t2 leading-relaxed">
          Connect your devices to auto-enrich your health score with real-time HRV, sleep, and
          recovery data.
        </p>
      </div>

      <div className="space-y-3">
        {WEARABLES.map((w) => {
          const conn = isConnected(w.id)
          const sync = lastSync(w.id)

          return (
            <Card key={w.id} className="flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: conn ? 'rgba(110,155,94,0.1)' : '#F0ECE5',
                  border: conn ? '1px solid rgba(110,155,94,0.2)' : '1px solid rgba(26,26,22,0.07)',
                }}
              >
                <w.Icon className="w-5 h-5 text-t2" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13.5px] font-semibold text-t1">{w.name}</span>
                  {conn && <CheckCircle className="w-3.5 h-3.5 text-accent" />}
                </div>
                <div className="text-[11.5px] text-t3">{w.desc}</div>
                {sync && <div className="text-[10.5px] text-t4 mt-0.5">Last sync: {sync}</div>}
              </div>

              <div className="flex-shrink-0">
                {conn ? (
                  <Button
                    variant="subtle"
                    size="sm"
                    loading={loading === w.id}
                    onClick={() => handleDisconnect(w.id)}
                  >
                    Disconnect
                  </Button>
                ) : w.type === 'upload' ? (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={handleAppleUpload}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={loading === w.id}
                      className="pointer-events-none"
                    >
                      <Upload className="w-3.5 h-3.5 mr-1" />
                      Upload JSON
                    </Button>
                  </label>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    loading={loading === w.id}
                    onClick={() => handleConnect(w.id)}
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardLabel>How it works</CardLabel>
        <div className="space-y-2 text-[12.5px] text-t2 leading-relaxed">
          <p>
            <strong className="text-t1">Oura, Whoop, Garmin, Samsung</strong> — click Connect to
            authorise via OAuth. Data syncs automatically every few hours.
          </p>
          <p>
            <strong className="text-t1">Apple Health</strong> — install the{' '}
            <a
              href="https://www.healthautoexport.com"
              target="_blank"
              className="text-accent underline"
            >
              Health Auto Export
            </a>{' '}
            app, export as JSON, then upload here. Native HealthKit sync comes with the iOS app.
          </p>
        </div>
      </Card>
    </div>
  )
}

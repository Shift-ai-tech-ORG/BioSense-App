'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardLabel } from '@/components/ui/card'
import { Upload, FileText } from 'lucide-react'

const TIER_CONFIG = {
  T1: { label: 'Normal',   color: '#22C55E', bg: 'rgba(34,197,94,0.08)'   },
  T2: { label: 'Moderate', color: '#F59E0B', bg: 'rgba(245,158,11,0.08)' },
  T3: { label: 'Red Flag', color: '#EF4444', bg: 'rgba(239,68,68,0.08)'  },
}

interface Marker {
  name: string
  value: number
  unit: string
  tier: 'T1' | 'T2' | 'T3'
  refMin?: number
  refMax?: number
}

interface AnalysisResult {
  bloodId: string
  markerCount: number
  t1Count: number
  t2Count: number
  t3Count: number
  aiSummary: string
}

export default function BloodPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [drawDate, setDrawDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f?.type === 'application/pdf') setFile(f)
    else toast.error('Please drop a PDF file')
  }

  async function handleUpload() {
    if (!file) return toast.error('Please select a PDF file')
    setLoading(true)

    const fd = new FormData()
    fd.append('file', file)
    fd.append('drawDate', drawDate)

    try {
      const res = await fetch('/api/blood', { method: 'POST', body: fd })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Upload failed')
        return
      }

      setResult(data)
      toast.success(`Analysis complete — ${data.markerCount} biomarkers extracted`)
    } catch {
      toast.error('Upload failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto pt-4 space-y-6">
      <div>
        <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-2">
          Blood analysis
        </div>
        <h1 className="font-serif text-[24px] font-bold text-t1 mb-1 tracking-[-0.02em]">
          Upload lab results
        </h1>
        <p className="text-[13px] text-t2 leading-relaxed">
          Upload any blood test PDF. BioSense extracts your biomarkers, classifies them, and tracks
          trends over time.
        </p>
      </div>

      {/* Medical disclaimer */}
      <div
        className="flex items-start gap-3 rounded-xl px-4 py-3"
        style={{ background: 'rgba(200,152,64,0.06)', border: '1px solid rgba(200,152,64,0.2)' }}
      >
        <span className="text-attn text-[15px] flex-shrink-0">⚠</span>
        <p className="text-[12px] text-t2 leading-relaxed">
          <strong className="text-t1">Educational purposes only.</strong> This information is not
          medical advice. All results are AI-generated interpretations. Consult a qualified
          healthcare professional before acting on any insight.
        </p>
      </div>

      {!result ? (
        <Card>
          <CardLabel>Upload PDF</CardLabel>

          {/* Drop zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all hover:border-[var(--a-ring)] hover:bg-[var(--a-bg)]"
            style={{ borderColor: file ? 'rgba(110,155,94,0.3)' : 'rgba(26,26,22,0.09)' }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-10 h-10 text-accent" />
                <div className="text-[13px] font-semibold text-t1">{file.name}</div>
                <div className="text-[11px] text-t3">
                  {(file.size / 1024).toFixed(0)} KB · Click to change
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-10 h-10 text-t3" />
                <div>
                  <div className="text-[13.5px] font-semibold text-t1 mb-1">
                    Drop your PDF here or click to browse
                  </div>
                  <div className="text-[12px] text-t3">
                    Any lab panel · Max 10MB · Text-based PDF only
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Draw date */}
          <div className="mt-5">
            <label className="block text-[10.5px] font-bold tracking-[0.08em] uppercase text-t3 mb-1.5">
              Blood draw date
            </label>
            <input
              type="date"
              value={drawDate}
              onChange={(e) => setDrawDate(e.target.value)}
              className="px-3.5 py-2.5 bg-s1 border border-[var(--b1)] rounded-lg text-t1 text-sm outline-none focus:border-[var(--a-ring)] transition-colors"
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            loading={loading}
            disabled={!file}
            onClick={handleUpload}
            className="mt-5 w-full"
          >
            {loading ? 'Analysing…' : 'Upload & analyse →'}
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Score summary */}
          <div className="grid grid-cols-3 gap-3">
            {(['T1', 'T2', 'T3'] as const).map((tier) => {
              const cfg = TIER_CONFIG[tier]
              const count = tier === 'T1' ? result.t1Count : tier === 'T2' ? result.t2Count : result.t3Count
              return (
                <Card key={tier} className="text-center">
                  <div className="w-2 h-2 rounded-full mx-auto mb-2" style={{ background: cfg.color }} />
                  <div
                    className="font-mono text-[28px] font-bold leading-none mb-1"
                    style={{ color: cfg.color }}
                  >
                    {count}
                  </div>
                  <div className="text-[11px] text-t3">{cfg.label}</div>
                </Card>
              )
            })}
          </div>

          {/* AI Summary */}
          {result.aiSummary && (
            <Card>
              <CardLabel>AI Education Summary</CardLabel>
              <p className="text-[13px] text-t2 leading-[1.8]">{result.aiSummary}</p>
              <div
                className="flex items-center gap-2 mt-4 pt-4"
                style={{ borderTop: '1px solid rgba(26,26,22,0.07)' }}
              >
                <span className="text-[10.5px] text-t4">
                  This is not medical advice. Consult a healthcare professional.
                </span>
              </div>
            </Card>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" size="md" onClick={() => { setResult(null); setFile(null) }} className="flex-1">
              Upload another →
            </Button>
            <Button variant="primary" size="md" onClick={() => router.push('/dashboard')} className="flex-1">
              Back to dashboard →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

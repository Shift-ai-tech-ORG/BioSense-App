import { BrandMark } from '@/components/brand-mark'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.35) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          {/* Brand bloom — grape */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 80% 70% at 15% 60%, rgba(110,155,94,0.10) 0%, transparent 60%)',
          }} />
          {/* Brand bloom — red */}
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(ellipse 60% 50% at 80% 20%, rgba(110,155,94,0.08) 0%, transparent 55%)',
          }} />
        </div>

        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Wordmark */}
          <div className="flex items-center gap-3">
            <BrandMark size={30} />
            <span className="font-sans text-[17px] font-semibold text-t1 tracking-[-0.01em]">
              BioSense
            </span>
          </div>

          {/* Hero */}
          <div className="mt-auto mb-auto max-w-[520px]">
            <div className="inline-flex items-center gap-2.5 mb-8">
              <div
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#6E9B5E' }}
              />
              <span
                className="text-[11px] font-bold tracking-[0.14em] uppercase"
                style={{ color: '#6E9B5E' }}
              >
                Longevity intelligence · Private beta
              </span>
            </div>

            <h1 className="font-sans text-[clamp(40px,4.5vw,60px)] font-black leading-[1.03] tracking-[-0.03em] text-t1 mb-6">
              Your biology.
              <br />
              <span style={{
                background: 'linear-gradient(135deg, #5A7040 0%, #6E9B5E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Finally legible.
              </span>
            </h1>

            <p className="text-[15px] text-t2 leading-[1.8] max-w-[40ch]">
              The most advanced personalised health intelligence available.{' '}
              <strong className="text-t1 font-semibold">
                Wearables, blood results, daily check-ins.
              </strong>{' '}
              One system that learns who you are.
            </p>

            {/* Stats */}
            <div
              className="grid grid-cols-3 gap-6 mt-12 pt-10"
              style={{ borderTop: '1px solid rgba(247,247,247,0.06)' }}
            >
              {[
                { v: '5+',   l: 'Wearable integrations' },
                { v: '20+',  l: 'Biomarkers tracked' },
                { v: '100%', l: 'Personalised to you' },
              ].map((s) => (
                <div key={s.l}>
                  <div
                    className="font-sans text-[28px] font-black leading-none tracking-[-0.02em]"
                    style={{
                      background: 'linear-gradient(135deg, #5A7040 0%, #6E9B5E 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {s.v}
                  </div>
                  <div className="text-[11px] text-t3 mt-1.5 leading-snug">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div
            className="flex flex-wrap gap-5 pt-6"
            style={{ borderTop: '1px solid rgba(247,247,247,0.06)' }}
          >
            {['GDPR & DIFC compliant', 'UAE registered', 'Educational insights only', 'Cancel anytime'].map((t) => (
              <div key={t} className="flex items-center gap-1.5 text-[11px] text-t3">
                <span className="font-bold text-[10px]" style={{ color: '#6E9B5E' }}>✓</span>
                {t}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div
        className="w-full lg:w-[480px] flex flex-col justify-center p-8 lg:p-12 relative z-10"
        style={{
          borderLeft: '1px solid rgba(247,247,247,0.05)',
          background: 'rgba(10,10,10,0.96)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Mobile wordmark */}
        <div className="flex items-center gap-3 mb-10 lg:hidden">
          <BrandMark size={26} />
          <span className="font-sans text-[16px] font-semibold text-t1 tracking-[-0.01em]">
            BioSense
          </span>
        </div>

        {children}

        <p className="text-[11px] text-t4 mt-8 leading-relaxed">
          BioSense provides educational health insights only. It does not provide medical advice,
          diagnosis, or treatment. Always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  )
}

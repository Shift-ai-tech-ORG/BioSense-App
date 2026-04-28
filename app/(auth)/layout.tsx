export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex flex-col flex-1 relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        {/* Radial accent */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 25% 55%, rgba(77,200,140,0.06), transparent 65%)',
          }}
        />

        <div className="relative z-10 flex flex-col h-full p-14">
          {/* Wordmark */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-[7px] flex items-center justify-center
              font-serif text-sm font-bold text-accent"
              style={{
                background: 'rgba(77,200,140,0.08)',
                border: '1px solid rgba(77,200,140,0.2)',
              }}
            >
              B
            </div>
            <span className="font-serif text-[17px] font-semibold text-t1">BioSense</span>
          </div>

          {/* Hero text */}
          <div className="mt-auto mb-auto">
            <div className="inline-flex items-center gap-2.5 mb-7">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[11px] font-bold tracking-[0.12em] uppercase text-accent">
                Longevity intelligence · Private beta
              </span>
            </div>
            <h1 className="font-serif text-[clamp(42px,5vw,62px)] font-bold leading-[1.05] tracking-[-0.025em] text-t1 mb-6">
              Your biology.
              <br />
              <em className="text-accent">Finally legible.</em>
            </h1>
            <p className="text-[16px] text-t2 max-w-[44ch] leading-[1.75]">
              The most advanced personalised health intelligence available.{' '}
              <strong className="text-t1">Wearables, blood results, daily check-ins.</strong>{' '}
              One system that learns who you are and turns your data into clear actions.
            </p>

            <div
              className="flex gap-10 mt-12 pt-10"
              style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
            >
              {[
                { v: '5+', l: 'Wearable integrations' },
                { v: '20+', l: 'Biomarkers tracked' },
                { v: '100%', l: 'Personalised to you' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="font-mono text-[26px] font-medium text-t1 leading-none">
                    {s.v}
                  </div>
                  <div className="text-[11px] text-t3 mt-1.5">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Trust strip */}
          <div
            className="flex flex-wrap gap-5 pt-6"
            style={{ borderTop: '1px solid rgba(255,255,255,0.055)' }}
          >
            {['GDPR & DIFC compliant', 'UAE registered', 'Educational insights only', 'Cancel anytime'].map(
              (t) => (
                <div key={t} className="flex items-center gap-1.5 text-[11px] text-t3">
                  <span className="text-accent font-bold">✓</span>
                  {t}
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className="w-full lg:w-[480px] flex flex-col justify-center p-8 lg:p-12 relative z-10"
        style={{
          borderLeft: '1px solid rgba(255,255,255,0.055)',
          background: 'rgba(5,8,6,0.8)',
          backdropFilter: 'blur(40px)',
        }}
      >
        {/* Mobile wordmark */}
        <div className="flex items-center gap-2.5 mb-10 lg:hidden">
          <div
            className="w-7 h-7 rounded-[7px] flex items-center justify-center font-serif text-sm font-bold text-accent"
            style={{ background: 'rgba(77,200,140,0.08)', border: '1px solid rgba(77,200,140,0.2)' }}
          >
            B
          </div>
          <span className="font-serif text-[17px] font-semibold text-t1">BioSense</span>
        </div>

        {children}

        {/* Legal footer */}
        <p className="text-[11px] text-t4 mt-8 leading-relaxed">
          BioSense provides educational health insights only. It does not provide medical advice,
          diagnosis, or treatment. Always consult a qualified healthcare professional.
        </p>
      </div>
    </div>
  )
}

/**
 * (setup) group — wraps consent-dependent setup flows (onboarding).
 * No redirect logic here; redirects are handled by (app)/layout and root page.tsx.
 */
export default function SetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      {children}
    </div>
  )
}

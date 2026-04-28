import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardLabel } from '@/components/ui/card'

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [weeklyReports, monthlyReports] = await Promise.all([
    prisma.weeklyReport.findMany({
      where: { userId: session.user.id },
      orderBy: { generatedAt: 'desc' },
      take: 12,
    }),
    prisma.monthlyReport.findMany({
      where: { userId: session.user.id },
      orderBy: { generatedAt: 'desc' },
      take: 12,
    }),
  ])

  return (
    <div className="max-w-2xl mx-auto pt-4 space-y-6">
      <div>
        <div className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-t3 mb-2">
          Intelligence reports
        </div>
        <h1 className="font-serif text-[24px] font-bold text-t1 mb-1 tracking-[-0.02em]">
          Your reports
        </h1>
        <p className="text-[13px] text-t2 leading-relaxed">
          Weekly and monthly AI-generated health intelligence. Delivered Sunday 7am (weekly) and
          last day of the month.
        </p>
      </div>

      {weeklyReports.length === 0 && monthlyReports.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-[14px] font-semibold text-t1 mb-2">No reports yet</div>
            <p className="text-[13px] text-t2 max-w-[320px] mx-auto leading-relaxed">
              Your first weekly report generates after 3 check-ins. Monthly reports start after your
              first full month.
            </p>
          </div>
        </Card>
      )}

      {weeklyReports.length > 0 && (
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-t3 mb-3">
            Weekly reports
          </div>
          <div className="space-y-2">
            {weeklyReports.map((r) => {
              const content = r.content as Record<string, unknown>
              return (
                <Card key={r.id} className="hover:border-[var(--b1)] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <CardLabel className="mb-0">Week {r.period}</CardLabel>
                    <span className="text-[10.5px] text-t4">
                      {r.checkinsCompleted ?? 0}/7 check-ins
                    </span>
                  </div>
                  {typeof content.headline === 'string' && (
                    <p className="text-[13px] text-t1 font-medium mb-1">
                      {content.headline}
                    </p>
                  )}
                  <div className="flex gap-3 text-[11px] text-t3">
                    {r.bestDay && <span>Best: {r.bestDay}</span>}
                    {r.worstDay && <span>Worst: {r.worstDay}</span>}
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {monthlyReports.length > 0 && (
        <div>
          <div className="text-[11px] font-bold tracking-[0.1em] uppercase text-t3 mb-3">
            Monthly reports
          </div>
          <div className="space-y-2">
            {monthlyReports.map((r) => {
              const content = r.content as Record<string, unknown>
              return (
                <Card key={r.id} className="hover:border-[var(--b1)] transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <CardLabel className="mb-0">{r.period}</CardLabel>
                    <span className="text-[10.5px] text-t4">
                      Generated {new Date(r.generatedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {typeof content.summary === 'string' && (
                    <p className="text-[13px] text-t2 leading-relaxed line-clamp-2">
                      {content.summary}
                    </p>
                  )}
                </Card>
              )
            })}
          </div>
        </div>
      )}

      <Card>
        <CardLabel>Report schedule</CardLabel>
        <div className="space-y-3 text-[12.5px] text-t2">
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold flex-shrink-0">W</span>
            <div>
              <strong className="text-t1">Weekly</strong> — Generated every Sunday at 7am. Includes
              headline, what changed, why it happened, 3 actions, effort vs impact ranking, and best
              / worst day.
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-accent font-bold flex-shrink-0">M</span>
            <div>
              <strong className="text-t1">Monthly</strong> — Generated on the last day of each
              month. Includes progress graphs, key patterns, personal drivers, biological age chart,
              and cohort comparisons.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

/**
 * Notification delivery — Web Push + Resend email fallback
 */
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export interface NotificationPayload {
  title: string
  body: string
  url?: string
  tag?: string
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('Resend not configured — skipping email')
    return
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'BioSense <noreply@biosense.app>',
    to,
    subject,
    html,
  })
}

export async function sendWeeklyReportEmail(
  to: string,
  name: string,
  reportContent: Record<string, unknown>,
) {
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; background: #030508; color: #eff4f0; padding: 32px; border-radius: 12px;">
      <div style="margin-bottom: 24px;">
        <span style="font-size: 11px; font-weight: bold; letter-spacing: 0.1em; text-transform: uppercase; color: #4f6b57;">Weekly Health Report</span>
        <h1 style="font-size: 24px; font-weight: bold; color: #eff4f0; margin: 8px 0 4px;">${reportContent.headline ?? 'Your weekly health summary'}</h1>
        <p style="color: #90ae9a; font-size: 13px;">Hi ${name}, here's your personalised health intelligence for this week.</p>
      </div>

      ${reportContent.whatChanged ? `
      <div style="background: #0c1210; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #4f6b57; margin-bottom: 8px;">What Changed</div>
        <p style="color: #eff4f0; font-size: 13px; line-height: 1.7;">${reportContent.whatChanged}</p>
      </div>` : ''}

      ${reportContent.actions ? `
      <div style="background: #0c1210; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.08em; color: #4f6b57; margin-bottom: 8px;">3 Actions This Week</div>
        ${(reportContent.actions as string[]).map((a, i) => `<div style="color: #eff4f0; font-size: 13px; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.055);">${i + 1}. ${a}</div>`).join('')}
      </div>` : ''}

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.055);">
        <p style="font-size: 11px; color: #2c4132; line-height: 1.6;">This report is for educational purposes only and is not medical advice. BioSense does not provide diagnoses or treatment recommendations. Always consult a qualified healthcare professional.</p>
        <a href="${process.env.NEXTAUTH_URL}/dashboard" style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #4dc88c; color: #030508; font-weight: bold; font-size: 13px; text-decoration: none; border-radius: 8px;">View full dashboard →</a>
      </div>
    </div>
  `

  await sendEmail(to, `Your weekly BioSense report`, html)
}

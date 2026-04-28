import Stripe from 'stripe'

let _stripe: Stripe | null = null
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder')
  }
  return _stripe
}

// Convenience export (lazy)
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string]
  },
})

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID ?? '',
    amount: 149,
    currency: 'AED',
    interval: 'month',
    label: 'AED 149 / month',
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID ?? '',
    amount: 1499,
    currency: 'AED',
    interval: 'year',
    label: 'AED 1,499 / year — save 16%',
  },
}

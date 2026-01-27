import Stripe from 'stripe'

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY ?? 'sk_test_mock_key_for_build',
  {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    apiVersion: '2024-06-20' as any,
    typescript: true,
  }
)

export const PLANS = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
    price: 4.99,
    currency: 'EUR',
    interval: 'month' as const,
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_ID_YEARLY!,
    price: 49.0, // Corrected from 49.99 to match Stripe Catalog screenshot
    currency: 'EUR',
    interval: 'year' as const,
  },
}

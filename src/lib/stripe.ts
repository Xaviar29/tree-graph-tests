import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeServer() {
  if (stripeClient) return stripeClient
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return null
  stripeClient = new Stripe(key)
  return stripeClient
}

export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || null
}

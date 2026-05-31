import { NextRequest, NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const stripe = getStripeServer()
  if (!stripe) {
    return NextResponse.json({ success: false, error: { code: 'STRIPE_NOT_CONFIGURED', message: 'Stripe is not configured. Set STRIPE_SECRET_KEY env var.' } }, { status: 501 })
  }

  try {
    const { priceId, successUrl, cancelUrl } = await request.json()
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl || `${request.headers.get('origin')}/indices? checkout=success`,
      cancel_url: cancelUrl || `${request.headers.get('origin')}/? checkout=canceled`,
    })
    return NextResponse.json({ success: true, data: { url: session.url } })
  } catch (error) {
    return NextResponse.json({ success: false, error: { code: 'CHECKOUT_ERROR', message: error instanceof Error ? error.message : 'Failed to create checkout' } }, { status: 500 })
  }
}

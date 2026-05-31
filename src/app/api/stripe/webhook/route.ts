import { NextRequest, NextResponse } from 'next/server'
import { getStripeServer } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const stripe = getStripeServer()
  if (!stripe) return NextResponse.json({ error: 'Not configured' }, { status: 501 })

  try {
    const body = await request.text()
    const sig = request.headers.get('stripe-signature') || ''
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET

    let event
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
    } else {
      event = JSON.parse(body)
    }

    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Checkout completed:', event.data.object.id)
        break
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        console.log('Subscription changed:', event.type, event.data.object.id)
        break
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Webhook error' }, { status: 400 })
  }
}

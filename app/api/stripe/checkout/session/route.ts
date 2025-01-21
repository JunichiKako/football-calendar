import { createCheckoutSession } from '@/lib/stripe/checkout';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received request body:', body);

    const stripeCheckoutSession = await createCheckoutSession(body.priceId);

    if (!stripeCheckoutSession.url) {
      throw new Error('Could not create a Stripe Checkout session.');
    }

    return NextResponse.json({ url: stripeCheckoutSession.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}

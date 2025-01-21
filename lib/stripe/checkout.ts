'use server';

import Stripe from 'stripe';
import { stripe } from './stripe';

export async function createCheckoutSession(priceId: string) {
  const APP_BASE_URL = process.env.NEXT_PUBLIC_SITE_URL;
  if (!APP_BASE_URL) {
    throw new Error('APP_BASE_URL environment variable is not set.');
  }

  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${APP_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${APP_BASE_URL}/pricing`,
  };

  return stripe.checkout.sessions.create(sessionParams);
}

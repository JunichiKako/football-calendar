'use server';

import { redirect } from 'next/navigation';
import { currentUser } from '@/data/auth';
import { stripe } from '@/lib/stripe/stripe';
import { createClient } from '@/lib/supabase/server';

// headerのサブスク管理からカスタマーポータルセッションを作成
export async function createPortalSession() {
  const supabase = await createClient();
  const user = await currentUser();

  // Userがいない場合はGoogle認証画面へリダイレクト
  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`);
  }

  // UserがStripeの顧客IDを持っているか確認
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  // Userが見つからないか、stripe_customer_idがない場合はエラー画面へリダイレクト
  if (userError || !userData?.stripe_customer_id) {
    console.error(
      'User not found or stripe_customer_id is missing:',
      userError
    );
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  // カスタマーポータルセッションを作成
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: userData.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_SITE_URL}`,
  });

  // セッションURLへリダイレクト
  redirect(portalSession.url);
}

export async function handleSubscribe(formData: FormData) {
  const planId = formData.get('planId');

  if (planId === 'free') {
    redirect('/');
  }

  const supabase = await createClient();
  const user = await currentUser();
  if (!user) {
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`);
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single();

  if (userError || !userData?.stripe_customer_id) {
    console.error(
      'User not found or stripe_customer_id is missing:',
      userError
    );
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  if (planId === 'pro') {
    const session = await stripe.checkout.sessions.create({
      customer: userData.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRO_PLAN_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/plan`,
      metadata: {
        userId: user.id,
      },
    });

    if (session.url) {
      redirect(session.url);
    }

    console.error('No session URL returned from Stripe');
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
}

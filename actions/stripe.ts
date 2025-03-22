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

  console.log(userData);

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

  // 入力値の厳密なバリデーション
  if (!planId || (planId !== 'free' && planId !== 'pro')) {
    console.error('Invalid plan ID:', planId);
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  // 無料プランの場合はホームページにリダイレクト
  if (planId === 'free') {
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/`);
  }

  // ここからはProプランの処理
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

  console.log('User data query result:', {
    userData,
    userError,
    userId: user.id,
  });

  if (userError || !userData?.stripe_customer_id) {
    console.error(
      'User not found or stripe_customer_id is missing:',
      userError
    );
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  try {
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
      // 3Dセキュア設定を追加
      payment_method_options: {
        card: {
          request_three_d_secure: 'automatic',
        },
      },
      // 不正利用防止のための設定
      allow_promotion_codes: false,
      billing_address_collection: 'required',
      customer_update: {
        address: 'auto',
      },
    });

    if (session.url) {
      redirect(session.url);
    }

    console.error('No session URL returned from Stripe');
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  } catch (error) {
    console.error('Stripe session creation error:', error);
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }
}

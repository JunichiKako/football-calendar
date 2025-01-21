'use server';

import { redirect } from 'next/navigation';
import { currentUser } from '@/data/auth'; // あなたのアプリで現在のユーザ情報を取得する処理
import { stripe } from '@/lib/stripe/stripe'; // Stripeインスタンス
import { createClient } from '@/lib/supabase/server'; // Supabaseサーバーサイドクライアント

export async function handleSubscribe(formData: FormData) {
  // 1. フォームから planId を取得
  const planId = formData.get('planId');
  console.log('planId:', planId); // "pro" が表示されるはず

  // 2. 無料プランならトップへ飛ばす
  if (planId === 'free') {
    redirect('/');
  }

  // 3. Supabaseクライアントと認証中ユーザを取得
  const supabase = createClient();
  const user = await currentUser();
  if (!user) {
    // ユーザがログインしていない場合
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`);
  }

  // 4. DBから Stripe Customer ID を取得
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('user_id', user.id) // AuthのUUIDと、usersテーブルの主キーが同じ想定
    .single();

  // 5. もし該当ユーザが見つからなければ何らかのエラー処理
  if (userError || !userData?.stripe_customer_id) {
    console.error(
      'User not found or stripe_customer_id is missing:',
      userError
    );
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  // 6. 有料プラン "pro" の場合 → Stripe Checkout セッションを作成
  if (planId === 'pro') {
    const session = await stripe.checkout.sessions.create({
      customer: userData.stripe_customer_id,
      payment_method_types: ['card'],
      line_items: [
        {
          // .envにセットした価格ID(例: price_xxx)
          price: process.env.STRIPE_PRO_PLAN_PRICE_ID!,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      metadata: {
        userId: user.id,
      },
    });

    // 7. session.url が取れたら即リダイレクト
    if (session.url) {
      redirect(session.url);
    }

    // session.url が無い場合は想定外エラー
    console.error('No session URL returned from Stripe');
    redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
  }

  // 8. 上記以外の planId は不正としてエラー画面へ
  redirect(`${process.env.NEXT_PUBLIC_SITE_URL}/error`);
}

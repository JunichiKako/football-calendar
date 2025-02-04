import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // 1. Supabase のセッション取得のみ
  const supabase = createClient();
  const { data: authData, error: authError } =
    await supabase.auth.exchangeCodeForSession(code);

  // 2. ログイン/サインアップ処理の結果チェック
  if (authError || !authData?.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Stripe Customer作成のみ行い、DBへの保存はWebhookに任せる
  try {
    const customer = await stripe.customers.create({
      email: authData.user.email ?? undefined,
      metadata: {
        supabase_uid: authData.user.id,
      },
    });

  } catch (error) {
    console.error('Stripe customer creation error:', error);
    // エラーの詳細をログに残す
    if (error instanceof Stripe.errors.StripeError) {
      console.error('Stripe error details:', {
        type: error.type,
        code: error.code,
        message: error.message,
      });
    }
  }

  // リダイレクト処理
  const cleanRedirect = (baseUrl: string) => {
    return NextResponse.redirect(`${baseUrl}${next}`);
  };

  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    return cleanRedirect(origin);
  } else if (forwardedHost) {
    return cleanRedirect(`https://${forwardedHost}`);
  } else {
    return cleanRedirect(origin);
  }
}

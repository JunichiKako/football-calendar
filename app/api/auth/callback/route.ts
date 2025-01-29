import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    // コードがない場合はエラーリダイレクト
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // 1. Supabase のセッション取得
  const supabase = createClient();
  const { data: authData, error: authError } =
    await supabase.auth.exchangeCodeForSession(code);

  // 2. ログイン or サインアップ処理の結果がエラーなら弾く
  if (authError || !authData?.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  const { user } = authData;
  // user.id → Supabaseが発行するユーザUUID。これを参照して
  // あなたの独自テーブル(users)の user_id と突き合わせる想定

  // 3. usersテーブルから、該当ユーザの stripe_customer_id を探す
  const { data: userRecord, error: findError } = await supabase
    .from('users')
    .select('stripe_customer_id, user_id')
    .eq('user_id', user.id) // usersテーブルの主キー = user_id (AuthのUUIDと同じ値)
    .single();

  if (findError) {
    // 初回ログイン時などでレコードがない可能性や、単純にエラーの場合もあり
    console.error('Failed to fetch user record from Supabase:', findError);
  }

  // 4. stripe_customer_id が既にあれば重複作成をスキップ
  if (userRecord?.stripe_customer_id) {
    console.log(
      'User already has a Stripe customer ID:',
      userRecord.stripe_customer_id
    );
  } else {
    // まだStripe顧客を作っていない場合のみStripeの顧客を作成
    try {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: {
          supabase_uid: user.id,
        },
      });
      // TODO：作成した顧客IDを users テーブルに保存をSupabaseで行うのかWebhookかは検討
      const { error: upsertError } = await supabase
        .from('users')
        .update({
          stripe_customer_id: customer.id,
          updated_at: new Date().toISOString(), // カラムがある場合
        })
        .eq('user_id', user.id);

      if (upsertError) {
        console.error(
          'Failed to update user with stripe_customer_id:',
          upsertError
        );
      }
    } catch (stripeError) {
      console.error('Stripe customer creation error:', stripeError);
    }
  }

  // クリーンなURLへのリダイレクト用の関数
  const cleanRedirect = (baseUrl: string) => {
    // nextパラメータのみを使用し、codeパラメータは除外
    return NextResponse.redirect(`${baseUrl}${next}`);
  };

  // 5. リダイレクト先を振り分け (ローカル or 本番)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const isLocalEnv = process.env.NODE_ENV === 'development';

  if (isLocalEnv) {
    // ローカル環境ならそのまま origin を使う
    return cleanRedirect(origin);
  } else if (forwardedHost) {
    // 例: Vercel などで x-forwarded-host が付いている場合
    return cleanRedirect(`https://${forwardedHost}`);
  } else {
    // その他のケース
    return cleanRedirect(origin);
  }
}

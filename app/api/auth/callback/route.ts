import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // 1. Supabase のセッション取得のみ
  const supabase = await createClient();
  const { data: authData, error: authError } =
    await supabase.auth.exchangeCodeForSession(code);

  // 2. ログイン/サインアップ処理の結果チェック
  if (authError || !authData?.user) {
    return NextResponse.redirect(`${origin}/auth/auth-code-error`);
  }

  // Stripe連携は休止中のため顧客作成処理をスキップ

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

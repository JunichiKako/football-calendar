import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // リクエストURLの確認（デバッグ用）
  console.log('Middleware入口URL:', request.nextUrl.toString());
  console.log(
    'クエリパラメータ:',
    Object.fromEntries(request.nextUrl.searchParams)
  );

  // 認証処理を実行しつつ、URLパラメータを保持
  const response = await updateSession(request);

  // 処理後のレスポンスを確認（デバッグ用）
  console.log('Middleware出口処理完了');

  return response;
}

// マッチャーを簡略化
export const config = {
  matcher: [
    {
      source:
        '/((?!webhook|zoom|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};

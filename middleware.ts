import { type NextRequest, NextResponse } from 'next/server';
// ログイン機能を一時的に無効化
// import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // 認証処理を一時的に無効化 - 単純にパススルー
  // const response = await updateSession(request);
  // return response;
  return NextResponse.next();
}

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

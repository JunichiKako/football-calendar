// /lib/supabase/middleware.js
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  // リクエストURLを保持するために、完全なリクエストを使用
  let response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Cookieを設定しつつも、元のURLを維持
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Cookieを削除しつつも、元のURLを維持
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  // URLパラメータが保持されていることを確認するためのデバッグログ
  console.log(
    'Supabase auth middleware completed:',
    request.nextUrl.toString()
  );

  return response;
}

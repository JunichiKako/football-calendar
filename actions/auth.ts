'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Googleアカウントでサインインする処理
export const signInWithGoogle = async () => {
  const supabase = await createClient();

  // 既存のユーザーセッションをチェック
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/api/auth/callback`,
      scopes: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar.app.created',
        'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
      ].join(' '),
      queryParams: {
        access_type: 'offline',
        prompt: session ? 'select_account' : 'consent', // セッションがある場合は明示的にアカウント選択を要求
        // login_hint: session?.user?.email // 必要に応じて現在のメールアドレスをヒントとして提供
      },
    },
  });

  if (error) {
    console.error('Error signing in with Google:', error);
    return;
  }

  if (data?.url) {
    redirect(data.url);
  }
};

// サインアウト処理
export const signOutWithGoogle = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect('/');
  }
};

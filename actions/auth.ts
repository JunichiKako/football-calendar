'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Googleアカウントでサインインする処理
export const signInWithGoogle = async () => {
  const supabase = createClient();

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
        prompt: 'consent',
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
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    redirect('/');
  }
};

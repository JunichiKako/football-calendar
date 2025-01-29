'use server';

import { createClient } from '@/lib/supabase/server';
import { getURL } from '@/utils/getURL';
import { redirect } from 'next/navigation';

// Googleアカウントでサインインする処理
export const signInWithGoogle = async () => {
  const supabase = createClient();
  const baseURL = getURL();
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${baseURL}/api/auth/callback`,
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

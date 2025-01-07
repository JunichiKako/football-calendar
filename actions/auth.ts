'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

const host =
  process.env.NODE_ENV === 'production'
    ? 'https://example.com' // 本番環境のURL
    : 'http://localhost:3000';

export const signInWithGoogle = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${host}/api/auth/callback`,
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

export const signOut = async () => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error('Error signing out:', error);
  }
};

'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { createClientClient } from '@/lib/supabase/client';

type CalendarSubmitBtnProps = {
  events: Array<{
    title: string;
    start: Date;
    end: Date;
    leagueName: string;
  }>;
  disabled: boolean;
};

export function CalendarSubmitBtn({
  events,
  disabled,
}: CalendarSubmitBtnProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const supabase = createClientClient();

  const handleAddToCalendar = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.provider_token) {
        // セッションがない場合は、認証フローを開始
        const { data: authData, error: authError } =
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              scopes: 'https://www.googleapis.com/auth/calendar.app.created',
              redirectTo: `${window.location.origin}/calendar-callback`,
            },
          });

        if (authError) {
          throw new Error('認証に失敗しました');
        }
        return;
      }

      const serializedEvents = events.map((event) => ({
        title: event.title,
        leagueName: event.leagueName,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      }));

      const response = await fetch('/api/calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
          'Provider-Token': session.provider_token,
        },
        body: JSON.stringify({ events: serializedEvents }),
      });

      const data = await response.json();

      // 認証切れの場合
      if (response.status === 401) {
        toast({
          title: '認証の再確認が必要です',
          description: 'もう一度認証を行います',
        });

        // 再認証フローを開始
        const { error: reAuthError } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            scopes: 'https://www.googleapis.com/auth/calendar.app.created',
            redirectTo: `${window.location.origin}/calendar-callback`,
          },
        });

        if (reAuthError) {
          throw new Error('再認証に失敗しました');
        }
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || 'カレンダーへの追加に失敗しました');
      }

      toast({
        title: '追加完了',
        description: `${events.length}件の試合をカレンダーに追加しました`,
      });
    } catch (error) {
      console.error('Error details:', error);
      toast({
        variant: 'destructive',
        title: 'エラーが発生しました',
        description:
          error instanceof Error
            ? error.message
            : 'カレンダーへの追加に失敗しました',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAddToCalendar}
      variant='default'
      size='lg'
      className='fixed bottom-4 right-4 z-10'
      disabled={disabled || loading}
    >
      {loading ? (
        <span className='flex items-center gap-2'>
          <svg
            className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
          >
            <circle
              className='opacity-25'
              cx='12'
              cy='12'
              r='10'
              stroke='currentColor'
              strokeWidth='4'
            />
            <path
              className='opacity-75'
              fill='currentColor'
              d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
            />
          </svg>
          追加中...
        </span>
      ) : (
        <>
          <CalendarIcon className='mr-2 h-5 w-5' />
          Googleカレンダーに追加
        </>
      )}
    </Button>
  );
}

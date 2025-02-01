'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { createClientClient } from '@/lib/supabase/client';
import { addGoogleCalendar } from '@/actions/add-google-calendar';
import { signInWithGoogle } from '@/actions/auth';

type CalendarSubmitBtnProps = {
  events: Array<{
    id: string;
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

  // Client側でGoogleの再認証とカレンダーへの追加を行う
  const handleAddToCalendar = async () => {
    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.provider_token) {
        await signInWithGoogle();
        return;
      }

      const result = await addGoogleCalendar(
        events.map((event) => ({
          ...event,
          id: event.id.toString(),
        })),
        session.provider_token
      );

      if ('error' in result) {
        if (result.error === 'auth_required') {
          await signInWithGoogle();
          return;
        }
        if (result.redirect) {
          toast({
            title: 'カレンダーAPI制限',
            description: 'Googleカレンダーに追加する制限がかかっています',
          });
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 3000);
          return;
        }
        throw new Error(result.error);
      }

      toast({
        title: '追加完了',
        description: `新規で追加された${result.addedEvents}件の試合をカレンダーに追加しました`,
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
            className='animate-spin -ml-1 mr-3 h-5 w-5 text-muted'
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

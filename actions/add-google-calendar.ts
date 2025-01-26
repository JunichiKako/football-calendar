'use server';

import { CalendarEvent } from '@/components/ui/my-ui/calendar';
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

interface DbUser {
  user_id: string;
  stripe_customer_id: string | null;
  subscription_plan: 'free' | 'pro';
  calendar_api_calls_count: number;
  calendar_api_calls_limit: number;
  created_at: string;
  updated_at: string | null;
}

interface GoogleCalendarEvent {
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
}

async function updateMatchSelection(matchId: string) {
  await supabase
    .from('match_selections')
    .update({
      updated_at: new Date().toISOString(),
      synced_to_google: true,
    })
    .eq('match_ids', matchId);
}

export async function addGoogleCalendar(
  events: CalendarEvent[],
  providerToken: string
) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('認証が必要です');

    const { data: userData, error: limitError } = await supabase
      .from('users')
      .select(
        'subscription_plan, calendar_api_calls_count, calendar_api_calls_limit'
      )
      .eq('user_id', user.id)
      .single<DbUser>();

    if (limitError) throw new Error('ユーザー情報の取得に失敗しました');

    if (
      userData.calendar_api_calls_count >= userData.calendar_api_calls_limit
    ) {
      if (userData.subscription_plan === 'free') {
        return {
          error: 'Googleカレンダー追加の制限に達しました',
          redirect: '/plan',
        };
      }
      throw new Error('今月のカレンダーAPI利用制限に達しました');
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({
        calendar_api_calls_count: userData.calendar_api_calls_count + 1,
      })
      .eq('user_id', user.id);

    if (updateError) throw new Error('API利用回数の更新に失敗しました');

    const calendarListResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      }
    );

    if (!calendarListResponse.ok) {
      if (calendarListResponse.status === 401) {
        return { error: 'auth_required' };
      }
      throw new Error('Failed to fetch calendar list');
    }

    const calendarList = await calendarListResponse.json();
    let calendarId = calendarList.items?.find(
      (cal: { summary: string }) => cal.summary === 'Football Matches'
    )?.id;

    if (!calendarId) {
      const calendarResponse = await fetch(
        'https://www.googleapis.com/calendar/v3/calendars',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${providerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: 'Football Matches',
            description: 'Calendar for football match schedules',
          }),
        }
      );

      if (!calendarResponse.ok) {
        throw new Error('Failed to create calendar');
      }

      const calendar = await calendarResponse.json();
      calendarId = calendar.id;
    }

    const promises = events.map(async (event) => {
      const existingEvents = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?q=${encodeURIComponent(
          event.title
        )}`,
        {
          headers: {
            Authorization: `Bearer ${providerToken}`,
          },
        }
      );

      const existingEventsData = await existingEvents.json();
      const isDuplicate = existingEventsData.items?.some(
        (existingEvent: GoogleCalendarEvent) => {
          const existingStart = new Date(existingEvent.start.dateTime);
          const newStart = new Date(event.start);

          return (
            existingEvent.summary === event.title &&
            existingStart.getTime() === newStart.getTime()
          );
        }
      );

      if (isDuplicate) {
        return null;
      }

      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${providerToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary: event.title,
            description: `League: ${event.leagueName}`,
            start: {
              dateTime: new Date(event.start).toISOString(),
              timeZone: 'UTC',
            },
            end: {
              dateTime: new Date(event.end).toISOString(),
              timeZone: 'UTC',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to add event');
      }

      await updateMatchSelection(event.id);

      return response.json();
    });

    const results = (await Promise.all(promises)).filter(
      (result) => result !== null
    );

    return {
      success: true,
      addedEvents: results.length,
      totalEvents: events.length,
    };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to add events to calendar',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

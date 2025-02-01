'use server';

import { CalendarEvent } from '@/components/ui/calendar';
import { createClient } from '@/lib/supabase/server';

const supabase = createClient();

type DbUser = {
  user_id: string;
  stripe_customer_id: string | null;
  subscription_plan: 'free' | 'pro';
  calendar_api_calls_count: number;
  calendar_api_calls_limit: number;
  created_at: string;
  updated_at: string | null;
};

type GoogleCalendarEvent = {
  summary: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
};

// マッチIDに紐づくマッチ選択情報を更新するヘルパー関数
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
    // Userがログインしているか確認
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('認証が必要です');

    // Usersテーブルからユーザー情報を取得
    // Freeプランの場合、カレンダーAPIの制限
    const { data: userData, error: limitError } = await supabase
      .from('users')
      .select(
        'subscription_plan, calendar_api_calls_count, calendar_api_calls_limit'
      )
      .eq('user_id', user.id)
      .single<DbUser>();

    if (limitError) throw new Error('ユーザー情報の取得に失敗しました');

    // カレンダーAPIの制限に達した場合、/planにリダイレクト
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
    // API利用回数を更新
    const { error: updateError } = await supabase
      .from('users')
      .update({
        calendar_api_calls_count: userData.calendar_api_calls_count + 1,
      })
      .eq('user_id', user.id);

    if (updateError) throw new Error('API利用回数の更新に失敗しました');

    // Googleカレンダーのリストを取得
    const calendarListResponse = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList',
      {
        headers: {
          Authorization: `Bearer ${providerToken}`,
        },
      }
    );
    // カレンダーリストの取得に失敗した場合、エラーを返す
    if (!calendarListResponse.ok) {
      if (calendarListResponse.status === 401) {
        return { error: '認証が必要です' };
      }
      throw new Error('カレンダーの作成ができませんでした');
    }

    // Football Tableという名前のカレンダーが存在するか確認
    const calendarList = await calendarListResponse.json();
    let calendarId = calendarList.items?.find(
      (cal: { summary: string }) => cal.summary === 'Football Table'
    )?.id;

    // カレンダーが存在しない場合、新規作成
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
            summary: 'Football Table',
            description: '海外サッカーの試合スケジュール',
          }),
        }
      );

      // カレンダーの作成に失敗した場合、エラーを返す
      if (!calendarResponse.ok) {
        throw new Error('カレンダーの作成ができませんでした');
      }

      // カレンダーIDを取得
      const calendar = await calendarResponse.json();
      calendarId = calendar.id;
    }
    // カレンダーIDをもとにイベントを追加
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
      // 既存のイベントとタイトルと開始時間が一致するものがあるか確認
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

      // 重複がある場合、スキップ
      if (isDuplicate) {
        return null;
      }

      // イベントを追加
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
        throw new Error('イベントの追加に失敗しました');
      }
      // マッチIDに紐づくマッチ選択情報を更新
      await updateMatchSelection(event.id);

      return response.json();
    });
    // イベントの追加結果を取得
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
          : 'カレンダーへの追加に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

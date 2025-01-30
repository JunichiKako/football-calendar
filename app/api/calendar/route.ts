import { CalendarEvent } from '@/components/ui/calendar';
import { NextResponse, NextRequest } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const providerToken = request.headers.get('Provider-Token');
    if (!providerToken) {
      return NextResponse.json(
        {
          error: 'auth_required',
          message: 'Authentication required',
        },
        { status: 401 }
      );
    }

    const { events } = (await request.json()) as { events: CalendarEvent[] };

    // 既存のカレンダーを検索
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
        return NextResponse.json(
          {
            error: 'auth_required',
            message: 'Session expired, please re-authenticate',
          },
          { status: 401 }
        );
      }
      throw new Error('Failed to fetch calendar list');
    }

    const calendarList = await calendarListResponse.json();
    let calendarId = calendarList.items?.find(
      (cal: { summary: string }) => cal.summary === 'Football Matches'
    )?.id;

    // Football Matchesカレンダーが存在しない場合のみ新規作成
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
        const errorText = await calendarResponse.text();
        console.error('Failed to create calendar:', errorText);
        throw new Error(`Failed to create calendar: ${errorText}`);
      }

      const calendar = await calendarResponse.json();
      calendarId = calendar.id;
    }

    // 各イベントを新しいカレンダーに追加（重複チェック付き）
    const promises = events.map(async (event: CalendarEvent) => {
      try {
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
          (existingEvent: GoogleCalendarEvent) =>
            existingEvent.summary === event.title &&
            existingEvent.start.dateTime === new Date(event.start).toISOString()
        );

        if (isDuplicate) {
          console.log('Event already exists, skipping:', event.title);
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
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Calendar API error: ${errorText}`);
        }

        return await response.json();
      } catch (error) {
        console.error('Failed to add event:', error);
        throw error;
      }
    });

    const results = (await Promise.all(promises)).filter(
      (result) => result !== null
    );

    return NextResponse.json({
      success: true,
      calendarId: calendarId,
      addedEvents: results.length,
      totalEvents: events.length,
    });
  } catch (error) {
    console.error('API Error:', error);

    if (
      error instanceof Error &&
      (error.message.includes('401') ||
        error.message.includes('invalid_token') ||
        error.message.includes('expired_token') ||
        error.message.toLowerCase().includes('unauthorized'))
    ) {
      return NextResponse.json(
        {
          error: 'auth_required',
          message: 'Session expired, please re-authenticate',
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to add events to calendar',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

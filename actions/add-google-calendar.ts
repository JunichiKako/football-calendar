'use server';

import { CalendarEvent } from '@/components/ui/my-ui/calendar';

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

export async function addGoogleCalendar(
  events: CalendarEvent[],
  providerToken: string
) {
  try {
    // カレンダーリスト取得
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

    // カレンダーがない場合は作成
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

    // イベント追加
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
        (existingEvent: GoogleCalendarEvent) =>
          existingEvent.summary === event.title &&
          existingEvent.start.dateTime === new Date(event.start).toISOString()
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
      error: 'Failed to add events to calendar',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

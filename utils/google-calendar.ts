/**
 * GoogleカレンダーのURLスキーム用のURL生成
 */

type CalendarEvent = {
  title: string;
  startDate: string; // ISO 8601形式 (utcDate)
  endDate?: string;
  description?: string;
  location?: string;
};

/**
 * 日付をGoogleカレンダー形式（YYYYMMDDTHHmmssZ）に変換
 */
function formatDateForGoogleCalendar(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * GoogleカレンダーのURLを生成
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const { title, startDate, endDate, description, location } = event;

  // 開始時刻
  const start = formatDateForGoogleCalendar(startDate);

  // 終了時刻（指定がなければ2時間後）
  const end = endDate
    ? formatDateForGoogleCalendar(endDate)
    : formatDateForGoogleCalendar(
        new Date(new Date(startDate).getTime() + 2 * 60 * 60 * 1000).toISOString()
      );

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${start}/${end}`,
  });

  if (description) {
    params.append('details', description);
  }

  if (location) {
    params.append('location', location);
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Match型からGoogleカレンダーURLを生成
 */
export function generateMatchCalendarUrl(match: {
  home: string;
  away: string;
  utcDate: string;
  leagueName: string;
}): string {
  return generateGoogleCalendarUrl({
    title: `${match.home} vs ${match.away}`,
    startDate: match.utcDate,
    description: match.leagueName,
  });
}

export default function getDateRange() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);

  const dateFrom = now.toISOString().split('T')[0];
  const dateTo = oneWeekLater.toISOString().split('T')[0];

  return {
    dateFrom,
    dateTo,
  };
}

export function getExtendedDateRange() {
  const { dateFrom } = getDateRange();
  
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);
  
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 14);
  
  const dateTo = endDate.toISOString().split('T')[0];
  
  return { dateFrom, dateTo };
}

export function generateDateBasedCacheKey() {
  const now = new Date();
  const jstOffset = 9 * 60 * 60 * 1000;
  const jstTime = new Date(now.getTime() + jstOffset);
  const jstDate = jstTime.toISOString().split('T')[0];
  
  return `league-data-${jstDate}-v2`;
}

export function toJapaneseTime(date: string | Date) {
  return new Date(
    new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  );
}

export function formatDateTime(date: string | Date) {
  const jpDate = toJapaneseTime(date);

  return {
    date: jpDate.toLocaleDateString('ja-JP', {
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
    }),
    time: jpDate.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export function formatDateForDisplay(dateFrom: string, dateTo: string) {
  const [fromYear, fromMonth, fromDay] = dateFrom.split('-');
  const [, toMonth, toDay] = dateTo.split('-');

  return {
    displayFrom: `${fromYear}/${fromMonth}/${fromDay}`,
    displayTo: `${toMonth}/${toDay}`,
  };
}
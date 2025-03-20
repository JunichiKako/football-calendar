/**
 * 日付範囲を取得する関数
 */
export default function getDateRange() {
  // サーバーとクライアントで一貫した日付を生成
  const now = new Date();
  // UTCで日付を設定
  now.setUTCHours(0, 0, 0, 0);

  // 14日後の日付を取得（UTCベース）
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 14);

  // YYYY-MM-DD形式に変換（UTCベース）
  const dateFrom = now.toISOString().split('T')[0];
  const dateTo = oneWeekLater.toISOString().split('T')[0];

  return {
    dateFrom,
    dateTo,
  };
}

/**
 * 日付を日本時間に変換する関数
 */
export function toJapaneseTime(date: string | Date) {
  return new Date(
    new Date(date).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  );
}

/**
 * 表示用の日付フォーマット
 * @param date 日付オブジェクトまたは日付文字列
 * @returns フォーマットされた日付文字列
 */
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

// 取得した日付を表示用に整形する関数
export function formatDateForDisplay(dateFrom: string, dateTo: string) {
  const [fromYear, fromMonth, fromDay] = dateFrom.split('-');
  const [, toMonth, toDay] = dateTo.split('-');

  return {
    displayFrom: `${fromYear}/${fromMonth}/${fromDay}`,
    displayTo: `${toMonth}/${toDay}`,
  };
}

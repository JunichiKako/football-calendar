/**
 * 日付範囲を取得する関数
 * @returns {Object} dateFrom: 開始日, dateTo: 終了日
 */
export default function getDateRange() {
  // 日本時間で現在の日付を取得
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
  );

  // 日本時間で7日後の日付を取得
  const oneWeekLater = new Date(now);
  oneWeekLater.setDate(now.getDate() + 7);

  // YYYY-MM-DD形式に変換
  const dateFrom = now.toISOString().split('T')[0];
  const dateTo = oneWeekLater.toISOString().split('T')[0];

  return {
    dateFrom,
    dateTo,
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

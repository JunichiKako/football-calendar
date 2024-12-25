// 本日から1週間後の日付を取得する関数
export default function getDateRange() {
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return {
    dateFrom: formatDate(today),
    dateTo: formatDate(oneWeekLater),
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

const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** UTC の ISO 文字列を JST の日付キー(YYYY-MM-DD)に変換する */
export function toJstDateKey(utcDate: string | Date): string {
  const jst = new Date(new Date(utcDate).getTime() + JST_OFFSET_MS);
  return jst.toISOString().slice(0, 10);
}

/** 今日(JST)の日付キー */
export function todayJstKey(): string {
  return toJstDateKey(new Date());
}

function addDays(key: string, days: number): string {
  const d = new Date(`${key}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 今週の範囲。今日から7日後まで */
export function getWeekRange(): { from: string; to: string } {
  const from = todayJstKey();
  return { from, to: addDays(from, 7) };
}

/** 指定した月(YYYY-MM)の範囲 */
export function getMonthRange(month: string): { from: string; to: string } {
  const [year, mon] = month.split('-').map(Number);
  const from = `${month}-01`;
  // 翌月0日 = 当月末日
  const last = new Date(Date.UTC(year, mon, 0)).toISOString().slice(0, 10);
  return { from, to: last };
}

/** 今月(JST)の YYYY-MM */
export function currentMonth(): string {
  return todayJstKey().slice(0, 7);
}

/**
 * 表示用の日付。
 * 時刻未定の試合は utcDate の時刻がダミーなので、JST 変換せず UTC の日付を使う。
 */
export function formatMatchDate(utcDate: string, timeUndecided: boolean): string {
  const key = timeUndecided ? utcDate.slice(0, 10) : toJstDateKey(utcDate);
  const [, month, day] = key.split('-');
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][
    new Date(`${key}T00:00:00Z`).getUTCDay()
  ];
  return `${Number(month)}/${Number(day)}(${weekday})`;
}

/** 表示用の時刻(JST)。時刻が確定している試合にのみ使う */
export function formatMatchTime(utcDate: string): string {
  const jst = new Date(new Date(utcDate).getTime() + JST_OFFSET_MS);
  const hh = String(jst.getUTCHours()).padStart(2, '0');
  const mm = String(jst.getUTCMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** ヘッダーに出す期間表示 */
export function formatRangeLabel(from: string, to: string): string {
  const [fy, fm, fd] = from.split('-');
  const [, tm, td] = to.split('-');
  return `${fy}/${Number(fm)}/${Number(fd)} - ${Number(tm)}/${Number(td)}`;
}

/** 月の表示ラベル (2026-10 -> 2026年10月) */
export function formatMonthLabel(month: string): string {
  const [year, mon] = month.split('-');
  return `${year}年${Number(mon)}月`;
}

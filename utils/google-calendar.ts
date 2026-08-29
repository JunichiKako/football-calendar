/**
 * GoogleカレンダーのURLスキーム用のURL生成
 */
import { Match } from '@/types/match';

/** 日付を YYYYMMDDTHHmmssZ に変換 */
function toDateTimeStamp(isoDate: string): string {
  return new Date(isoDate).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** 日付を YYYYMMDD に変換（終日イベント用） */
function toDateStamp(isoDate: string): string {
  return isoDate.slice(0, 10).replace(/-/g, '');
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/**
 * Match型からGoogleカレンダーURLを生成する。
 *
 * キックオフ時刻が未確定(SCHEDULED)の試合は、utcDate に 0時UTC のダミー値が
 * 入っている。そのまま時刻付きイベントにすると誤った時刻をユーザーの
 * カレンダーに書き込んでしまうため、終日イベントとして追加する。
 */
export function generateMatchCalendarUrl(match: Match): string {
  const details = [
    match.leagueName,
    match.timeUndecided && 'キックオフ時刻は未定です',
  ]
    .filter(Boolean)
    .join('\n');

  const dates = match.timeUndecided
    ? // 終日イベントは終了日を翌日にする（Googleカレンダーの仕様）
      `${toDateStamp(match.utcDate)}/${toDateStamp(addDays(match.utcDate, 1))}`
    : `${toDateTimeStamp(match.utcDate)}/${toDateTimeStamp(
        new Date(new Date(match.utcDate).getTime() + 2 * 60 * 60 * 1000).toISOString()
      )}`;

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `${match.home} vs ${match.away}`,
    dates,
    details,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

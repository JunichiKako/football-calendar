import type { Range } from '@/data/league';
import {
  currentMonth,
  formatMonthLabel,
  formatRangeLabel,
  getWeekRange,
} from '@/utils/getDate';

/** ヘッダーに出す表示範囲のラベル */
export function rangeLabel(range: Range): string {
  if (range.kind === 'all') return '全日程';
  if (range.kind === 'month') return formatMonthLabel(range.month);
  const { from, to } = getWeekRange();
  return formatRangeLabel(from, to);
}

/**
 * 月別表示のデフォルト月。
 * 今月がシーズン内ならそれを、シーズン外なら直近の未来の月、
 * それも無ければ最終月を返す。
 */
export function defaultMonth(months: string[]): string {
  const now = currentMonth();
  if (months.includes(now)) return now;
  return months.find((m) => m >= now) ?? months.at(-1) ?? now;
}

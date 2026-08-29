import 'server-only';
import type { IcsEvent } from '@/utils/ics';

export type FeedSummary = {
  /** 配信対象の名前(リーグ名またはチーム名) */
  names: string[];
  /** 配信に含まれる試合数 */
  count: number;
  /** 最初の試合日 (YYYY-MM-DD)。0件なら null */
  first: string | null;
  /** 最後の試合日 (YYYY-MM-DD)。0件なら null */
  last: string | null;
};

/** 購読前に「何が・何試合・いつからいつまで」を見せるための集計 */
export function summarize(events: IcsEvent[], names: string[]): FeedSummary {
  if (events.length === 0) return { names, count: 0, first: null, last: null };

  const dates = events.map((event) => event.start.toISOString().slice(0, 10)).sort();
  return { names, count: events.length, first: dates[0], last: dates[dates.length - 1] };
}

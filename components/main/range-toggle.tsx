import type { Range } from '@/data/league';
import MonthSelect from './month-select';
import RangeLink from './range-link';

export type PageParams = {
  leagues?: string;
  view?: string;
  range?: string;
  month?: string;
};

type RangeToggleProps = {
  range: Range;
  /** スナップショットに試合が存在する月の一覧 (YYYY-MM) */
  months: string[];
  /** 今週を選んでいるときに出す日付範囲 */
  weekLabel: string;
  /** 他のクエリ(view, leagues)を保つために現在のパラメータを受け取る */
  params: PageParams;
};

const OPTIONS = [
  { value: 'week', label: '今週' },
  { value: 'month', label: '月別' },
  { value: 'all', label: '全日程' },
] as const;

// useSearchParams を使うとクライアント描画に切り替わり、Suspense境界の中身が
// サーバーのHTMLに出なくなる。URLはサーバー側で組み立てる。
function buildUrl(params: PageParams, next: Partial<PageParams>): string {
  const merged = { ...params, ...next };
  const search = new URLSearchParams();
  for (const key of ['view', 'leagues', 'range', 'month'] as const) {
    const value = merged[key];
    if (value) search.set(key, value);
  }
  const query = search.toString();
  return query ? `?${query}` : '?';
}

export default function RangeToggle({
  range,
  months,
  weekLabel,
  params,
}: RangeToggleProps) {
  const month = range.kind === 'month' ? range.month : months[0];

  return (
    <div className='flex items-center gap-2 flex-wrap justify-end'>
      {range.kind === 'week' && (
        <span className='text-muted-foreground text-sm tabular-nums'>{weekLabel}</span>
      )}

      {range.kind === 'month' && (
        <MonthSelect
          months={months}
          current={month}
          hrefs={Object.fromEntries(
            months.map((m) => [m, buildUrl(params, { range: 'month', month: m })])
          )}
        />
      )}

      <div className='inline-flex rounded-md border overflow-hidden'>
        {OPTIONS.map(({ value, label }) => (
          <RangeLink
            key={value}
            href={buildUrl(params, {
              range: value,
              month: value === 'month' ? month : undefined,
            })}
            active={range.kind === value}
          >
            {label}
          </RangeLink>
        ))}
      </div>
    </div>
  );
}

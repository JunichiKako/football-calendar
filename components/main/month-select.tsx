'use client';

import { useRouter } from 'next/navigation';
import { formatMonthLabel } from '@/utils/getDate';

type MonthSelectProps = {
  months: string[];
  current: string;
  /** 月ごとの遷移先URL。サーバー側で組み立てたものを受け取る */
  hrefs: Record<string, string>;
};

export default function MonthSelect({ months, current, hrefs }: MonthSelectProps) {
  const router = useRouter();

  return (
    <select
      aria-label='表示する月'
      value={current}
      onChange={(event) => router.push(hrefs[event.target.value])}
      className='h-8 rounded-md border bg-background px-2 text-sm'
    >
      {months.map((month) => (
        <option key={month} value={month}>
          {formatMonthLabel(month)}
        </option>
      ))}
    </select>
  );
}

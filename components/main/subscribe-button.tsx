'use client';

import { CalendarPlus } from 'lucide-react';

type SubscribeButtonProps = {
  leagueLabel: string;
  /** 購読URL(絶対URL)。サーバー側で組み立てたものを受け取る */
  feedUrl: string;
  /** ボタンに出す文言。既定は「カレンダーに購読」 */
  label?: string;
};

export default function SubscribeButton({
  leagueLabel,
  feedUrl,
  label = 'カレンダーに購読',
}: SubscribeButtonProps) {
  // Googleカレンダーの「URLで追加」を開く。
  // インポート(1回きりのコピー)ではなく購読として登録されるため、
  // 以降の日程変更がGoogle側の取得タイミングで反映される。
  const googleUrl = `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(feedUrl)}`;

  return (
    <a
      href={googleUrl}
      target='_blank'
      rel='noopener noreferrer'
      title={`${leagueLabel}の日程をGoogleカレンダーに購読します。日程変更は自動で反映されます(反映まで最大1日)`}
      aria-label={`${leagueLabel}の日程を購読`}
      className='inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
    >
      <CalendarPlus className='size-3.5' />
      {label}
    </a>
  );
}

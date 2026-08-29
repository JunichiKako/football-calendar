'use client';

import { useState } from 'react';
import { CalendarPlus, ExternalLink, X } from 'lucide-react';

type SubscribeButtonProps = {
  leagueLabel: string;
  /** 購読URL(絶対URL)。サーバー側で組み立てたものを受け取る */
  feedUrl: string;
  /** ボタンに出す文言。既定は「カレンダーに購読」 */
  label?: string;
};

/**
 * Googleカレンダーの「URLで追加」を開くURLを作る。
 *
 * cid に https:// のURLを渡すと「カレンダーを追加できません。URLを確認して
 * ください」と拒否されるため、webcal:// に置き換えて渡す必要がある。
 * インポート(1回きりのコピー)ではなく購読として登録されるので、以降の
 * 日程変更がGoogle側の取得タイミングで反映される。
 */
export function googleSubscribeUrl(feedUrl: string): string {
  const webcal = feedUrl.replace(/^https?:\/\//, 'webcal://');
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`;
}

export default function SubscribeButton({
  leagueLabel,
  feedUrl,
  label = 'カレンダーに購読',
}: SubscribeButtonProps) {
  // Googleのダイアログは webcal:// の生URLしか表示しないため、何が起きるのか
  // 分からない。飛ぶ前にこちらで説明する。
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-label={`${leagueLabel}の日程を購読`}
        className='inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <CalendarPlus className='size-3.5' />
        {label}
      </button>

      {open && (
        <div className='fixed inset-0 z-[60] flex items-center justify-center p-4'>
          <button
            type='button'
            aria-label='閉じる'
            onClick={() => setOpen(false)}
            className='absolute inset-0 cursor-default bg-black/40'
          />

          <div className='relative w-full max-w-md rounded-lg border bg-background shadow-xl'>
            <div className='flex items-start justify-between gap-3 border-b px-4 py-3'>
              <p className='text-sm font-medium'>{leagueLabel}の日程を購読</p>
              <button
                type='button'
                onClick={() => setOpen(false)}
                aria-label='閉じる'
                className='-mr-1 shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                <X className='size-4' />
              </button>
            </div>

            <div className='space-y-3 px-4 py-4 text-sm'>
              <p className='leading-relaxed'>
                Googleカレンダーが開きます。
                <span className='font-medium'>「追加」</span>
                を押すと購読が始まります。
              </p>
              <ul className='space-y-1.5 text-xs leading-relaxed text-muted-foreground'>
                <li>・キックオフ時刻が変わると自動で反映されます</li>
                <li>・反映のタイミングはGoogle側が決めるため最大1日かかります</li>
                <li>・不要になったらGoogleカレンダーの左側から削除できます</li>
              </ul>
            </div>

            <div className='flex justify-end gap-2 border-t px-4 py-3'>
              <button
                type='button'
                onClick={() => setOpen(false)}
                className='rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                やめる
              </button>
              <a
                href={googleSubscribeUrl(feedUrl)}
                target='_blank'
                rel='noopener noreferrer'
                onClick={() => setOpen(false)}
                className='inline-flex items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background transition-opacity hover:opacity-90'
              >
                <ExternalLink className='size-3.5' />
                Googleカレンダーを開く
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

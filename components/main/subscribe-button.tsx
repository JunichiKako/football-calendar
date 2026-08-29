'use client';

import { useEffect, useState } from 'react';
import { CalendarPlus, ExternalLink, X } from 'lucide-react';

type SubscribeButtonProps = {
  leagueLabel: string;
  /** 購読URL(絶対URL)。サーバー側で組み立てたものを受け取る */
  feedUrl: string;
  /** ボタンに出す文言。既定は「カレンダーに購読」 */
  label?: string;
};

type FeedSummary = {
  names: string[];
  count: number;
  first: string | null;
  last: string | null;
};

/** 2026-08-21 -> 2026年8月21日 */
function formatDate(value: string): string {
  const [year, month, day] = value.split('-');
  return `${year}年${Number(month)}月${Number(day)}日`;
}

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
  const [summary, setSummary] = useState<FeedSummary | null>(null);

  // 何試合・いつからいつまで入るのかは、配信URLの .json から取る。
  // お気に入りは選択したチームの組み合わせ次第で変わるため、サーバー側で
  // 事前に用意できない。開いたときだけ取りに行く。
  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    fetch(feedUrl.replace(/\.ics$/, '.json'), { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: FeedSummary | null) => setSummary(data))
      .catch(() => {
        // 集計が取れなくても購読自体はできるので、黙って諦める
      });

    return () => controller.abort();
  }, [open, feedUrl]);

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
              {summary && (
                <div className='space-y-2 rounded-md border bg-muted/40 px-3 py-2'>
                  {summary.names.length > 0 && (
                    <div className='flex flex-wrap gap-1'>
                      {summary.names.map((name) => (
                        <span
                          key={name}
                          className='rounded bg-background px-1.5 py-0.5 text-xs'
                        >
                          {name}
                        </span>
                      ))}
                    </div>
                  )}
                  {summary.count > 0 ? (
                    <div>
                      <p className='font-medium tabular-nums'>
                        {summary.count.toLocaleString()}試合
                      </p>
                      {summary.first && summary.last && (
                        <p className='mt-0.5 text-xs text-muted-foreground tabular-nums'>
                          {formatDate(summary.first)} 〜 {formatDate(summary.last)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className='text-xs text-muted-foreground'>
                      現在この日程には試合がありません。公開され次第、購読しているカレンダーに追加されます。
                    </p>
                  )}
                </div>
              )}

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

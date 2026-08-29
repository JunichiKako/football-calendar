'use client';

import { useState, useSyncExternalStore } from 'react';
import { Star, X } from 'lucide-react';
import Image from 'next/image';
import type { TeamOption } from '@/data/league';
import {
  getFavorites,
  getServerFavorites,
  setFavorites,
  subscribeFavorites,
} from '@/utils/favorites';
import { cn } from '@/lib/utils';
import FavoriteFilter from './favorite-filter';
import SubscribeButton from './subscribe-button';

type FavoriteTeamsProps = {
  groups: { league: string; teams: TeamOption[] }[];
  /** 購読URLの組み立てに使うベースURL */
  baseUrl: string;
};

export default function FavoriteTeams({ groups, baseUrl }: FavoriteTeamsProps) {
  const [open, setOpen] = useState(false);
  const [filtering, setFiltering] = useState(false);

  // localStorage はサーバーには無いので、サーバー描画時は空として扱い、
  // ハイドレーション後に実際の値へ切り替わる。
  const favorites = useSyncExternalStore(
    subscribeFavorites,
    getFavorites,
    getServerFavorites
  );

  const toggle = (id: number) => {
    const next = favorites.includes(id)
      ? favorites.filter((teamId) => teamId !== id)
      : [...favorites, id];
    setFavorites(next);
    if (next.length === 0) setFiltering(false);
  };

  const feedUrl = `${baseUrl}/calendar/teams/${[...favorites]
    .sort((a, b) => a - b)
    .join('+')}.ics`;

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {filtering && <FavoriteFilter teamIds={favorites} />}

      {favorites.length > 0 && (
        <button
          type='button'
          onClick={() => setFiltering((value) => !value)}
          aria-pressed={filtering}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs transition-colors',
            filtering
              ? 'border-amber-500 bg-amber-500/10 text-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          )}
        >
          お気に入りのみ
        </button>
      )}

      <button
        type='button'
        onClick={() => setOpen(true)}
        aria-expanded={open}
        className='inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
      >
        <Star
          className={cn(
            'size-3.5',
            favorites.length > 0 && 'fill-current text-amber-500'
          )}
        />
        お気に入り
        {favorites.length > 0 && (
          <span className='tabular-nums'>{favorites.length}</span>
        )}
      </button>

      {favorites.length > 0 && (
        <SubscribeButton
          leagueLabel={`お気に入り${favorites.length}チーム`}
          feedUrl={feedUrl}
          label='お気に入りを購読'
        />
      )}

      {/*
        パネルは fixed で出す。メイン領域が overflow-auto なので absolute だと
        スクロールに追従して sticky なヘッダー(z-50)の下に潜ってしまうため。
        z-index もヘッダーより手前にする。
      */}
      {open && (
        <div className='fixed inset-0 z-[60] flex items-start justify-center p-4 sm:p-8'>
          <button
            type='button'
            aria-label='閉じる'
            onClick={() => setOpen(false)}
            className='absolute inset-0 cursor-default bg-black/40'
          />

          <div className='relative flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-lg border bg-background shadow-xl'>
            <div className='flex items-center justify-between border-b px-4 py-3'>
              <div>
                <p className='text-sm font-medium'>お気に入りチーム</p>
                <p className='mt-0.5 text-xs text-muted-foreground'>
                  この端末のブラウザにだけ保存されます
                </p>
              </div>
              <button
                type='button'
                onClick={() => setOpen(false)}
                aria-label='閉じる'
                className='rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'
              >
                <X className='size-4' />
              </button>
            </div>

            <div className='overflow-auto p-4'>
              {groups.map((group) => (
                <div key={group.league} className='mb-4 last:mb-0'>
                  <p className='mb-2 text-xs font-medium text-muted-foreground'>
                    {group.league}
                  </p>
                  <div className='grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4'>
                    {group.teams.map((team) => {
                      const active = favorites.includes(team.id);
                      return (
                        <button
                          key={team.id}
                          type='button'
                          onClick={() => toggle(team.id)}
                          aria-pressed={active}
                          className={cn(
                            'flex items-center gap-2 rounded-md border p-1.5 text-left text-xs transition-colors',
                            active
                              ? 'border-amber-500 bg-amber-500/10'
                              : 'border-transparent hover:bg-accent'
                          )}
                        >
                          {team.crest && (
                            <span className='grid size-6 shrink-0 place-items-center rounded bg-white'>
                              <Image
                                src={team.crest}
                                alt=''
                                width={18}
                                height={18}
                              />
                            </span>
                          )}
                          <span className='truncate'>{team.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {favorites.length > 0 && (
              <div className='flex items-center justify-between gap-3 border-t px-4 py-3'>
                <p className='text-xs text-muted-foreground'>
                  {favorites.length}チーム選択中
                </p>
                <button
                  type='button'
                  onClick={() => setFavorites([])}
                  className='text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground'
                >
                  すべて解除
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

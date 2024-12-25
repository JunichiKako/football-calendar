'use client';

import { Match } from '@/types/match';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

type LeagueByGroupProps = {
  [key: string]: {
    leagueId: number;
    leagueName: string;
    leagueImg: string;
    matches: Match[];
  };
};

type FormValues = {
  leagues: string[];
};

export function CheckForm({
  leagueByGroup,
}: {
  leagueByGroup: LeagueByGroupProps;
}) {
  // 現状のクエリパラメータを取得
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramsLeagues = searchParams.get('leagues');
  const selectedMatches = searchParams.get('selectedMatches');
  const view = searchParams.get('view') || 'league';

  const { register, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { leagues: searchParams.get('leagues')?.split(',') || [] },
  });

  useEffect(() => {
    reset({
      leagues: paramsLeagues ? paramsLeagues.split(',') : [],
    });
  }, [paramsLeagues, reset]);

  const selectedLeagues = watch('leagues');

  const handleLeagueToggle = (leagueName: string) => {
    const newSelectedLeagues = toggleLeagueSelection(
      selectedLeagues,
      leagueName
    );

    // フォームフィールドの値を更新
    setValue('leagues', newSelectedLeagues);

    updateQueryParams(newSelectedLeagues);
  };

  const toggleLeagueSelection = (
    selectedLeagues: string[],
    leagueName: string
  ) => {
    return selectedLeagues.includes(leagueName)
      ? selectedLeagues.filter((league) => league !== leagueName)
      : [...selectedLeagues, leagueName];
  };

  const updateQueryParams = (newSelectedLeagues: string[]) => {
    const params = new URLSearchParams(window.location.search);

    // リーグの更新
    if (newSelectedLeagues.length > 0) {
      params.set('leagues', newSelectedLeagues.join(','));
    } else {
      params.delete('leagues');
    }

    // 既存のパラメータを維持
    if (selectedMatches) {
      params.set('selectedMatches', selectedMatches);
    }
    params.set('view', view);

    router.replace(`?${params.toString()}`);
  };

  return (
    <div className='space-y-1'>
      {Object.keys(leagueByGroup).map((leagueName) => {
        const league = leagueByGroup[leagueName];
        return (
          <div key={league.leagueId} className='p-2 rounded-lg cursor-pointer'>
            <label className='cursor-pointer transition hover:bg-gray-200 dark:hover:bg-accent p-2 rounded-lg opacity-50 border border-transparent has-[:checked]:border-[#005C69] has-[:checked]:bg-[#005C69] dark:has-[:checked]:border-[#445E93] dark:has-[:checked]:bg-[#445E93] has-[:checked]:text-white has-[:checked]:opacity-100 flex items-center gap-3'>
              <input
                type='checkbox'
                value={leagueName}
                {...register('leagues')}
                onChange={() => handleLeagueToggle(leagueName)}
                className='hidden'
              />
              <div className='size-10 bg-white rounded-lg grid place-items-center'>
                <Image
                  src={league.leagueImg}
                  alt={league.leagueName}
                  width={32}
                  height={32}
                />
              </div>
              <p>{league.leagueName}</p>
            </label>
          </div>
        );
      })}
    </div>
  );
}

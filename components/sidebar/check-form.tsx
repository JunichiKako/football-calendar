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
  const { register, watch, setValue, reset } = useForm<FormValues>({
    defaultValues: { leagues: searchParams.get('leagues')?.split(',') || [] },
  });

  useEffect(() => {
    if (paramsLeagues) {
      reset({ leagues: paramsLeagues.split(',') });
    }
  }, [paramsLeagues, reset]);

  const selectedLeagues = watch('leagues');

  const handleLeagueToggle = (leagueName: string) => {
    // 現在の選択状態に基づいて新しい選択状態を決定
    const newSelectedLeagues = selectedLeagues.includes(leagueName)
      ? selectedLeagues.filter((league) => league !== leagueName)
      : [...selectedLeagues, leagueName];

    // フォームフィールドの値を更新
    setValue('leagues', newSelectedLeagues);

    // 現在のクエリパラメータを取得
    const params = new URLSearchParams(window.location.search);

    // 新しい選択状態に基づいてクエリパラメータを設定
    if (newSelectedLeagues.length > 0) {
      params.set('leagues', newSelectedLeagues.join(','));
    } else {
      params.delete('leagues');
    }
    // 新しいURLを設定
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="space-y-1">
      {Object.keys(leagueByGroup).map((leagueName) => {
        const league = leagueByGroup[leagueName];
        return (
          <label
            key={league.leagueId}
            className="cursor-pointer transition hover:bg-accent p-2 rounded-lg opacity-50 border border-transparent has-[:checked]:border-yellow-400 has-[:checked]:bg-yellow-400 has-[:checked]:text-white has-[:checked]:opacity-100 flex items-center gap-3"
          >
            <input
              type="checkbox"
              value={leagueName}
              {...register('leagues')}
              onChange={() => handleLeagueToggle(leagueName)}
              className="hidden"
            />
            {/* <div className="size-4 flex items-center justify-center border border-gray-300 rounded-full transition-colors duration-300">
                  {selectedLeagues.includes(leagueName) && (
                    <svg
                      className="size-8 text-blue-700"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>
                  )}
                </div> */}
            <div className="size-10 bg-white rounded-lg grid place-items-center">
              <Image
                src={league.leagueImg}
                alt={league.leagueName}
                width={32}
                height={32}
              />
            </div>
            <p className="ml-2">{league.leagueName}</p>
          </label>
        );
      })}
    </div>
  );
}

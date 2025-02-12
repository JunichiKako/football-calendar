'use client';

import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Match } from '@/types/match';
import { Menu } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import LeagueToggle from './sidebar/league-toggle';

type leagueByGroupProps = {
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

export default function MobileNav({
  leagueByGroup,
}: {
  leagueByGroup: leagueByGroupProps;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { register, watch, setValue } = useForm<FormValues>({
    defaultValues: { leagues: [] },
  });
  const selectedLeagues = watch('leagues');

  useEffect(() => {
    const leagues = searchParams.get('leagues');
    if (leagues) {
      setValue('leagues', leagues.split(','));
    }
  }, [searchParams, setValue]);

  const handleLeagueToggle = (leagueName: string) => {
    const newSelectedLeagues = selectedLeagues.includes(leagueName)
      ? selectedLeagues.filter((league) => league !== leagueName)
      : [...selectedLeagues, leagueName];
    setValue('leagues', newSelectedLeagues);

    const params = new URLSearchParams(window.location.search);

    if (newSelectedLeagues.length > 0) {
      params.set('leagues', newSelectedLeagues.join(','));
    } else {
      params.delete('leagues');
    }
    router.replace(`?${params.toString()}`);
  };

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button size='icon' className='xl:hidden' variant='outline'>
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side='left' className='w-[280px] sm:w-[350px]'>
          <SheetHeader>
            <SheetTitle className='text-lg font-bold'>リーグを選ぶ</SheetTitle>
          </SheetHeader>
          <div className='mt-4 h-[calc(90dvh-100px)] overflow-y-auto'>
            <div className='space-y-1'>
              {Object.keys(leagueByGroup).map((leagueName) => {
                const league = leagueByGroup[leagueName];
                return (
                  <div
                    key={league.leagueId}
                    className='p-2 rounded-lg cursor-pointer'
                  >
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
          </div>

          <LeagueToggle />
        </SheetContent>
      </Sheet>
    </>
  );
}

// app/components/match-card.tsx
import { Match } from '@/types/match';
import Image from 'next/image';
import { TeamLabel } from '@/utils/team-label';
import { saveMatchSelections } from '@/actions/add-my-calendar';
import { SelectedMatchSubmitBtn } from './selected-match-submit-btn';
import MatchCheckbox from './match-check-box';
import { cn } from '@/lib/utils';
import { Suspense } from 'react';

type MatchCardProps = {
  filteredLeagues: {
    [leagueName: string]: {
      leagueId: number;
      leagueName: string;
      leagueImg: string;
      matches: Match[];
    };
  };
  selectedMatches: string[];
};

export default async function SelectedMatchCard({
  filteredLeagues,
  selectedMatches,
}: MatchCardProps) {

  // 選択した試合を送信かつ保存する関数
  async function handleSubmit(formData: FormData) {
    const submittedMatches = formData.getAll('matches') as string[]; // 新しい名前
    if (submittedMatches.length === 0) {
      return { error: '少なくとも1つのマッチを選択してください。' };
    }
    await saveMatchSelections(submittedMatches);
  }

  return (
    <form action={handleSubmit} className='relative pb-20'>
      {Object.entries(filteredLeagues).map(([leagueName, league]) => {
        const isPremierLeague = leagueName === 'Premier League';
        const isChampionsLeague = leagueName === 'UEFA Champions League';

        return (
          <div key={leagueName} className='mb-16'>
            <h2 className='text-xl font-bold mb-4 flex items-center'>
              <Image
                src={league.leagueImg}
                alt={leagueName}
                width={24}
                height={24}
                className={cn('mr-2', {
                  'dark:brightness-0 dark:invert':
                    isPremierLeague || isChampionsLeague,
                })}
              />
              {leagueName}
            </h2>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6'>
              {league.matches.map((match) => (
                <div key={match.matchId} className='relative'>
                  <Suspense>
                    <MatchCheckbox
                      matchId={match.matchId}
                      isSelected={selectedMatches.includes(
                        match.matchId.toString()
                      )}
                    />
                  </Suspense>
                  <label
                    htmlFor={match.matchId.toString()}
                    className='group p-4 shadow-lg rounded-lg flex justify-between items-center border cursor-pointer
                  transition-all duration-200 peer-checked:bg-gray-50 peer-checked:border-blue-500 dark:peer-checked:bg-accent dark:hover:bg-accent dark:hover:text-white hover:bg-gray-50 '
                  >
                    <div className='flex-1 space-y-3'>
                      <TeamLabel
                        imageURL={match.homeEmblemUrl}
                        name={match.home}
                      />
                      <TeamLabel
                        imageURL={match.awayEmblemUrl}
                        name={match.away}
                      />
                    </div>
                    <div className='border-l-2 border-border dark:[.peer:checked+label_&]:border-white/20 dark:group-hover:border-white/20 dark:group-hover:[.peer:checked+label_&]:border-white/20 h-10'></div>
                    <div className='flex justify-center pl-4 flex-col items-center'>
                      <div className='text-sm font-semibold mb-0.5'>
                        {match.matchDate}
                      </div>
                      <time className='text-base tabular-nums font-medium'>
                        {match.matchTime}
                      </time>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div className='fixed bottom-4 right-4 z-10'>
        <SelectedMatchSubmitBtn />
      </div>
    </form>
  );
}

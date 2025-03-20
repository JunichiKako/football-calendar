import { Match } from '@/types/match';
import Image from 'next/image';
import { TeamLabel } from '@/utils/team-label';
import { saveMatchSelections } from '@/actions/my-calendar';
import { SelectedMatchSubmitBtn } from './selected-match-submit-btn';
import { cn } from '@/lib/utils';
import MatchCheckbox from './match-check-box';
import { Suspense } from 'react';
import { groupMatchesByLeague } from '@/utils/group-matches';

type SelectedTimeMatchCardProps = {
  matches: Match[];
  selectedMatches: string[];
};

export default function SelectedTimeMatchCard({
  matches,
  selectedMatches,
}: SelectedTimeMatchCardProps) {
  // 時間順かつリーグごとにグループ化
  const groupedMatches = groupMatchesByLeague(matches);

  return (
    <form action={saveMatchSelections} className='relative pb-20'>
      {groupedMatches.map((matchGroup, groupIndex) => {
        const { leagueName, leagueImg } = matchGroup[0];
        const isPremierLeague = leagueName === 'Premier League';
        const isChampionsLeague = leagueName === 'UEFA Champions League';

        return (
          <div key={groupIndex} className='mb-6'>
            <div className='flex items-center justify-between mb-4'>
              <div className='inline-block'>
                <div className='py-2 rounded-md flex'>
                  <Image
                    src={leagueImg}
                    alt={leagueName}
                    width={32}
                    height={32}
                    className={cn('mr-2', {
                      'dark:brightness-0 dark:invert':
                        isPremierLeague || isChampionsLeague,
                    })}
                  />
                  <h2 className='text-lg font-bold'>{leagueName}</h2>
                </div>
              </div>
            </div>
            <div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-6'>
              {matchGroup.map((match) => (
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

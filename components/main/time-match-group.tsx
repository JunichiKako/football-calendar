import { Match } from '@/types/match';
import Image from 'next/image';
import MatchCard from '@/components/main/match-card'; 
import { cn } from '@/lib/utils';

type TimeMatchCardProps = {
  matches: Match[]; 
};
// ２次元配列になっている試合情報をグループごとに表示する
export default function TimeMatchGroup({ matches }: TimeMatchCardProps) {
  
  if (matches.length === 0) {
    return null; 
  }

  // グループ内の最初の試合からリーグ名とリーグ画像を取得
  const { leagueName, leagueImg } = matches[0];
  const isPremierLeague = leagueName === 'Premier League';
  const isChampionsLeague = leagueName === 'UEFA Champions League';

  return (
    <div className='mb-6'>
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
      <MatchCard matches={matches} />
    </div>
  );
}

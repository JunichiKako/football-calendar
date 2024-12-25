import { Match } from '@/types/match';
import Image from 'next/image';
import MatchCard from '@/components/main/match-card'; // MatchCardコンポーネントをインポート
import { cn } from '@/lib/utils';

type TimeMatchCardProps = {
  matches: Match[]; // `matches` を受け取るように修正
};

export default function TimeMatchGroup({ matches }: TimeMatchCardProps) {
  if (matches.length === 0) {
    return null; // 試合がない場合は何も表示しない
  }

  // グループ内の最初の試合からリーグ名とリーグ画像を取得
  const { leagueName, leagueImg } = matches[0];
  const isPremierLeague = leagueName === 'Premier League';

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
                'premier-league-logo': isPremierLeague,
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

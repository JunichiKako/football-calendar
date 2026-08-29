import { getLeagueByGroup } from '@/data/league';
import { cn } from '@/lib/utils';
import getDateRange, { formatDateForDisplay } from '@/utils/getDate';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import MatchCard from './match-card';
import {
  STREAMING_LABELS,
  STREAMING_COLORS,
  getLeagueDefault
} from '@/utils/streaming';

type LeagueListProps = {
  selectedLeagues: string[];
};

export default async function LeagueList({
  selectedLeagues,
}: LeagueListProps) {
  // ここで一括してリーグでグループ化されたリーグデータを取得する
  const leagueGroup = await getLeagueByGroup();

  // サイドバーで選択されたリーグがあれば、選択されたリーグだけを表示する関数。なければ全てのリーグを表示
  const filteredLeagues =
    selectedLeagues.length > 0
      ? Object.fromEntries(
          Object.entries(leagueGroup).filter(([leagueName]) =>
            selectedLeagues.includes(leagueName)
          )
        )
      : leagueGroup;

  // 実際に表示する試合データがあるかどうかをチェック
  const hasAnyMatches = Object.values(filteredLeagues).some(
    (league) => league.matches.length > 0
  );

  //表示されている日付を取得するために呼び出し
  const { dateFrom, dateTo } = getDateRange();
  // 表示用に日付を整形
  const { displayFrom, displayTo } = formatDateForDisplay(dateFrom, dateTo);

  // 試合がない場合のメッセージコンポーネント
  const NoMatchesMessage = () => (
    <div className='py-8 px-4 text-center'>
      <h2 className='text-xl font-semibold mb-2'>
        この期間のスケジュールでは試合情報がありません。
      </h2>
      <p className='text-gray-600'>リーグが再開するのをお待ちください。</p>
    </div>
  );

  return (
    <>
      <div className='border-b pb-4 pt-4 mb-8 flex justify-between'>
        <p className='text-md'>リーグ別</p>
        <p className='flex text-muted-foreground text-sm gap-2 items-center'>
          <Calendar className='size-5' />
          {displayFrom} - {displayTo}
        </p>
      </div>

      {!hasAnyMatches ? (
        <NoMatchesMessage />
      ) : (
        <div className='space-y-20'>
          {Object.entries(filteredLeagues).map(([leagueName, league]) => {
            const isPremierLeague = leagueName === 'Premier League';
            const isChampionsLeague = leagueName === 'UEFA Champions League';
            return (
              <div key={leagueName}>
                <div className='flex items-center justify-between mb-8'>
                  <div className='inline-block'>
                    <div className='py-2 rounded-md flex items-center'>
                      <Image
                        src={league.leagueImg}
                        alt={leagueName}
                        width={32}
                        height={32}
                        className={cn('mr-2', {
                          'dark:brightness-0 dark:invert':
                            isPremierLeague || isChampionsLeague,
                        })}
                      />
                      <h2 className='text-lg font-bold'>{league.leagueName}</h2>
                      {getLeagueDefault(leagueName).map((service) => (
                        <span
                          key={service}
                          className={`ml-2 text-[10px] px-1.5 py-0.5 rounded ${STREAMING_COLORS[service]}`}
                        >
                          {STREAMING_LABELS[service]}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <MatchCard matches={league.matches} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

import { getAvailableMonths, getLeagueByGroup, type Range } from '@/data/league';
import { cn } from '@/lib/utils';
import { rangeLabel } from '@/utils/range-label';
import RangeToggle, { type PageParams } from './range-toggle';
import Image from 'next/image';
import MatchCard from './match-card';

// 試合がない場合のメッセージ
function NoMatchesMessage() {
  return (
    <div className='py-8 px-4 text-center'>
      <h2 className='text-xl font-semibold mb-2'>
        この期間のスケジュールでは試合情報がありません。
      </h2>
      <p className='text-gray-600'>リーグが再開するのをお待ちください。</p>
    </div>
  );
}

type LeagueListProps = {
  selectedLeagues: string[];
  range: Range;
  params: PageParams;
};

export default async function LeagueList({
  selectedLeagues,
  range,
  params,
}: LeagueListProps) {
  // ここで一括してリーグでグループ化されたリーグデータを取得する
  const leagueGroup = await getLeagueByGroup(range);

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


  return (
    <>
      <div className='border-b mb-8 flex flex-wrap items-center justify-between gap-3 min-h-[60px]'>
        <p className='text-md'>リーグ別</p>
        <RangeToggle
          range={range}
          months={getAvailableMonths()}
          weekLabel={rangeLabel({ kind: 'week' })}
          params={params}
        />
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

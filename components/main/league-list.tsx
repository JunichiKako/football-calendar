import { getLeagueByGroup } from '@/data/league';
import { cn } from '@/lib/utils';
import getDateRange, { formatDateForDisplay } from '@/utils/getDate';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import MatchCard from './match-card';
import SelectedMatchCard from './selected-match-card';
import { currentUser } from '@/data/auth';

type LeagueListProps = {
  selectedLeagues: string[];
  selectedMatches: string[];
  hasMatches?: boolean; // 試合があるかどうかのフラグ
};

export default async function LeagueList({
  selectedLeagues,
  selectedMatches,
  hasMatches = true,
}: LeagueListProps) {
  // ここで一括してリーグでグループ化されたリーグデータを取得する
  const leagueGroup = await getLeagueByGroup();
  // userの有無で表示を変える
  const user = await currentUser();

  // サイドバーで選択されたリーグがあれば、選択されたリーグだけを表示する関数。なければ全てのリーグを表示
  const filteredLeagues =
    selectedLeagues.length > 0
      ? Object.fromEntries(
          Object.entries(leagueGroup).filter(([leagueName]) =>
            selectedLeagues.includes(leagueName)
          )
        )
      : leagueGroup;

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

  // ユーザーがいれば選択できる試合のコンポーネント/なければ試合情報だけを見れるコンポーネントを表示
  return (
    <>
      <div className='border-b pb-4 pt-4 mb-8 flex justify-between'>
        <p className='text-md'>リーグ別</p>
        <p className='flex text-muted-foreground text-sm gap-2 items-center'>
          <Calendar className='size-5' />
          {displayFrom} - {displayTo}
        </p>
      </div>

      {!hasMatches ? (
        <NoMatchesMessage />
      ) : user ? (
        <SelectedMatchCard
          filteredLeagues={filteredLeagues}
          selectedMatches={selectedMatches}
        />
      ) : (
        <div className='space-y-20'>
          {Object.entries(filteredLeagues).map(([leagueName, league]) => {
            const isPremierLeague = leagueName === 'Premier League';
            const isChampionsLeague = leagueName === 'UEFA Champions League';
            return (
              <div key={leagueName}>
                <div className='flex items-center justify-between mb-8'>
                  <div className='inline-block'>
                    <div className='py-2 rounded-md flex'>
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

import { getLeagueMatchesByTime } from '@/data/league';
import { Match } from '@/types/match';
import getDateRange, { formatDateForDisplay } from '@/utils/getDate';
import { Calendar } from 'lucide-react';
import TimeMatchGroup from './time-match-group';
import { groupMatchesByLeague } from '@/utils/group-matches';

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

type TimeScheduleListProps = {
  selectedLeagues: string[];
};

export default async function TimeScheduleList({
  selectedLeagues,
}: TimeScheduleListProps) {
  // 全てのリーグを時間順並べた試合を取得
  const allMatches: Match[] = await getLeagueMatchesByTime();

  // `selectedLeagues` に基づいて試合をフィルタリング
  const filteredMatches =
    selectedLeagues.length > 0
      ? allMatches.filter((match) => selectedLeagues.includes(match.leagueName))
      : allMatches;

  // 実際に表示する試合データがあるかどうかをチェック
  const hasAnyMatches = filteredMatches.length > 0;

  // 時間順かつリーグごとにグループ化するための関数
  const groupedMatches = groupMatchesByLeague(filteredMatches);

  // 日付の範囲を取得と表示用のフォーマット
  const { dateFrom, dateTo } = getDateRange();
  const { displayFrom, displayTo } = formatDateForDisplay(dateFrom, dateTo);

  return (
    <>
      <div className='border-b pb-4 pt-4 mb-8 flex justify-between'>
        <p className='text-md'>試合時間順</p>
        <p className='flex text-muted-foreground text-sm gap-2 items-center'>
          <Calendar className='size-5' />
          {displayFrom} - {displayTo}
        </p>
      </div>

      {!hasAnyMatches ? (
        <NoMatchesMessage />
      ) : (
        <div>
          {groupedMatches.map((matches, index) => (
            <TimeMatchGroup key={index} matches={matches} />
          ))}
        </div>
      )}
    </>
  );
}

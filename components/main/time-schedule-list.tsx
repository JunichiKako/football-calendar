import { getAvailableMonths, getLeagueMatchesByTime, type Range } from '@/data/league';
import { Match } from '@/types/match';
import { rangeLabel } from '@/utils/range-label';
import RangeToggle, { type PageParams } from './range-toggle';
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
  range: Range;
  params: PageParams;
};

export default async function TimeScheduleList({
  selectedLeagues,
  range,
  params,
}: TimeScheduleListProps) {
  // 全てのリーグを時間順並べた試合を取得
  const allMatches: Match[] = await getLeagueMatchesByTime(range);

  // `selectedLeagues` に基づいて試合をフィルタリング
  const filteredMatches =
    selectedLeagues.length > 0
      ? allMatches.filter((match) => selectedLeagues.includes(match.leagueName))
      : allMatches;

  // 実際に表示する試合データがあるかどうかをチェック
  const hasAnyMatches = filteredMatches.length > 0;

  // 時間順かつリーグごとにグループ化するための関数
  const groupedMatches = groupMatchesByLeague(filteredMatches);


  return (
    <>
      <div className='border-b pb-4 pt-4 mb-8 flex flex-wrap items-center justify-between gap-3'>
        <p className='text-md'>試合時間順</p>
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
        <div>
          {groupedMatches.map((matches, index) => (
            <TimeMatchGroup key={index} matches={matches} />
          ))}
        </div>
      )}
    </>
  );
}

import { getLeagueByGroup, getLeagueMatchesByTime, sortMatchesByDateTime } from '@/data/league';
import { Match } from '@/types/match';
import getDateRange, { formatDateForDisplay } from '@/utils/getDate';
import { Calendar } from 'lucide-react';
import SelectedTimeMatchCard from './selected-time-match-card';
import TimeMatchGroup from './time-match-group';
import { currentUser } from '@/data/auth';
import { groupMatchesByLeague } from '@/utils/group-matches';

type TimeScheduleListProps = {
  selectedLeagues: string[];
  selectedMatches: string[];
};

// TimeScheduleList.tsx
export default async function TimeScheduleList({
  selectedLeagues,
  selectedMatches,
}: TimeScheduleListProps) {
  console.log('TimeScheduleList実行開始:', { selectedLeagues });

  try {
    // まずはリーグ別データを取得（これは動作している）
    const groupedData = await getLeagueByGroup();
    let matches: Match[] = [];

    try {
      // 時間順データの取得を試みる
      const timeMatches = await getLeagueMatchesByTime(selectedLeagues);
      console.log(`時間順データ取得成功: ${timeMatches.length}件`);
      matches = timeMatches;
    } catch (error) {
      // エラー発生時はリーグ別データから時間順データを作成
      console.log(
        '時間順データの取得に失敗、リーグ別データを使用します:',
        error
      );
      // リーグごとのデータを一つの配列に結合
      const allMatches = Object.values(groupedData).flatMap(
        (league) => league.matches
      );
      // 選択されたリーグでフィルタリング
      matches =
        selectedLeagues.length > 0
          ? allMatches.filter((match) =>
              selectedLeagues.includes(match.leagueName)
            )
          : allMatches;
      // 日時順にソート
      matches = sortMatchesByDateTime(matches);
    }

    // ここからは通常の処理を続行
    const user = await currentUser();
    const filteredMatches = matches;
    const groupedMatches = groupMatchesByLeague(filteredMatches);
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
        {user ? (
          <SelectedTimeMatchCard
            matches={filteredMatches}
            selectedMatches={selectedMatches}
          />
        ) : (
          <div>
            {groupedMatches.map((matches, index) => (
              <TimeMatchGroup key={index} matches={matches} />
            ))}
          </div>
        )}
      </>
    );
  } catch (error) {
    console.error('TimeScheduleListで重大なエラーが発生:', error);
    return (
      <div className='p-4 border rounded-md bg-red-50'>
        <p className='text-red-600 font-medium'>データの取得に失敗しました</p>
        <p className='text-sm text-gray-600 mt-2'>
          一時的な通信エラーが発生しています。後ほど再度お試しください。
        </p>
      </div>
    );
  }
}

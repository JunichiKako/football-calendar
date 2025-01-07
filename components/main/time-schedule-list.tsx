import { getLeagueMatchesByTime } from '@/data/league';
import { Match } from '@/types/match';
import getDateRange, { formatDateForDisplay } from '@/utils/getDate';
import { Calendar } from 'lucide-react';
import SelectedTimeMatchCard from './selected-time-match-card';
import TimeMatchGroup from './time-match-group';
import { currentUser } from '@/data/auth';

type TimeScheduleListProps = {
  selectedLeagues: string[];
  selectedMatches: string[]; 
};

export default async function TimeScheduleList({
  selectedLeagues,
  selectedMatches,
}: TimeScheduleListProps) {
  const allMatches: Match[] = await getLeagueMatchesByTime();
  const user = await currentUser();

  // `selectedLeagues` に基づいて試合をフィルタリング
  const filteredMatches =
    selectedLeagues.length > 0
      ? allMatches.filter((match) => selectedLeagues.includes(match.leagueName))
      : allMatches;

  // 試合を時間順にソート
  const sortedMatches = filteredMatches.sort((a, b) => {
    const dateA = new Date(`${a.matchDate}T${a.matchTime}`).getTime();
    const dateB = new Date(`${b.matchDate}T${b.matchTime}`).getTime();
    return dateA - dateB;
  });

  // 同じリーグで次の異なるリーグの試合までの時間内に行われる試合をグループ化
  const groupedMatches: Match[][] = [];
  let currentGroup: Match[] = [];

  sortedMatches.forEach((match, index) => {
    if (currentGroup.length === 0) {
      currentGroup.push(match);
    } else {
      const lastMatch = currentGroup[currentGroup.length - 1];

      if (match.leagueName === lastMatch.leagueName) {
        currentGroup.push(match);
      } else {
        groupedMatches.push(currentGroup);
        currentGroup = [match];
      }
    }

    if (index === sortedMatches.length - 1) {
      groupedMatches.push(currentGroup);
    }
  });

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
          matches={sortedMatches}
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
}

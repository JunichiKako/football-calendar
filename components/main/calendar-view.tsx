import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
} from '@/components/ui/calendar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Match } from '@/types/match';
import { CalendarSubmitBtn } from './calendar-submit-btn';

type CalendarViewProps = {
  groupedLeagues: {
    [key: string]: {
      leagueId: number;
      leagueName: string;
      leagueImg: string;
      matches: Match[];
    };
  };
  allSubmitMatches: string[];
};

export default function CalendarView({
  groupedLeagues,
  allSubmitMatches,
}: CalendarViewProps) {
  
  // 全てのデータを含むgroupedLeaguesから、allSubmitMatchesに含まれる試合のみを抽出してイベントに合うように整形
  const selectedMatchData = Object.values(groupedLeagues)
    .flatMap((league) => league.matches)
    .filter((match) => allSubmitMatches.includes(match.matchId.toString()));

  const events = selectedMatchData.map((match) => ({
    id: match.matchId.toString(),
    title: `${match.home} vs ${match.away}`,
    start: new Date(match.utcDate),
    end: new Date(new Date(match.utcDate).getTime() + 120 * 60 * 1000),
    leagueName: match.leagueName,
  }));

  return (
    <Calendar events={events}>
      <div className='h-full xl:p-14 flex flex-col relative'>
        <div className='flex px-2 lg:px-6 items-center gap-2 mb-6'>
          <CalendarViewTrigger
            className='aria-[current=true]:bg-accent'
            view='day'
          >
            Day
          </CalendarViewTrigger>

          <CalendarViewTrigger
            view='week'
            className='aria-[current=true]:bg-accent max-lg:hidden'
          >
            Week
          </CalendarViewTrigger>

          <CalendarViewTrigger
            view='month'
            className='aria-[current=true]:bg-accent'
          >
            Month
          </CalendarViewTrigger>

          <CalendarViewTrigger
            view='year'
            className='aria-[current=true]:bg-accent max-lg:hidden'
          >
            Year
          </CalendarViewTrigger>

          <span className='flex-1' />
          <CalendarCurrentDate />
          <CalendarPrevTrigger>
            <ChevronLeft size={20} />
            <span className='sr-only'>Previous</span>
          </CalendarPrevTrigger>
          <CalendarTodayTrigger>Today</CalendarTodayTrigger>
          <CalendarNextTrigger>
            <ChevronRight size={20} />
            <span className='sr-only'>Next</span>
          </CalendarNextTrigger>
        </div>
        <div className='flex-1 px-2 md:px-6 overflow-hidden'>
          <CalendarDayView />
          <CalendarWeekView />
          <CalendarMonthView />
          <CalendarYearView />
        </div>
        {/* Google calendarに追加するボタン */}
        <CalendarSubmitBtn
          events={events} 
          disabled={events.length === 0}
        />
      </div>
    </Calendar>
  );
}

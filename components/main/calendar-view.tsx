'use client';

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
  type CalendarEvent,
} from '@/components/ui/my-ui/calendar';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Match } from '@/types/match';
import { useRouter, useSearchParams } from 'next/navigation';
import { CalendarSubmitBtn } from './calendar-subimit-btn';

interface CalendarViewProps {
  groupedLeagues: {
    [key: string]: {
      leagueId: number;
      leagueName: string;
      leagueImg: string;
      matches: Match[];
    };
  };
  initialSelectedMatches: string[];
}

export default function CalendarView({
  groupedLeagues,
  initialSelectedMatches,
}: CalendarViewProps) {
  const [selectedMatches, setSelectedMatches] = useState(
    initialSelectedMatches
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const events = useMemo(() => {
    const selectedMatchData = Object.values(groupedLeagues)
      .flatMap((league) => league.matches)
      .filter((match) => selectedMatches.includes(match.matchId.toString()));

    return selectedMatchData.map((match) => ({
      id: match.matchId.toString(),
      title: `${match.home} vs ${match.away}`,
      start: new Date(match.utcDate),
      end: new Date(new Date(match.utcDate).getTime() + 120 * 60 * 1000),
      leagueName: match.leagueName,
    }));
  }, [groupedLeagues, selectedMatches]);

  const handleMatchToggle = (matchId: string) => {
    const newSelectedMatches = selectedMatches.includes(matchId)
      ? selectedMatches.filter((id) => id !== matchId)
      : [...selectedMatches, matchId];

    setSelectedMatches(newSelectedMatches);

    const params = new URLSearchParams(searchParams);
    if (newSelectedMatches.length > 0) {
      params.set('selectedMatches', newSelectedMatches.join(','));
    } else {
      params.delete('selectedMatches');
    }
    router.replace(`?${params.toString()}`);
  };

  return (
    <Calendar events={events}>
      <div className='h-full p-14 flex flex-col relative'>
        <div className='flex px-6 items-center gap-2 mb-6'>
          <CalendarViewTrigger
            className='aria-[current=true]:bg-accent'
            view='day'
          >
            Day
          </CalendarViewTrigger>

          <CalendarViewTrigger
            view='week'
            className='aria-[current=true]:bg-accent'
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
            className='aria-[current=true]:bg-accent'
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
        <div className='flex-1 px-6 overflow-hidden'>
          <CalendarDayView />
          <CalendarWeekView />
          <CalendarMonthView />
          <CalendarYearView />
        </div>
        {/* Google calendarに追加するボタン */}
        <CalendarSubmitBtn
          events={events} // イベントデータを渡す
          disabled={events.length === 0}
        />
      </div>
    </Calendar>
  );
}

// サーバーコンポーネントとして維持
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
// ログイン機能を一時的に無効化
// import { CalendarSubmitBtn } from './calendar-submit-btn';
// import { createClient } from '@/lib/supabase/server';
// import { currentUser } from '@/data/auth';

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

export default async function CalendarView({
  groupedLeagues,
  allSubmitMatches,
}: CalendarViewProps) {
  // ログイン機能を一時的に無効化
  // let userPlan: 'free' | 'pro' = 'free';
  // try {
  //   const user = await currentUser();
  //   if (user) {
  //     const supabase = await createClient();
  //     const { data } = await supabase
  //       .from('users')
  //       .select('subscription_plan')
  //       .eq('user_id', user.id)
  //       .single();
  //     if (
  //       data &&
  //       (data.subscription_plan === 'free' || data.subscription_plan === 'pro')
  //     ) {
  //       userPlan = data.subscription_plan;
  //     }
  //   }
  // } catch (error) {
  //   console.error('Failed to fetch user plan:', error);
  // }

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
        {/* Google calendarに追加するボタン - ログイン機能を一時的に無効化 */}
        {/* <CalendarSubmitBtn
          events={events}
          disabled={events.length === 0}
          userPlan={userPlan}
        /> */}
      </div>
    </Calendar>
  );
}

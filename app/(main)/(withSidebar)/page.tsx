import LeagueList from "@/components/main/league-list";
import TimeScheduleList from "@/components/main/time-schedule-list";
import { ModeToggle } from "@/components/mode-toggle";
import {
  Calendar,
  CalendarCurrentDate,
  CalendarDayView,
  CalendarEvent,
  CalendarMonthView,
  CalendarNextTrigger,
  CalendarPrevTrigger,
  CalendarTodayTrigger,
  CalendarViewTrigger,
  CalendarWeekView,
  CalendarYearView,
} from "@/components/ui/my-ui/calendar";

import { getLeagueByGroup } from "@/data/league";
import { addHours } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function Home({
  searchParams,
}: {
  searchParams: {
    leagues?: string;
    view?: string;
    matchIds?: string;
  };
}) {
  const selectedLeagues = searchParams.leagues?.split(",") || [];
  const currentView = searchParams.view || "league";
  const matchIds = searchParams.matchIds?.split(",") || [];

  // matchIdsがある場合はカレンダー表示
  if (matchIds.length > 0) {
    const leagueGroup = await getLeagueByGroup();
    const events: CalendarEvent[] = Object.values(leagueGroup)
      .flatMap((league) => league.matches)
      .filter((match) => matchIds.includes(match.matchId.toString()))
      .map((match) => {
        // 日付文字列をDateオブジェクトに変換
        const startTime = new Date(`${match.matchDate} ${match.matchTime}`);

        return {
          id: match.matchId.toString(),
          start: startTime,
          end: addHours(startTime, 2),
          title: `${match.home} vs ${match.away}`,
          // color型はmonthEventVariantsのvariantに定義されているものから選択
          color: "blue"
        };
      });

    return (
      <Calendar events={events}>
        <div className="h-dvh p-14 flex flex-col">
          <div className="flex px-6 items-center gap-2 mb-6">
            <CalendarViewTrigger
              className="aria-[current=true]:bg-accent"
              view="day"
            >
              Day
            </CalendarViewTrigger>
            <CalendarViewTrigger
              view="week"
              className="aria-[current=true]:bg-accent"
            >
              Week
            </CalendarViewTrigger>
            <CalendarViewTrigger
              view="month"
              className="aria-[current=true]:bg-accent"
            >
              Month
            </CalendarViewTrigger>
            <CalendarViewTrigger
              view="year"
              className="aria-[current=true]:bg-accent"
            >
              Year
            </CalendarViewTrigger>
            <span className="flex-1" />
            <CalendarCurrentDate />
            <CalendarPrevTrigger>
              <ChevronLeft size={20} />
              <span className="sr-only">Previous</span>
            </CalendarPrevTrigger>
            <CalendarTodayTrigger>Today</CalendarTodayTrigger>
            <CalendarNextTrigger>
              <ChevronRight size={20} />
              <span className="sr-only">Next</span>
            </CalendarNextTrigger>
            <ModeToggle />
          </div>
          <div className="flex-1 px-6 overflow-hidden">
            <CalendarDayView />
            <CalendarWeekView />
            <CalendarMonthView />
            <CalendarYearView />
          </div>
        </div>
      </Calendar>
    );
  }

  // 通常の選択画面表示
  return (
    <>
      {currentView === "league" ? (
        <LeagueList selectedLeagues={selectedLeagues} />
      ) : currentView === "time" ? (
        <TimeScheduleList selectedLeagues={selectedLeagues} />
      ) : (
        <div>Invalid view parameter</div>
      )}
    </>
  );
}

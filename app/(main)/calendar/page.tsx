// app/calendar/page.tsx
import { getLeagueByGroup } from "@/data/league";
import { addHours } from "date-fns";

import CalendarView from "./components/calendar-view";
import { CalendarEvent } from "@/components/ui/my-ui/calendar";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: { matchIds?: string };
}) {
  const matchIds = searchParams.matchIds?.split(",") || [];
  let events: CalendarEvent[] = [];

  if (matchIds.length > 0) {
    const leagueGroup = await getLeagueByGroup();
    events = Object.values(leagueGroup)
      .flatMap((league) => league.matches)
      .filter((match) => matchIds.includes(match.matchId.toString()))
      .map((match) => {
        // ここでmatchDateTimeを直接使用する
        const startTime = new Date(match.utcDate);
        return {
          id: match.matchId.toString(),
          start: startTime,
          end: addHours(startTime, 2),
          title: `${match.home} vs ${match.away}`,
          color: "blue" as const,
        };
      });
    // 最終的なeventsの確認
    console.log("Final events:", events);
  }

  return <CalendarView events={events} />;
}

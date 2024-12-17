// app/calendar/page.tsx
import { getLeagueByGroup } from "@/data/league";
import { addHours } from "date-fns";

import CalendarView from "./components/calendar-view";
import { CalendarEvent } from "@/components/ui/my-ui/calendar";

// app/calendar/page.tsx
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
        // リーグ名による色の振り分け
        let color = "default";
        if (match.leagueName === "Premier League") color = "blue";
        else if (match.leagueName === "La Liga") color = "green";
        else if (match.leagueName === "Bundesliga") color = "pink";
        else if (match.leagueName === "Serie A") color = "purple";

        return {
          id: match.matchId.toString(),
          start: new Date(match.utcDate),
          end: addHours(new Date(match.utcDate), 2),
          title: `${match.home} vs ${match.away}`,
          color: color as CalendarEvent["color"],
        };
      });
  }

  return <CalendarView events={events} />;
}

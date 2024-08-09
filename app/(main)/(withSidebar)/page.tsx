// app/page.tsx

import LeagueList from "@/components/main/league-list";
import TimeScheduleList from "@/components/main/time-schedule-list";

export default async function Home({
  searchParams,
}: {
  searchParams: { view?: string; leagues?: string[] };
}) {
  const currentView = searchParams.view || "league";
  const selectedLeagues = searchParams.leagues || [];

  return (
    <>
      {currentView === "league" ? (
        <LeagueList selectedLeagues={selectedLeagues} />
      ) : (
        <TimeScheduleList selectedLeagues={selectedLeagues} />
      )}
    </>
  );
}

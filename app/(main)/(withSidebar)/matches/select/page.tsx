// app/page.tsx

import LeagueList from "@/components/main/league-list";
import TimeScheduleList from "@/components/main/time-schedule-list";
import { currentUser } from "@clerk/nextjs/server";

export default async function SelectedMatchesPage({
  searchParams,
}: {
  searchParams: { view?: string; leagues?: string[] };
}) {
  const currentView = searchParams.view || "league";
  const selectedLeagues = searchParams.leagues || [];

  const user = await currentUser();

  if (!user) {
    throw new Error("ログインしてください");
  }

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

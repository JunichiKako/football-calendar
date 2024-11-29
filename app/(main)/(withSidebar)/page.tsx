import LeagueList from "@/components/main/league-list";
import TimeScheduleList from "@/components/main/time-schedule-list";

export default async function Home({
  searchParams,
}: {
  searchParams: { leagues?: string; view?: string };
}) {
  const selectedLeagues = searchParams.leagues?.split(",") || [];
  const currentView = searchParams.view || "league"; 

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
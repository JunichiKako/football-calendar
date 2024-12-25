import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';

export default async function Home({
  searchParams,
}: {
  searchParams: {
    leagues?: string;
    view?: string;
    selectedMatches?: string; // 追加
  };
}) {
  const selectedLeagues = searchParams.leagues?.split(',') || [];
  const currentView = searchParams.view || 'league';
  const selectedMatches = searchParams.selectedMatches?.split(',') || []; // 追加

  return (
    <>
      {currentView === 'league' ? (
        <LeagueList
          selectedLeagues={selectedLeagues}
          selectedMatches={selectedMatches} // 追加
        />
      ) : currentView === 'time' ? (
        <TimeScheduleList
          selectedLeagues={selectedLeagues}
          selectedMatches={selectedMatches} // 追加
        />
      ) : (
        <div>Invalid view parameter</div>
      )}
    </>
  );
}

import { Suspense } from 'react';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';
import { getLeagueByGroup } from '@/data/league';
import CalendarView from '@/components/main/calendar-view';
import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@/data/auth';
import { redirect } from 'next/navigation';

type HomeProps = {
  searchParams: {
    leagues?: string;
    view?: string;
    selectedMatches?: string;
  };
};

export default async function Home({ searchParams }: HomeProps) {
  const groupedLeagues = await getLeagueByGroup();
  const selectedLeagues = searchParams.leagues?.split(',') || [];
  const currentView = searchParams.view || 'league';
  const selectedMatches = searchParams.selectedMatches?.split(',') || [];

  const supabase = await createClient();

  if (currentView === 'calendar') {
    const user = await currentUser();

    if (!user) {
      redirect('/');
    }

    let allSelectedMatches = selectedMatches;

    if (user) {
      const { data: savedMatches } = await supabase
        .from('match_selections')
        .select('match_ids')
        .eq('user_id', user.id)
        .single();

      if (savedMatches?.match_ids) {
        allSelectedMatches = [
          ...selectedMatches,
          ...savedMatches.match_ids.filter(
            (id: string) => !selectedMatches.includes(id)
          ),
        ];
      }
    }

    return (
      <div data-view={currentView} className='h-full'>
        <Suspense fallback={<div>Loading calendar...</div>}>
          <CalendarView
            groupedLeagues={groupedLeagues}
            initialSelectedMatches={allSelectedMatches}
          />
        </Suspense>
      </div>
    );
  }

  return (
    <div data-view={currentView}>
      {currentView === 'league' ? (
        <LeagueList
          selectedLeagues={selectedLeagues}
          selectedMatches={selectedMatches}
        />
      ) : currentView === 'time' ? (
        <TimeScheduleList
          selectedLeagues={selectedLeagues}
          selectedMatches={selectedMatches}
        />
      ) : (
        <div>Invalid view parameter</div>
      )}
    </div>
  );
}

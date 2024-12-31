import { Suspense } from 'react';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';
import { getLeagueByGroup } from '@/data/league';
import CalendarView from '@/components/main/calendar-view';
import { currentUser } from '@clerk/nextjs/server';
import { createClerkSupabaseClient } from '@/lib/supabase/clerk';

type HomeProps = {
  searchParams: {
    leagues?: string;
    view?: string;
    selectedMatches?: string;
  };
};

// app/(main)/(withSidebar)/page.tsx
export default async function Home({ searchParams }: HomeProps) {
  const groupedLeagues = await getLeagueByGroup();
  const selectedLeagues = searchParams.leagues?.split(',') || [];
  const currentView = searchParams.view || 'league';
  const selectedMatches = searchParams.selectedMatches?.split(',') || [];

  if (currentView === 'calendar') {
    const supabase = await createClerkSupabaseClient();
    const user = await currentUser();

    let allSelectedMatches = selectedMatches;

    if (user) {
      const { data: savedMatches } = await supabase
        .from('match_selections')
        .select('match_ids')
        .eq('clerk_id', user.id)
        .single();

      if (savedMatches) {
        // 重複を除去した配列を作成
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

  // 他のビューの処理は変更なし
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

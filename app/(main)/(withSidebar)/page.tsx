import { Suspense } from 'react';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';
import { getLeagueByGroup } from '@/data/league';
import CalendarView from '@/components/main/calendar-view';
import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@/data/auth';
import { redirect } from 'next/navigation';
import { cache } from 'react';

type HomeParamsProps = {
  searchParams: {
    leagues?: string;
    view?: string;
    selectedMatches?: string;
  };
};

async function getPageParams(searchParams: HomeParamsProps['searchParams']) {
  return {
    currentView: (await searchParams).view || 'league',
    selectedLeagues: (await searchParams).leagues?.split(',') || [],
    selectedMatches: (await searchParams).selectedMatches?.split(',') || [],
  };
}

// キャッシュのためこの/でviewを切り替えて表示する
export default async function Home({ searchParams }: HomeParamsProps) {
  try {
    const supabase = await createClient();
    const user = await currentUser();

    // パラメータの取得を1回にまとめる
    const { currentView, selectedLeagues, selectedMatches } =
      await getPageParams(searchParams);

    // リーグ情報の取得（既にキャッシュされている）
    const groupedLeagues = await getLeagueByGroup();

    console.log('Debug: Data received', {
      currentView,
      groupedLeagues: !!groupedLeagues,
      user: !!user,
    });

    // カレンダーの場合の処理
    if (currentView === 'calendar') {
      if (!user) {
        redirect('/');
      }

      // ユーザーが選択した試合を取得
      let allSubmitMatches = selectedMatches;

      // ユーザーが選択した試合をDBから取得（これもキャッシュできる）
      if (user) {
        const { data: savedMatches } = await supabase
          .from('user_matches')
          .select('match_id')
          .eq('user_id', user.id);

        if (savedMatches) {
          const savedMatchIds = savedMatches.map((match) => match.match_id);
          allSubmitMatches = [
            ...selectedMatches,
            ...savedMatchIds.filter((id) => !selectedMatches.includes(id)),
          ];
        }
      }

      console.log('Debug: Calendar data', {
        allSubmitMatches,
        groupedLeaguesExists: !!groupedLeagues,
      });

      return (
        <div className='h-full'>
          <Suspense fallback={<div>Loading calendar...</div>}>
            {groupedLeagues ? (
              <CalendarView
                groupedLeagues={groupedLeagues}
                allSubmitMatches={allSubmitMatches}
              />
            ) : (
              <div>Loading league data...</div>
            )}
          </Suspense>
        </div>
      );
    }

    // viewによって表示するコンポーネントを切り替え
    return (
      <>
        {currentView === 'league' ? (
          <Suspense fallback={<div>Loading league...</div>}>
            <LeagueList
              selectedLeagues={selectedLeagues}
              selectedMatches={selectedMatches}
            />
          </Suspense>
        ) : currentView === 'time' ? (
          <Suspense fallback={<div>Loading time...</div>}>
            <TimeScheduleList
              selectedLeagues={selectedLeagues}
              selectedMatches={selectedMatches}
            />
          </Suspense>
        ) : (
          <div>表示方法が正しく指定されていません</div>
        )}
      </>
    );
  } catch (error) {
    console.error('Error in Home component:', error);
    return <div>エラーが発生しました。ページを更新してください。</div>;
  }
}

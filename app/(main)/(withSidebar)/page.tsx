import { Suspense } from 'react';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';
import { getLeagueByGroup } from '@/data/league';
import CalendarView from '@/components/main/calendar-view';
import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@/data/auth';
import { redirect } from 'next/navigation';
import { log } from 'console';

type HomeParamsProps = {
  searchParams: {
    leagues?: string;
    view?: string;
    selectedMatches?: string;
  };
};

// キャッシュのためこの/でviewを切り替えて表示する
export default async function Home({ searchParams }: HomeParamsProps) {
  // リーグ情報の取得
  const groupedLeagues = await getLeagueByGroup();
  // パラメーターから現在のviewを取得
  const currentView = searchParams.view || 'league';

  // リーグと試合の選択状態をパラメーターに,ごとに区切って取得
  const selectedLeagues = searchParams.leagues?.split(',') || [];
  const selectedMatches = searchParams.selectedMatches?.split(',') || [];

  const supabase = await createClient();

  // カレンダーの場合の処理
  if (currentView === 'calendar') {
    const user = await currentUser();

    if (!user) {
      redirect('/');
    }

    // ユーザーが選択した試合を取得
    let allSubmitMatches = selectedMatches;

    // ユーザーが選択した試合をDBから取得

    if (user) {
      // user_matchesテーブルから選択された試合を取得
      const { data: savedMatches } = await supabase
        .from('user_matches')
        .select('match_id')
        .eq('user_id', user.id);

      // DBから取得した試合IDと現在選択されている試合IDを結合
      if (savedMatches) {
        const savedMatchIds = savedMatches.map((match) => match.match_id);
        allSubmitMatches = [
          ...selectedMatches,
          ...savedMatchIds.filter((id) => !selectedMatches.includes(id)),
        ];
      }
    }
    // カレンダービューはクライアントコンポーネントのため、Suspenseで非同期で読み込む
    return (
      <div className='h-full'>
        <Suspense fallback={<div>Loading calendar...</div>}>
          <CalendarView
            groupedLeagues={groupedLeagues}
            allSubmitMatches={allSubmitMatches}
          />
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
}

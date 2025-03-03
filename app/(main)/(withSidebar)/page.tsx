import { Suspense } from 'react';
import LeagueList from '@/components/main/league-list';
import TimeScheduleList from '@/components/main/time-schedule-list';
import { getLeagueByGroup } from '@/data/league';
import CalendarView from '@/components/main/calendar-view';
import { createClient } from '@/lib/supabase/server';
import { currentUser } from '@/data/auth';
import { redirect } from 'next/navigation';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';

type HomeParamsProps = {
  searchParams: Promise<{
    leagues?: string;
    view?: string;
    selectedMatches?: string;
  }>;
};

async function getPageParams(searchParams: HomeParamsProps['searchParams']) {
  const params = await searchParams;
  const view = params.view || 'league';

  // デコードを明示的に行う
  const leaguesParam = params.leagues || '';
  const leagues = leaguesParam
    ? decodeURIComponent(leaguesParam).split(',')
    : [];

  console.log('パース後のリーグパラメータ:', leagues);

  const selectedMatches = params.selectedMatches?.split(',') || [];

  return {
    currentView: view,
    selectedLeagues: leagues,
    selectedMatches: selectedMatches,
  };
}

// キャッシュのためこの/でviewを切り替えて表示する
export default async function Home({ searchParams }: HomeParamsProps) {
  const supabase = await createClient();
  const user = await currentUser();

  // オンボーディング状態をチェックする関数
  async function checkOnboarding() {
    const { data: userData } = await supabase
      .from('users')
      .select('onboarding_completed')
      .eq('user_id', user!.id)
      .single();

    return !userData?.onboarding_completed;
  }

  // 他のデータフェッチ処理（認証不要）
  const { currentView, selectedLeagues, selectedMatches } = await getPageParams(
    searchParams
  );
  const groupedLeagues = await getLeagueByGroup();

  // カレンダー表示の場合はユーザー認証が必要
  if (currentView === 'calendar') {
    if (!user) {
      redirect('/');
    }

    // カレンダー用の処理（認証必要）
    let allSubmitMatches = selectedMatches;
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

  // オンボーディングの表示（認証済みユーザーのみ）
  const showOnboarding = user && user.id ? await checkOnboarding() : false;

  // リーグ一覧と時間別スケジュール（認証不要）
  return (
    <>
      {showOnboarding && <OnboardingModal isOpen={showOnboarding} />}
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

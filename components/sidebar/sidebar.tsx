import { getLeagueByGroupWithAll } from '@/data/league';
import { CheckForm } from './check-form';
import LeagueToggle from './league-toggle';
import { Suspense } from 'react';

export default async function Sidebar() {
  // サイドバーに表示するためのリーグデータを取得
  // リーグ選択の一覧は表示範囲に依存させない
  const allLeaguesByGroup = await getLeagueByGroupWithAll({ kind: 'all' });

  return (
    <aside className='border-r w-72 p-5 bg-muted/20 h-full' data-calendar-hide>
      <div className='sticky top-20'>
        <Suspense>
          <CheckForm leagueByGroup={allLeaguesByGroup} />
        </Suspense>
        <div className='mt-10'>
          <Suspense>
            <LeagueToggle />
          </Suspense>
        </div>
      </div>
    </aside>
  );
}

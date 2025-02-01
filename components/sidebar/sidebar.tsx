import { getLeagueByGroup } from '@/data/league';
import { CheckForm } from './check-form';
import LeagueToggle from './league-toggle';
import { Suspense } from 'react';

export default async function Sidebar() {
  // サイドバーに表示するためのリーグデータを取得
  const allLeaguesByGroup = await getLeagueByGroup();

  return (
    <aside className='border-r w-80 p-6 bg-muted/20 h-full' data-calendar-hide>
      <div className='sticky top-20'>
        <Suspense>
          <CheckForm leagueByGroup={allLeaguesByGroup} />
        </Suspense>
        <div className='mt-14'>
          <Suspense>
            <LeagueToggle />
          </Suspense>
        </div>
      </div>
    </aside>
  );
}

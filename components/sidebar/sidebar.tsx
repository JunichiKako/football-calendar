import { getLeagueByGroup } from '@/data/league';
import ChangeBtn from './change-btn';
import { CheckForm } from './check-form';

export default async function Sidebar() {
  // コンペティションのGroup化したものを取得
  const leagueByGroup = await getLeagueByGroup();

  return (
    <aside className="border-r w-80 p-6 bg-muted/30">
      <div className="sticky top-20">
        <h3 className="text-sm mb-4">表示するリーグ</h3>
        <CheckForm leagueByGroup={leagueByGroup} />
        <div className="mt-5">
          <ChangeBtn />
        </div>
      </div>
    </aside>
  );
}

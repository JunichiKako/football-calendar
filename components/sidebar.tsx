import { getLeagueByGroup } from "@/data/league";
import { CheckForm } from "../app/components/check-form";
import { Button } from "./ui/button";
import Link from "next/link";

export default async function Sidebar() {
  // コンペティションのGroup化したものを取得
  const leagueByGroup = await getLeagueByGroup();

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-36 transition-transform -translate-x-full border-r border lg:translate-x-0">
      <div className="flex flex-col h-full px-3 pb-4 overflow-y-auto">
        <h3 className="text-sm mb-4">Filter League</h3>
        <CheckForm leagueByGroup={leagueByGroup} />
        <div className="my-auto text-center">
          <Button asChild>
            <Link href="/time">試合時間順で表示</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

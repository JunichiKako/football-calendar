import { groupLeagues } from "@/app/utils/groupLeagues";
import { Button } from "@/components/ui/button";
import { getCompetitions } from "@/data/competitions";
import Image from "next/image";
import Link from "next/link";

export default async function Sidebar() {
  // コンペティションのデータを取得
  const competitionList = await getCompetitions();

  // データをグループ化
  const groupedLeagues = groupLeagues(competitionList);

  console.log(groupedLeagues);

  return (
    <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-32 transition-transform -translate-x-full border-r border lg:translate-x-0">
      <div className="flex flex-col h-full px-3 pb-4 overflow-y-auto">
        <ul className="flex-1 font-medium flex flex-col">
          {Object.keys(groupedLeagues).map((leagueName) => {
            const league = groupedLeagues[leagueName];
            return (
              <li key={leagueName} className="pb-4">
                <Link
                  href={`/competitions/${leagueName}`}
                  className="flex items-center p-2 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors"
                >
                  <div className="flex">
                    <Image
                      src={league.competitionImg}
                      width={40}
                      height={40}
                      className="object-cover"
                      alt={`${leagueName} emblem`}
                    />
                    <span className="ml-4">{leagueName}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto">
          <Button asChild>
            <Link href={"/"}>チームから選ぶ</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}

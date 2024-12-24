// components/LeagueList.tsx
import { getLeagueByGroup } from "@/data/league";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import getDateRange, { formatDateForDisplay } from "@/utils/getDate";
import MatchCard from "./match-card";
import { Suspense } from "react";
import { currentUser } from "@clerk/nextjs/server";
import SelectedMatchCard from "./selected-match-card";

type LeagueListProps = {
  selectedLeagues: string[];
  selectedMatches: string[]; 
};

export default async function LeagueList({
  selectedLeagues,
  selectedMatches,
}: LeagueListProps) {
  // ここで一括してリーグでグループ化されたリーグデータを取得する
  const leagueGroup = await getLeagueByGroup();
  const user = await currentUser();

  // 選択されたリーグのみをクライアントでフィルタリングして表示する（APIの呼び出しを減らすため）
  const filteredLeagues =
    selectedLeagues.length > 0
      ? Object.fromEntries(
          Object.entries(leagueGroup).filter(([leagueName]) =>
            selectedLeagues.includes(leagueName)
          )
        )
      : leagueGroup;

  const { dateFrom, dateTo } = getDateRange();
  const { displayFrom, displayTo } = formatDateForDisplay(dateFrom, dateTo);

  return (
    <>
      <div className="border-b pb-4 pt-4 mb-8 flex justify-between">
        <p className="text-md">リーグ別</p>
        <p className="flex text-muted-foreground text-sm gap-2 items-center">
          <Calendar className="size-5" />
          {displayFrom} - {displayTo}
        </p>
      </div>
      {user ? (
        <Suspense fallback={<div>Loading..</div>}>
          <SelectedMatchCard
            leagues={filteredLeagues}
            selectedMatches={selectedMatches}
          />
        </Suspense>
      ) : (
        <div className="space-y-20">
          {Object.entries(filteredLeagues).map(([leagueName, league]) => {
            const isPremierLeague = leagueName === "Premier League";
            return (
              <div key={leagueName}>
                <div className="flex items-center justify-between mb-8">
                  <div className="inline-block">
                    <div className="py-2 rounded-md flex">
                      <Image
                        src={league.leagueImg}
                        alt={leagueName}
                        width={32}
                        height={32}
                        className={cn("mr-2", {
                          "premier-league-logo": isPremierLeague,
                        })}
                      />
                      <h2 className="text-lg font-bold">{league.leagueName}</h2>
                    </div>
                  </div>
                </div>
                <MatchCard matches={league.matches} />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

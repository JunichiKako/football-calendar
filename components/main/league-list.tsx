import getDateRange, { formatDateForDisplay } from "@/utils/getDate";
import { Calendar } from "lucide-react";
import MatchCard from "./match-card";
import { getLeagueByGroup } from "@/data/league";
import Image from "next/image";
import { cn } from "@/lib/utils";

type CompetitionGroupProps = {
  selectedLeagues: string[];
};

export default async function LeagueList({
  selectedLeagues,
}: CompetitionGroupProps) {
  // コンペティションのGroup化されたデータを取得
  const leagueGroup = await getLeagueByGroup();

  // leagueの名前で選択されたリーグのデータを取得
  const filteredLeagues =
    selectedLeagues.length > 0
      ? Object.keys(leagueGroup).filter((leagueName) =>
          selectedLeagues.includes(leagueName)
        )
      : Object.keys(leagueGroup);

  // 表示する日付の範囲を取得
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
      <div className="space-y-20">
        {filteredLeagues.map((leagueName) => {
          const league = leagueGroup[leagueName];
          const isPremierLeague = leagueName === "Premier League"; // プレミアリーグかどうかを判定
          const formattedMatches = league.matches.map((match) => ({
            leagueId: match.leagueId,
            leagueName: match.leagueName,
            leagueImg: match.leagueImg,
            matchId: match.matchId,
            matchDate: match.matchDate,
            matchTime: match.matchTime,
            home: match.home,
            homeEmblemUrl: match.homeEmblemUrl,
            away: match.away,
            awayEmblemUrl: match.awayEmblemUrl,
          }));

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
              <MatchCard matches={formattedMatches} />
            </div>
          );
        })}
      </div>
    </>
  );
}

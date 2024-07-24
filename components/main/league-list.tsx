import getDateRange, { formatDateForDisplay } from "@/utils/getDate";
import { Calendar } from "lucide-react";
import MatchCard from "./match-card";
import { getLeagueByGroup } from "@/data/league";

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
    <div className="space-y-20">
      {filteredLeagues.map((leagueName) => {
        const league = leagueGroup[leagueName];
        const formattedMatches = league.matches.map((match) => ({
          seasonStartYear: match.seasonStartYear,
          seasonEndYear: match.seasonEndYear,
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
              <div className="relative inline-block">
                <span className="absolute inset-0 bg-yellow-400 rounded-md transform translate-x-2 translate-y-2"></span>
                <div className="relative px-4 lg:px-10 py-2 bg-white dark:text-black  border rounded-md">
                  <h2 className="text-lg font-bold">{league.leagueName}</h2>
                </div>
              </div>
              <p className="flex text-muted-foreground text-sm gap-2 items-center">
                <Calendar className="size-5" />
                {displayFrom} - {displayTo}
              </p>
            </div>
            <MatchCard matches={formattedMatches} />
          </div>
        );
      })}
    </div>
  );
}

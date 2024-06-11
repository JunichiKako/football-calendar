import getDateRange, { formatDateForDisplay } from "@/utils/getDate";
import { Calendar } from "lucide-react";
import MatchCard from "./match-card";
import { getLeagueByGroup } from "@/data/league";

type CompetitionGroupProps = {
  selectedLeagues: string[];
};

export default async function LeagueList({ selectedLeagues }: CompetitionGroupProps) {
  // コンペティションのGroup化されたデータを取得
  const leagueGroup = await getLeagueByGroup();

  // leagueの名前で選択されたリーグのデータを取得
  const filteredLeagues =
    selectedLeagues.length > 0
      ? Object.keys(leagueGroup).filter((leagueName) => selectedLeagues.includes(leagueName))
      : Object.keys(leagueGroup);

  // 表示する日付の範囲を取得
  const { dateFrom, dateTo } = getDateRange();
  const { displayFrom, displayTo } = formatDateForDisplay(dateFrom, dateTo);

  return (
    <>
      {filteredLeagues.map((leagueName) => {
        const league = leagueGroup[leagueName];
        const formattedMatches = league.matches.map((match) => ({
          leagueImg: league.leagueImg,
          matchId: match.matchId,
          matchDate: match.matchDate,
          matchTime: match.matchTime,
          home: match.homeTeam,
          away: match.awayTeam,
          homeEmblemUrl: match.homeEmblemUrl,
          awayEmblemUrl: match.awayEmblemUrl,
        }));

        return (
          <div key={leagueName} className="mb-16 mt-6">
            <div className="flex items-end justify-between mb-8">
              <div className="relative inline-block">
                <span className="absolute inset-0 bg-yellow-400 rounded-md transform translate-x-2 translate-y-2"></span>
                <div className="relative px-4 lg:px-10 py-2 bg-white dark:text-black  border rounded-md">
                  <h2 className="lg:text-2xl font-bold">{league.leagueName}</h2>
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <Calendar className="text-gray-500 h-5 w-5" />
                <p className="text-xs lg:text-sm text-gray-500">
                  {displayFrom} - {displayTo}
                </p>
              </div>
            </div>
            <MatchCard matches={formattedMatches} />
          </div>
        );
      })}
    </>
  );
}

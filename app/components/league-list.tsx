import { Match } from "@/types/match";
import getDateRange, { formatDateForDisplay } from "@/utils/getDate";
import MatchCard from "./match-card";
import { Calendar, CalendarClock } from "lucide-react";

type League = {
  seasonStartYear: number;
  seasonEndYear: number;
  competitionImg: string;
  competitionId: number;
  competitionName: string;
  matches: Match[];
};

type CompetitionGroupProps = {
  competitionGroup: Record<string, League>;
  selectedLeagues: string[];
};

export default function LeagueList({ competitionGroup, selectedLeagues }: CompetitionGroupProps) {
  // leagueの名前で選択されたリーグのデータを取得
  const leaguesToDisplay =
    selectedLeagues.length > 0
      ? Object.keys(competitionGroup).filter((leagueName) => selectedLeagues.includes(leagueName))
      : Object.keys(competitionGroup);

  // 表示する日付の範囲を取得
  const { dateFrom, dateTo } = getDateRange();
  const { displayFrom, displayTo } = formatDateForDisplay(dateFrom, dateTo);

  return (
    <>
      {leaguesToDisplay.map((leagueName) => {
        const league = competitionGroup[leagueName];
        const formattedMatches = league.matches.map((match) => ({
          seasonStartYear: league.seasonStartYear,
          seasonEndYear: league.seasonEndYear,
          competitionImg: league.competitionImg,
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
                <div className="relative px-10 py-2 bg-white dark:text-black  border rounded-md">
                  <h2 className="text-2xl font-bold">{league.competitionName}</h2>
                </div>
              </div>
              <div className="flex gap-2 items-end">
                <Calendar className="text-gray-500 h-5 w-5" />
                <p className="text-sm text-gray-500">
                  {displayFrom} - {displayTo}
                </p>
              </div>
            </div>
            <MatchCard matches={formattedMatches} />
          </div>
        );
      })}
      <div className="px-3 mt-12">{/* スマートフォン向けのUI */}</div>
    </>
  );
}

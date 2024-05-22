import { Match } from "@/types/match";
import Image from "next/image";
import MatchCard from "./match-card";

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
  const leaguesToDisplay =
    selectedLeagues.length > 0
      ? Object.keys(competitionGroup).filter((leagueName) => selectedLeagues.includes(leagueName))
      : Object.keys(competitionGroup);

  return (
    <div className="">
      <div className="">
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
              <div className="flex items-center gap-8 mb-8">
                <div className="relative inline-block">
                  <span className="absolute inset-0 bg-yellow-400 rounded-md transform translate-x-2 translate-y-2"></span>
                  <div className="relative px-4 py-2 bg-white border rounded-md">
                    <h2 className="text-2xl font-bold">{league.competitionName}</h2>
                  </div>
                </div>
                <div>
                  {/* season情報 */}
                  {league.seasonStartYear && league.seasonEndYear && (
                    <span className="text-sm text-gray-500">
                      {league.seasonStartYear} - {league.seasonEndYear}
                    </span>
                  )}
                </div>
                {/* <Image
                  src={league.competitionImg}
                  alt={`${leagueName} logo`}
                  width={72}
                  height={30}
                /> */}
              </div>
              <MatchCard matches={formattedMatches} />
            </div>
          );
        })}
      </div>
      <div className="px-3 mt-12">{/* スマートフォン向けのUI */}</div>
    </div>
  );
}

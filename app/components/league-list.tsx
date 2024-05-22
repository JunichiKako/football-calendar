import { Match } from "@/types/match";
import Image from "next/image";
import MatchCard from "./match-card";

type League = {
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
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold">{league.competitionName}</h2>
                <Image
                  src={league.competitionImg}
                  alt={`${leagueName} logo`}
                  width={72}
                  height={30}
                />
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

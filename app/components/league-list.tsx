"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Match } from "@/types/match";
import MatchCard from "./match-card";

type League = {
  competitionImg: string;
  competitionId: number;
  competitionName: string;
  matches: Match[];
};

type CompetitionGroupProps = {
  competitionGroup: Record<string, League>;
};

export default function LeagueList({ competitionGroup }: CompetitionGroupProps) {
  const searchParams = useSearchParams();

  const [filteredLeagues, setFilteredLeagues] = useState<Record<string, League>>(competitionGroup);

  useEffect(() => {
    const leaguesParam = searchParams.get("leagues");
    if (leaguesParam) {
      const selectedLeagues = leaguesParam.split(",");
      const filtered = Object.keys(competitionGroup).reduce((acc, leagueName) => {
        if (selectedLeagues.includes(leagueName)) {
          acc[leagueName] = competitionGroup[leagueName];
        }
        return acc;
      }, {} as Record<string, League>);
      setFilteredLeagues(filtered);
    } else {
      setFilteredLeagues(competitionGroup);
    }
  }, [searchParams, competitionGroup]);

  return (
    <div className="px-3">
      <div className="lg:ml-64 px-3 lg:px-8 ">
        {Object.keys(filteredLeagues).map((leagueName) => {
          const league = filteredLeagues[leagueName];
          const formattedMatches = league.matches.map((match) => ({
            competitionId: match.competitionId,
            matchId: match.matchId,
            home: match.homeTeam,
            away: match.awayTeam,
            time: new Date(match.matchDate).toLocaleTimeString(),
            homeEmblemUrl: match.homeEmblemUrl,
            awayEmblemUrl: match.awayEmblemUrl,
          }));

          return (
            <div key={leagueName} className="mb-16 mt-6">
              <div className="flex items-center mb-8">
                <h2 className="text-2xl font-bold ml-4">{leagueName}</h2>
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

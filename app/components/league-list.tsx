import Image from "next/image";
import MatchCard from "./match-card";
import { Match } from "@/types/match";
import { groupLeagues } from "../utils/groupLeagues";

type LeagueListProps = {
  competitionList: Match[];
};

export default function LeagueList({ competitionList }: LeagueListProps) {
  const groupedMatches = groupLeagues(competitionList);

  return (
    <div className="px-3">
      <div className="lg:ml-64 px-3 lg:px-8 ">
        {Object.keys(groupedMatches).map((leagueName) => {
          const league = groupedMatches[leagueName];
          const formattedMatches = league.matches.map((match) => ({
            id: match.id,
            home: match.homeTeam,
            away: match.awayTeam,
            time: new Date(match.matchDate).toLocaleTimeString(),
            homeEmblemUrl: match.homeEmblemUrl,
            awayEmblemUrl: match.awayEmblemUrl,
          }));

          return (
            <div key={leagueName} className="mb-16 mt-6">
              <div className="flex items-center mb-8">
                <Image
                  src={league.competitionImg}
                  width={28}
                  height={28}
                  className="object-cover"
                  alt={`${leagueName} emblem`}
                />
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

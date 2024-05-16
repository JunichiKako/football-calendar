import Image from "next/image";
import MatchCard from "./match-card";
import { Match } from "@/types/match";

type LeagueListProps = {
  competitionList: Match[];
};

export default function LeagueList({ competitionList }: LeagueListProps) {
  const groupedMatches = competitionList.reduce((acc, match) => {
    const leagueName = match.competition;
    if (!acc[leagueName]) {
      acc[leagueName] = {
        emblemUrl: match.competitionImg, // プロパティ名を修正
        matches: [],
      };
    }
    acc[leagueName].matches.push(match);
    return acc;
  }, {} as Record<string, { emblemUrl: string; matches: Match[] }>);

  return (
    <div className="px-3">
      <div className="hidden lg:ml-64 lg:grid grid-cols-3 gap-4 lg:gap-6 px-3 lg:px-8 mt-12">
        {Object.keys(groupedMatches).map((leagueName) => {
          const league = groupedMatches[leagueName];
          const formattedMatches = league.matches.map((match) => ({
            id: match.id,
            home: match.homeTeam,
            away: match.awayTeam,
            time: new Date(match.date).toLocaleTimeString(),
            homeEmblemUrl: match.homeEmblemUrl,
            awayEmblemUrl: match.awayEmblemUrl,
          }));

          return (
            <div key={leagueName}>
              <div className="flex flex-col items-center mb-6">
                <Image
                  src={league.emblemUrl}
                  width={100}
                  height={60}
                  alt={`${leagueName} emblem`}
                />
              </div>
              <MatchCard
                date={new Date(league.matches[0].date).toLocaleDateString()}
                matches={formattedMatches}
              />
            </div>
          );
        })}
      </div>
      <div className="px-3 mt-12">{/* スマートフォン向けのUI */}</div>
    </div>
  );
}

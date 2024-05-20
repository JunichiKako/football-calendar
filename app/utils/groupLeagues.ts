// utils/groupMatches.ts
import { Match } from "@/types/match";

type GroupedMatches = Record<string, { competitionImg: string; matches: Match[] }>;

export function groupLeagues(matches: Match[]): GroupedMatches {
  return matches.reduce((acc, league) => {
    const leagueName = league.competitionName;
    if (!acc[leagueName]) {
      acc[leagueName] = {
        competitionImg: league.competitionImg,
        matches: [],
      };
    }
    acc[leagueName].matches.push(league);
    return acc;
  }, {} as GroupedMatches);
}

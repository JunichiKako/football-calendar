"server-only";

import { leagueIds } from "@/lib/league";
import { league } from "@/types/league";
import { cache } from "react";

export const getCompetitions = cache(async () => {
  const competitions = await Promise.all(
    // leagueIdsは任意のリーグIDの配列
    leagueIds.map(async (id) => {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${id}/matches?season=2023&dateFrom=2024-05-12&dateTo=2024-05-12`,
        {
          method: "GET",
          headers: {
            "X-Auth-Token": process.env.NEXT_PUBLIC_FOOTBALL_API_KEY!,
          },
        }
      );
      // league.tsの型をleagueに事前設定
      const league: league = await res.json();

      // 名前は再考の余地あり
      return league.matches.map((match) => ({
        id: match.id,
        competition: match.competition.name,
        competitionImg: match.competition.emblem,
        date: new Date(match.utcDate).toLocaleString(),
        homeTeam: match.homeTeam.name,
        homeEmblemUrl: match.homeTeam.crest,
        awayTeam: match.awayTeam.name,
        awayEmblemUrl: match.awayTeam.crest,
      }));
    })
  );

  return competitions.flat(); 
  // サブ配列も展開して1つの配列にしてます
});

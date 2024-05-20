"server-only";

import { leagueIds } from "@/lib/league";
import { league } from "@/types/league";
import { cache } from "react";

export const getCompetitions = cache(async () => {
  const competitions = await Promise.all(
    // leagueIdsは任意のリーグIDの配列
    leagueIds.map(async (id) => {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${id}/matches?season=2023&dateFrom=2024-05-18&dateTo=2024-05-19`,
        {
          method: "GET",
          headers: {
            "X-Auth-Token": process.env.NEXT_PUBLIC_FOOTBALL_API_KEY!,
          },
        }
      );
      // league.tsの型をleagueに事前設定
      const league: league = await res.json();

      console.log(league.matches);

      // 名前は再考の余地あり
      // チーム名の日本語化
      // 日付のフォーマット 25:00表記の方が日付はわかりやすい
      return league.matches.map((match) => ({
        id: match.id,
        competitionName: match.competition.name,
        competitionImg: match.competition.emblem,
        matchDate: new Date(match.utcDate).toLocaleString(),
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

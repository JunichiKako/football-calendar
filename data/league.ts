import "server-only";

import { Match } from "@/types/match";
import { leagueIds } from "@/data/leagueId";
import { league } from "@/types/league";
import { cache } from "react";
import { teamTranslations } from "@/data/translations";
// ここは、今はシーズンオフなのでコメントアウトしています。
import getDateRange from "@/utils/getDate";

export const getleagues = cache(async () => {
  // 1週間後の日付を取得
  // const { dateFrom, dateTo } = getDateRange();

  const leagues = await Promise.all(
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

      return league.matches.map((match) => {
        const matchDateTime = new Date(match.utcDate);
        const matchDate = matchDateTime.toLocaleDateString("ja-JP", {
          month: "numeric",
          day: "numeric",
          weekday: "short",
        });
        const matchTime = matchDateTime.toLocaleTimeString("ja-JP", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const seasonStartYear = new Date(match.season.startDate).getFullYear();
        const seasonEndYear = new Date(match.season.endDate).getFullYear();

        // チーム名を分かりやすい名前に変換
        const homeTeam = teamTranslations[match.homeTeam.name] || match.homeTeam.name;
        const awayTeam = teamTranslations[match.awayTeam.name] || match.awayTeam.name;

        return {
          seasonStartYear: seasonStartYear,
          seasonEndYear: seasonEndYear,
          leagueId: match.competition.id,
          leagueName: match.competition.name,
          leagueImg: match.competition.emblem,
          matchId: match.id,
          matchDate: matchDate,
          matchTime: matchTime,
          homeTeam: homeTeam,
          homeEmblemUrl: match.homeTeam.crest,
          awayTeam: awayTeam,
          awayEmblemUrl: match.awayTeam.crest,
        };
      });
    })
  );

  return leagues.flat();
  // サブ配列も展開して1つの配列にしてます
});

// leagueの名前でグループ化されたリーグのデータを取得する関数
export const getLeagueByGroup = async () => {
  const leagues = await getleagues();

  const groupedLeagues = leagues.reduce((acc, league) => {
    const leagueName = league.leagueName;
    if (!acc[leagueName]) {
      acc[leagueName] = {
        leagueId: league.leagueId,
        leagueName: league.leagueName,
        leagueImg: league.leagueImg,
        matches: [],
      };
    }
    acc[leagueName].matches.push(league);
    return acc;
  }, {} as Record<string, { leagueImg: string; leagueId: number; leagueName: string; matches: Match[] }>);

  return groupedLeagues;
};

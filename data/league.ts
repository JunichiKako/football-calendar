import "server-only";

import { Match } from "@/types/match";
import { leagueIds } from "@/data/leagueId";
import { league } from "@/types/league";
import { cache } from "react";
import { teamTranslations } from "@/data/translations";
// ここは、今はシーズンオフなのでコメントアウトしています。
import getDateRange from "@/utils/getDate";

export const getLeagues = cache(async () => {
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
            "X-Auth-Token": process.env.FOOTBALL_API_KEY!,
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
          home: homeTeam,
          homeEmblemUrl: match.homeTeam.crest,
          away: awayTeam,
          awayEmblemUrl: match.awayTeam.crest,
        } as Match;
      });
    })
  );

  return leagues.flat();
  // サブ配列も展開して1つの配列にしてます
});

// リーグをグループ化する処理は共通ですので、関数化しています。
const groupLeagues = (leagues: Match[]) => {
  const groupedLeagues = leagues.reduce((acc, match) => {
    const leagueName = match.leagueName;

    if (!acc[leagueName]) {
      acc[leagueName] = {
        leagueId: match.leagueId,
        leagueName: match.leagueName,
        leagueImg: match.leagueImg,
        matches: [] as Match[],
      };
    }

    acc[leagueName].matches.push(match);
    return acc;
  }, {} as Record<string, { leagueId: number; leagueName: string; leagueImg: string; matches: Match[] }>);

  Object.values(groupedLeagues).forEach((league) => {
    league.matches.sort((a, b) => {
      const dateTimeA = new Date(`${a.matchDate} ${a.matchTime}`);
      const dateTimeB = new Date(`${b.matchDate} ${b.matchTime}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });
  });

  return groupedLeagues;
};

export default groupLeagues;

// リーグでgroup化した試合データを取得する関数
export const getLeagueByGroup = async () => {
  const leagues = await getLeagues();
  return groupLeagues(leagues);
};

// 時間でgroup化した試合データを取得する関数
export const getLeagueMatchesByTime = async () => {
  const leagues = await getLeagues();
  const groupedLeagues = groupLeagues(leagues);
  const sortedMatches: Match[] = Object.values(groupedLeagues)
    .flatMap((league) => league.matches)
    .sort((a, b) => {
      const dateTimeA = new Date(`${a.matchDate} ${a.matchTime}`);
      const dateTimeB = new Date(`${b.matchDate} ${b.matchTime}`);
      return dateTimeA.getTime() - dateTimeB.getTime();
    });

  return sortedMatches;
};

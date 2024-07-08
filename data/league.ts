import "server-only";

import { Match } from "@/types/match";
import { leagueIds } from "@/data/leagueId";
import { league } from "@/types/league";
import { cache } from "react";
import { teamTranslations } from "@/data/translations";
// ここは、今はシーズンオフなのでコメントアウトしています。
// import getDateRange from "@/utils/getDate";

export const getLeagues = cache(async () => {
  // 1週間後の日付を取得
  // const { dateFrom, dateTo } = getDateRange();

  const leagues = await Promise.all(
    leagueIds.map(async (id) => {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${id}/matches?season=2023&dateFrom=2024-05-12&dateTo=2024-05-19`,
        {
          method: "GET",
          headers: {
            "X-Auth-Token": process.env.FOOTBALL_API_KEY!,
          },
        }
      );
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
});

// 時間順に試合を並べる関数
const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateTimeA = new Date(`${a.matchDate} ${a.matchTime}`);
    const dateTimeB = new Date(`${b.matchDate} ${b.matchTime}`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

// リーグごとにグループ化する関数
const groupLeagues = (leagues: Match[]) => {
  return leagues.reduce((acc, match) => {
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
};

export default groupLeagues;

// リーグごとにグループ化されたデータを取得する関数
export const getLeagueByGroup = async () => {
  const leagues = await getLeagues();
  const groupedLeagues = groupLeagues(leagues);

  Object.values(groupedLeagues).forEach((league) => {
    league.matches = sortMatchesByDateTime(league.matches);
  });

  return groupedLeagues;
};

// 時間順に試合を並べたデータを取得する関数
export const getLeagueMatchesByTime = async () => {
  const leagues = await getLeagues();
  const sortedMatches = sortMatchesByDateTime(leagues);
  return sortedMatches;
};

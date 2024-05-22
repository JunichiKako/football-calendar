import "server-only";

// グループ化されたリーグのデータを取得
import { Match } from "@/types/match";
import { leagueIds } from "@/lib/league";
import { league } from "@/types/league";
import { cache } from "react";
import { teamTranslations } from "@/data/translations"; // 翻訳マッピングをインポート

// 本日から1週間後の日付を取得する関数
const getDateRange = () => {
  const today = new Date();
  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return {
    dateFrom: formatDate(today),
    dateTo: formatDate(oneWeekLater),
  };
};

export const getCompetitions = cache(async () => {
  // const { dateFrom, dateTo } = getDateRange();

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
          competitionId: match.competition.id,
          competitionName: match.competition.name,
          competitionImg: match.competition.emblem,
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

  return competitions.flat();
  // サブ配列も展開して1つの配列にしてます
});

// leagueの名前でグループ化されたリーグのデータを取得する関数
export const getCompetionByGroup = async () => {
  const competitions = await getCompetitions();

  const groupedLeagues = competitions.reduce((acc, league) => {
    const leagueName = league.competitionName;
    if (!acc[leagueName]) {
      acc[leagueName] = {
        competitionId: league.competitionId,
        competitionName: league.competitionName,
        competitionImg: league.competitionImg,
        matches: [],
        seasonStartYear: league.seasonStartYear,
        seasonEndYear: league.seasonEndYear,
      };
    }
    acc[leagueName].matches.push(league);
    return acc;
  }, {} as Record<string, { competitionImg: string; competitionId: number; competitionName: string; matches: Match[]; seasonStartYear: number; seasonEndYear: number }>);

  return groupedLeagues;
};

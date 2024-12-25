import 'server-only';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { cache } from 'react';
import { teamTranslations } from '@/data/translations';

// 外部APIからリーグデータを取得
export const getLeagues = cache(async () => {
  const leagues = await Promise.all(
    leagueIds.map(async (id) => {
      try {
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${id}/matches?season=2023&dateFrom=2024-05-12&dateTo=2024-05-19`,
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
            },
          }
        );

        if (!res.ok) {
          console.error(
            `API request failed for league ${id}: ${res.status} ${res.statusText}`
          );
          return [];
        }

        const data: league = await res.json();

        if (!data.matches || !Array.isArray(data.matches)) {
          console.error(
            `Unexpected response format for league ${id}: matches property is missing or not an array`
          );
          return [];
        }

        return data.matches.map((match) => {
          const matchDateTime = new Date(match.utcDate);
          const matchDate = matchDateTime.toLocaleDateString('ja-JP', {
            month: 'numeric',
            day: 'numeric',
            weekday: 'short',
          });
          const matchTime = matchDateTime.toLocaleTimeString('ja-JP', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const seasonStartYear = new Date(
            match.season.startDate
          ).getFullYear();
          const seasonEndYear = new Date(match.season.endDate).getFullYear();

          const homeTeam =
            teamTranslations[match.homeTeam.name] || match.homeTeam.name;
          const awayTeam =
            teamTranslations[match.awayTeam.name] || match.awayTeam.name;

          return {
            seasonStartYear,
            seasonEndYear,
            leagueId: match.competition.id,
            leagueName: match.competition.name,
            leagueImg: match.competition.emblem,
            matchId: match.id,
            utcDate: match.utcDate,
            matchDate,
            matchTime,
            home: homeTeam,
            homeEmblemUrl: match.homeTeam.crest,
            away: awayTeam,
            awayEmblemUrl: match.awayTeam.crest,
          } as Match;
        });
      } catch (error) {
        console.error(`Error fetching data for league ${id}:`, error);
        return [];
      }
    })
  );

  const flattenedLeagues = leagues.flat();
  return flattenedLeagues;
});

// 日付範囲を取得を取得するヘルパー関数
const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateTimeA = new Date(a.utcDate);
    const dateTimeB = new Date(b.utcDate);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

// リーグをグループ化するヘルパー関数
export default function groupLeagues(leagues: Match[]) {
  const grouped = leagues.reduce((acc, match) => {
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

  return grouped;
}

// リーグごとにグループ化されたリーグデータを取得する関数
export const getLeagueByGroup = cache(async () => {
  const leagues = await getLeagues();

  const groupedLeagues = groupLeagues(leagues);

  Object.values(groupedLeagues).forEach((league) => {
    league.matches = sortMatchesByDateTime(league.matches);
  });

  return groupedLeagues;
});

// リーグ関係なく、全ての試合を日付・時刻順に取得する関数
export const getLeagueMatchesByTime = cache(
  async (selectedLeagues: string[] = []) => {
    const leagues = await getLeagues();

    // 選択されたリーグでフィルタリング
    const filteredLeagues =
      selectedLeagues.length > 0
        ? leagues.filter((match) => selectedLeagues.includes(match.leagueName))
        : leagues;

    const sortedMatches = sortMatchesByDateTime(filteredLeagues);
    return sortedMatches;
  }
);

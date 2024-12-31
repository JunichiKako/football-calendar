import 'server-only';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { cache } from 'react';
import { teamTranslations } from '@/data/translations';

const getLeaguesWithCache = async () => {
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
          };
        });
      } catch (error) {
        console.error(`Error fetching data for league ${id}:`, error);
        return [];
      }
    })
  );

  const allLeagues = leagues.flat();
  const sortedLeagues = sortMatchesByDateTime(allLeagues);

  // leagueIdsの順序でグループ化
  const grouped = sortedLeagues.reduce((acc, match) => {
    const leagueName = match.leagueName;
    if (!acc[leagueName]) {
      acc[leagueName] = {
        leagueId: match.leagueId,
        leagueName: match.leagueName,
        leagueImg: match.leagueImg,
        matches: [],
      };
    }
    acc[leagueName].matches.push(match);
    return acc;
  }, {} as Record<string, { leagueId: number; leagueName: string; leagueImg: string; matches: Match[] }>);

  // leagueIdsの順序を維持したまま返す
  const orderedGrouped = Object.fromEntries(
    Object.entries(grouped).sort(
      (a, b) =>
        leagueIds.indexOf(a[1].leagueId) - leagueIds.indexOf(b[1].leagueId)
    )
  );

  // 各リーグの試合を時間順にソート
  Object.values(orderedGrouped).forEach((league) => {
    league.matches = sortMatchesByDateTime(league.matches);
  });

  return {
    all: sortedLeagues,
    grouped: orderedGrouped,
  };
};

const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateTimeA = new Date(a.utcDate);
    const dateTimeB = new Date(b.utcDate);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

export const getLeagueByGroup = cache(async () => {
  const { grouped } = await getLeaguesWithCache();
  return grouped;
});

export const getLeagueMatchesByTime = cache(
  async (selectedLeagues: string[] = []) => {
    const { all } = await getLeaguesWithCache();
    return selectedLeagues.length > 0
      ? all.filter((match) => selectedLeagues.includes(match.leagueName))
      : all;
  }
);

export default getLeagueByGroup;

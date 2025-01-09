import 'server-only';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { cache } from 'react';
import { teamTranslations } from '@/data/translations';
import getDateRange from '@/utils/getDate';

// 基本となるリーグデータを取得
const fetchLeagueData = cache(async () => {
  const { dateFrom, dateTo } = getDateRange();

  const leagues = await Promise.all(
    leagueIds.map(async (id) => {
      try {
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${id}/matches?season=2024&dateFrom=${dateFrom}&dateTo=${dateTo}`,
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
            },
          }
        );

        if (!res.ok) {
          console.error(
            `APIの取得が失敗しました。${id}: ${res.status} ${res.statusText}`
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
  return sortMatchesByDateTime(allLeagues);
});

// 日時順に試合をソートするための関数
const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateTimeA = new Date(a.utcDate);
    const dateTimeB = new Date(b.utcDate);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

// リーグごとの表示に必要なデータを取得
export const getLeagueByGroup = cache(async () => {
  const matches = await fetchLeagueData();

  const grouped = matches.reduce((acc, match) => {
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

  const orderedGrouped = Object.fromEntries(
    Object.entries(grouped).sort(
      (a, b) =>
        leagueIds.indexOf(a[1].leagueId) - leagueIds.indexOf(b[1].leagueId)
    )
  );

  Object.values(orderedGrouped).forEach((league) => {
    league.matches = sortMatchesByDateTime(league.matches);
  });

  return orderedGrouped;
});

// 時間順に試合を取得する関数
export const getLeagueMatchesByTime = cache(
  async (selectedLeagues: string[] = []) => {
    const matches = await fetchLeagueData();
    return selectedLeagues.length > 0
      ? matches.filter((match) => selectedLeagues.includes(match.leagueName))
      : matches;
  }
);

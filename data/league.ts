import 'server-only';
import { cache } from 'react';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { teamTranslations } from '@/data/translations';
import getDateRange, { getExtendedDateRange, formatDateTime, getTodaysCacheKey } from '@/utils/getDate';

type LeagueInfo = {
  id: number;
  name: string;
  emblem: string;
}

async function fetchLeagueBaseInfo(): Promise<Record<number, LeagueInfo>> {
  console.log('🔵 fetchLeagueBaseInfo: 開始');
  const todayKey = getTodaysCacheKey();
  
  const results = await Promise.allSettled(
    leagueIds.map(async (id) => {
      try {
        console.log(`🔵 fetchLeagueBaseInfo: リーグ ${id} を取得中...`);
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${id}`,
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
            },
            next: {
              revalidate: 604800,
              tags: [`league-info-${id}-${todayKey}`]
            }
          }
        );

        console.log(`🔵 fetchLeagueBaseInfo: リーグ ${id} のレスポンス: ${res.status}`);

        if (res.ok) {
          const data = await res.json();
          return {
            id,
            info: {
              id: data.id,
              name: data.name,
              emblem: data.emblem,
            }
          };
        } else if (res.status === 429) {
          console.error(`❌ レート制限エラー: リーグ ${id}`);
          return null;
        }
        return null;
      } catch (error) {
        console.error(`❌ fetchLeagueBaseInfo: リーグ ${id} でエラー:`, error);
        return null;
      }
    })
  );

  const leagueInfos: Record<number, LeagueInfo> = {};
  
  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      const { id, info } = result.value;
      leagueInfos[id] = info;
    }
  });
  
  console.log(`🔵 fetchLeagueBaseInfo: 完了 (${Object.keys(leagueInfos).length}件)`);
  return leagueInfos;
}

const getCachedLeagueBaseInfo = cache(fetchLeagueBaseInfo);

async function fetchLeagueData(): Promise<Match[]> {
  console.log('🟢 fetchLeagueData: 開始');
  let { dateFrom, dateTo } = getDateRange();
  const todayKey = getTodaysCacheKey();
  console.log(`🟢 fetchLeagueData: 期間 ${dateFrom} - ${dateTo}, キャッシュキー: ${todayKey}`);

  const leagues = await Promise.all(
    leagueIds.map(async (id) => {
      try {
        console.log(`🟢 fetchLeagueData: リーグ ${id} の試合データを取得中...`);
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${id}/matches?season=2024&dateFrom=${dateFrom}&dateTo=${dateTo}`,
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
            },
            next: {
              revalidate: 86400,
              tags: [`league-matches-${id}-${todayKey}`]
            }
          }
        );

        console.log(`🟢 fetchLeagueData: リーグ ${id} のレスポンス: ${res.status}`);

        if (!res.ok) {
          if (res.status === 429) {
            console.error(`❌ レート制限エラー: リーグ ${id}`);
          }
          return { leagueId: id, matches: [] };
        }

        const data: league = await res.json();

        if (!data.matches || !Array.isArray(data.matches)) {
          console.log(`🟢 fetchLeagueData: リーグ ${id} は試合なし`);
          return { leagueId: id, matches: [] };
        }

        console.log(`🟢 fetchLeagueData: リーグ ${id} の試合数: ${data.matches.length}`);

        const processedMatches = data.matches.map((match) => {
          const { date: matchDate, time: matchTime } = formatDateTime(
            match.utcDate
          );

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

        return { leagueId: id, matches: processedMatches };
      } catch (error) {
        console.error(`❌ fetchLeagueData: リーグ ${id} でエラー:`, error);
        return { leagueId: id, matches: [] };
      }
    })
  );

  const leaguesWithNoMatches = leagues.filter(l => l.matches.length === 0);
  const allMatches = leagues.flatMap(l => l.matches);
  
  console.log(`🟢 fetchLeagueData: 通常期間の試合数合計: ${allMatches.length}`);
  console.log(`🟢 fetchLeagueData: 試合なしリーグ数: ${leaguesWithNoMatches.length}`);
  
  if (leaguesWithNoMatches.length > 0) {
    console.log('🟡 fetchLeagueData: 試合なしリーグがあるため期間を拡張');
    ({ dateFrom, dateTo } = getExtendedDateRange());
    console.log(`🟡 fetchLeagueData: 拡張期間 ${dateFrom} - ${dateTo}`);
    
    const extendedResults = await Promise.all(
      leaguesWithNoMatches.map(async (league) => {
        const id = league.leagueId;
        try {
          console.log(`🟡 fetchLeagueData: リーグ ${id} の拡張試合データを取得中...`);
          const res = await fetch(
            `https://api.football-data.org/v4/competitions/${id}/matches?season=2024&dateFrom=${dateFrom}&dateTo=${dateTo}`,
            {
              method: 'GET',
              headers: {
                'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
              },
              next: {
                revalidate: 86400,
                tags: [`league-matches-extended-${id}-${todayKey}`]
              }
            }
          );

          console.log(`🟡 fetchLeagueData: リーグ ${id} の拡張レスポンス: ${res.status}`);

          if (!res.ok) {
            if (res.status === 429) {
              console.error(`❌ レート制限エラー(拡張): リーグ ${id}`);
            }
            return [];
          }

          const data: league = await res.json();

          if (!data.matches || !Array.isArray(data.matches)) {
            return [];
          }

          console.log(`🟡 fetchLeagueData: リーグ ${id} の拡張試合数: ${data.matches.length}`);

          return data.matches.map((match) => {
            const { date: matchDate, time: matchTime } = formatDateTime(
              match.utcDate
            );

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
          console.error(`❌ fetchLeagueData: リーグ ${id} (拡張)でエラー:`, error);
          return [];
        }
      })
    );

    const extendedMatches = extendedResults.flat();
    console.log(`🟡 fetchLeagueData: 拡張期間の試合数: ${extendedMatches.length}`);
    
    allMatches.push(...extendedMatches);
  }

  console.log(`🟢 fetchLeagueData: 完了 (合計${allMatches.length}試合)`);
  return sortMatchesByDateTime(allMatches);
}

const getCachedLeagueData = cache(fetchLeagueData);

export const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateTimeA = new Date(
      new Date(a.utcDate).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    );
    const dateTimeB = new Date(
      new Date(b.utcDate).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    );
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

export const getLeagueByGroupWithAll = async () => {
  console.log('⭐ getLeagueByGroupWithAll: 開始');
  
  const [matches, leagueBaseInfo] = await Promise.all([
    getCachedLeagueData(),
    getCachedLeagueBaseInfo()
  ]);

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

  leagueIds.forEach(id => {
    const baseInfo = leagueBaseInfo[id];
    if (baseInfo && !Object.values(grouped).find(league => league.leagueId === id)) {
      grouped[baseInfo.name] = {
        leagueId: id,
        leagueName: baseInfo.name,
        leagueImg: baseInfo.emblem,
        matches: [],
      };
    }
  });

  const orderedGrouped = Object.fromEntries(
    Object.entries(grouped).sort(
      (a, b) =>
        leagueIds.indexOf(a[1].leagueId) - leagueIds.indexOf(b[1].leagueId)
    )
  );

  Object.values(orderedGrouped).forEach((league) => {
    league.matches = sortMatchesByDateTime(league.matches);
  });

  console.log(`⭐ getLeagueByGroupWithAll: 完了 (${Object.keys(orderedGrouped).length}リーグ)`);
  return orderedGrouped;
};

export const getLeagueByGroup = async () => {
  console.log('⭐ getLeagueByGroup: 開始');
  const matches = await getCachedLeagueData();

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

  const filteredGrouped = Object.fromEntries(
    Object.entries(grouped).filter(([_, league]) => league.matches.length > 0)
  );

  const orderedGrouped = Object.fromEntries(
    Object.entries(filteredGrouped).sort(
      (a, b) =>
        leagueIds.indexOf(a[1].leagueId) - leagueIds.indexOf(b[1].leagueId)
    )
  );

  Object.values(orderedGrouped).forEach((league) => {
    league.matches = sortMatchesByDateTime(league.matches);
  });

  console.log(`⭐ getLeagueByGroup: 完了 (${Object.keys(orderedGrouped).length}リーグ)`);
  return orderedGrouped;
};

export const getLeagueMatchesByTime = async () => {
  console.log('⭐ getLeagueMatchesByTime: 開始');
  const matches = await getCachedLeagueData();
  console.log(`⭐ getLeagueMatchesByTime: 完了 (${matches.length}試合)`);
  return matches;
};
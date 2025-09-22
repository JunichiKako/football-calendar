import 'server-only';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { teamTranslations } from '@/data/translations';
import getDateRange, { getExtendedDateRange, generateDateBasedCacheKey, formatDateTime } from '@/utils/getDate';
import { unstable_cache } from 'next/cache';

// リーグ情報のキャッシュ用インターface
interface LeagueInfo {
  id: number;
  name: string;
  emblem: string;
}

// APIレート制限対応の遅延関数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// リーグ基本情報をキャッシュから取得（長期キャッシュ、レート制限対応）
const fetchLeagueBaseInfo = unstable_cache(
  async (): Promise<Record<number, LeagueInfo>> => {
    const leagueInfos: Record<number, LeagueInfo> = {};
    
    for (let i = 0; i < leagueIds.length; i++) {
      const id = leagueIds[i];
      
      try {
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${id}`,
          {
            method: 'GET',
            headers: {
              'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          leagueInfos[id] = {
            id: data.id,
            name: data.name,
            emblem: data.emblem,
          };
        }

        if (i < leagueIds.length - 1) {
          await delay(6000);
        }
        
      } catch (error) {
        // エラーは握りつぶす
      }
    }
    
    return leagueInfos;
  },
  ['league-base-info'],
  {
    revalidate: 604800,
    tags: ['league-base-info'],
  }
);

// 基本となるリーグデータを取得（キャッシュあり、自動拡張対応）
const fetchLeagueData = unstable_cache(
  async () => {
    let { dateFrom, dateTo } = getDateRange();
    let allLeagues: any[] = [];

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
            return [];
          }

          const data: league = await res.json();

          if (!data.matches || !Array.isArray(data.matches)) {
            return [];
          }

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
          return [];
        }
      })
    );

    allLeagues = leagues.flat();
    
    // 試合が0件の場合のみ期間を2週間に拡張
    if (allLeagues.length === 0) {
      ({ dateFrom, dateTo } = getExtendedDateRange());
      
      const extendedLeagues = await Promise.all(
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
              return [];
            }

            const data: league = await res.json();

            if (!data.matches || !Array.isArray(data.matches)) {
              return [];
            }

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
            return [];
          }
        })
      );

      allLeagues = extendedLeagues.flat();
    }

    return sortMatchesByDateTime(allLeagues);
  },
  [generateDateBasedCacheKey()],
  {
    revalidate: 86400,
    tags: ['leagues', 'dateFrom'],
  }
);

// 日時順に試合をソートするための関数
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

// 試合の有無に関わらず全リーグを表示するための関数
export const getLeagueByGroupWithAll = async () => {
  const [matches, leagueBaseInfo] = await Promise.all([
    fetchLeagueData(),
    fetchLeagueBaseInfo()
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

  return orderedGrouped;
};

// リーグごとの表示に必要なデータを取得（試合があるリーグのみ）
export const getLeagueByGroup = async () => {
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

  return orderedGrouped;
};

// 時間順に試合を取得する関数（キャッシュなし、fetchLeagueDataに依存）
export const getLeagueMatchesByTime = async () => {
  const matches = await fetchLeagueData();
  return matches;
};
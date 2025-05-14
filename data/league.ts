import 'server-only';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { teamTranslations } from '@/data/translations';
import getDateRange from '@/utils/getDate';
import { unstable_cache } from 'next/cache';
import { formatDateTime } from '@/utils/getDate';

// 日付ベースのキャッシュキーを生成する関数
const generateDateBasedCacheKey = () => {
  const today = new Date();
  return `league-data-${today.toISOString().split('T')[0]}`;
};

// 基本となるリーグデータを取得
const fetchLeagueData = unstable_cache(
  async () => {
    const { dateFrom, dateTo } = getDateRange();
    console.log('🔍 Fetching league data with date range:', {
      dateFrom,
      dateTo,
    });

    const leagues = await Promise.all(
      leagueIds.map(async (id) => {
        try {
          console.log(`🌐 Starting fetch for league ${id}`);
          const res = await fetch(
            `https://api.football-data.org/v4/competitions/${id}/matches?season=2024&dateFrom=${dateFrom}&dateTo=${dateTo}`,
            {
              method: 'GET',
              headers: {
                'X-Auth-Token': process.env.FOOTBALL_API_KEY!,
              },
            }
          );

          console.log(`📦 League ${id} - Cache status:`, {
            status: res.status,
            cache: res.headers.get('x-cache'),
            cacheControl: res.headers.get('cache-control'),
          });

          if (!res.ok) {
            console.error(
              `❌ APIの取得が失敗しました。${id}: ${res.status} ${res.statusText}`
            );
            return [];
          }

          const data: league = await res.json();

          // matchesと配列じゃない場合のエラー処理
          if (!data.matches || !Array.isArray(data.matches)) {
            console.error(
              `⚠️ Unexpected response format for league ${id}: matches property is missing or not an array`
            );
            return [];
          }

          console.log(
            `✅ Successfully fetched ${data.matches.length} matches for league ${id}`
          );

          return data.matches.map((match) => {
            const { date: matchDate, time: matchTime } = formatDateTime(
              match.utcDate
            );

            // シーズンの開始年と終了年を取得
            const seasonStartYear = new Date(
              match.season.startDate
            ).getFullYear();
            const seasonEndYear = new Date(match.season.endDate).getFullYear();

            // チーム名の翻訳処理
            const homeTeam =
              teamTranslations[match.homeTeam.name] || match.homeTeam.name;
            const awayTeam =
              teamTranslations[match.awayTeam.name] || match.awayTeam.name;

            // 必要なデータを返す
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
          console.error(`❌ Error fetching data for league ${id}:`, error);
          return [];
        }
      })
    );

    const allLeagues = leagues.flat();
    console.log(`📊 Total matches processed: ${allLeagues.length}`);
    return sortMatchesByDateTime(allLeagues);
  },
  [generateDateBasedCacheKey()], // 日付を含むキャッシュキー
  {
    revalidate: 43200,
    tags: ['leagues', 'dateFrom'],
  }
);

// 日時順に試合をソートするための関数
export const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    // UTCの日時を日本時間に変換して比較
    const dateTimeA = new Date(
      new Date(a.utcDate).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    );
    const dateTimeB = new Date(
      new Date(b.utcDate).toLocaleString('en-US', { timeZone: 'Asia/Tokyo' })
    );
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

// リーグごとの表示に必要なデータを取得
// リーグごとの表示に必要なデータを取得 - すべてのリーグを常に返すように修正
// 明示的なフィルタリングを追加した getLeagueByGroup 関数
export const getLeagueByGroup = unstable_cache(
  async () => {
    console.log('📥 Starting getLeagueByGroup');
    const matches = await fetchLeagueData();

    // 試合データからリーグをグループ化
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

    // 試合がないリーグの処理は省略（コメントアウトと同じ）

    // 試合があるリーグだけをフィルタリング（これを追加）
    const filteredGrouped = Object.fromEntries(
      Object.entries(grouped).filter(([_, league]) => league.matches.length > 0)
    );

    // リーグIDの順番にソート idが小さいものから順に並べる
    const orderedGrouped = Object.fromEntries(
      Object.entries(filteredGrouped).sort(
        (a, b) =>
          leagueIds.indexOf(a[1].leagueId) - leagueIds.indexOf(b[1].leagueId)
      )
    );

    // 各リーグ内の試合を日時順にソート
    Object.values(orderedGrouped).forEach((league) => {
      league.matches = sortMatchesByDateTime(league.matches);
    });

    console.log(
      '✅ getLeagueByGroup completed with',
      Object.keys(orderedGrouped).length,
      'leagues with matches'
    );
    return orderedGrouped;
  },
  [`league-groups-${generateDateBasedCacheKey()}`], // 日付を含むキャッシュキー
  {
    revalidate: 43200,
    tags: ['group-leagues'],
  }
);

// 時間順に試合を取得する関数
export const getLeagueMatchesByTime = unstable_cache(
  async () => {
    console.log('📥 Starting getLeagueMatchesByTime');

    // 元のデータを直接取得（すでにソート済み）
    const matches = await fetchLeagueData();
    return matches;
  },
  [`league-matches-time-${generateDateBasedCacheKey()}`], // 日付を含むキャッシュキー
  {
    revalidate: 43200,
    tags: ['time-leagues'],
  }
);
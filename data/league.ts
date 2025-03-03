import 'server-only';
import { Match } from '@/types/match';
import { leagueIds } from '@/data/leagueId';
import { league } from '@/types/league';
import { teamTranslations } from '@/data/translations';
import getDateRange from '@/utils/getDate';
import { unstable_cache } from 'next/cache';
import { formatDateTime } from '@/utils/getDate';

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
  ['league-data'],
  {
    revalidate: 3600,
    tags: ['leagues'],
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
export const getLeagueByGroup = unstable_cache(
  async () => {
    console.log('📥 Starting getLeagueByGroup');
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

    // リーグIDの順番にソート idが小さいものから順に並べる
    const orderedGrouped = Object.fromEntries(
      Object.entries(grouped).sort(
        (a, b) =>
          leagueIds.indexOf(a[1].leagueId) - leagueIds.indexOf(b[1].leagueId)
      )
    );

    Object.values(orderedGrouped).forEach((league) => {
      league.matches = sortMatchesByDateTime(league.matches);
    });

    console.log('✅ getLeagueByGroup completed');
    console.log(orderedGrouped['Premier League'].matches[0]);
    return orderedGrouped;
  },
  ['league-groups'],
  {
    revalidate: 3600,
    tags: ['leagues'],
  }
);

// 時間順に試合を取得する関数
export const getLeagueMatchesByTime = unstable_cache(
  async (selectedLeagues: string[] = []) => {
    console.log('📥 Starting getLeagueMatchesByTime', { selectedLeagues });

    // 既に取得済みのリーグデータを使用する
    const groupedData = await getLeagueByGroup();

    // グループ化されたデータから全マッチを抽出
    const allMatches = Object.values(groupedData).flatMap(
      (league) => league.matches
    );

    // 選択されたリーグでフィルタリング
    const filteredMatches =
      selectedLeagues.length > 0
        ? allMatches.filter((match) =>
            selectedLeagues.includes(match.leagueName)
          )
        : allMatches;

    console.log(
      `✅ getLeagueMatchesByTime completed - Filtered ${filteredMatches.length} matches from ${allMatches.length} total`
    );

    return filteredMatches;
  },
  ['league-matches-time'],
  {
    revalidate: 3600,
    tags: ['leagues'],
  }
);

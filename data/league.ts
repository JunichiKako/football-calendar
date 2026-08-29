import 'server-only';
import { cache } from 'react';
import { Match } from '@/types/match';
import { leagues, leagueIds } from '@/data/leagueId';
import { league as LeagueResponse } from '@/types/league';
import { teamTranslations } from '@/data/translations';
import getDateRange, {
  getExtendedDateRange,
  formatDateTime,
  getTodaysCacheKey,
} from '@/utils/getDate';

type LeagueGroup = {
  leagueId: number;
  leagueName: string;
  leagueImg: string;
  matches: Match[];
};

type LeagueResult = {
  id: number;
  matches: Match[];
  /** false ならAPI取得に失敗している。「試合0件」と区別するために持つ */
  ok: boolean;
  /** 開発時のファイルキャッシュから返したか */
  cached: boolean;
};

const API_BASE = 'https://api.football-data.org/v4';

// --- 開発時専用のファイルキャッシュ ---------------------------------------
//
// Next.js のデータキャッシュは再コンパイルのたびに揺れるため、開発中は
// ファイルを保存するたびに実APIを叩いてしまい、レート制限(10リクエスト/分)に
// 当たっていた。プロセスをまたいで生き残る自前のキャッシュを挟むことで、
// 開発中のAPI呼び出しを実質ゼロにする。
//
// 本番では読み書きとも一切行わない (fs も動的 import なのでバンドルされない)。
// 強制的に再取得したい場合は FOOTBALL_DEV_CACHE=off か .dev-cache/ の削除で。
const DEV_CACHE_DIR = '.dev-cache';
const DEV_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const useDevCache =
  process.env.NODE_ENV === 'development' && process.env.FOOTBALL_DEV_CACHE !== 'off';

async function readDevCache(key: string): Promise<LeagueResponse | null> {
  if (!useDevCache) return null;
  try {
    const { readFile } = await import('node:fs/promises');
    const raw = await readFile(`${DEV_CACHE_DIR}/${key}.json`, 'utf-8');
    const { savedAt, body } = JSON.parse(raw);
    if (Date.now() - savedAt > DEV_CACHE_TTL_MS) return null;
    return body as LeagueResponse;
  } catch {
    return null;
  }
}

async function writeDevCache(key: string, body: LeagueResponse): Promise<void> {
  if (!useDevCache) return;
  try {
    const { mkdir, writeFile } = await import('node:fs/promises');
    await mkdir(DEV_CACHE_DIR, { recursive: true });
    await writeFile(
      `${DEV_CACHE_DIR}/${key}.json`,
      JSON.stringify({ savedAt: Date.now(), body })
    );
  } catch {
    // 開発用の補助キャッシュなので書き込み失敗は無視してよい
  }
}
// ---------------------------------------------------------------------------

function toMatch(match: LeagueResponse['matches'][number]): Match {
  const { date: matchDate, time: matchTime } = formatDateTime(match.utcDate);

  return {
    leagueId: match.competition.id,
    leagueName: match.competition.name,
    leagueImg: match.competition.emblem,
    matchId: match.id,
    utcDate: match.utcDate,
    matchDate,
    matchTime,
    home: teamTranslations[match.homeTeam.name] || match.homeTeam.name,
    homeEmblemUrl: match.homeTeam.crest,
    away: teamTranslations[match.awayTeam.name] || match.awayTeam.name,
    awayEmblemUrl: match.awayTeam.crest,
  };
}

// 1リーグにつき1リクエスト。期間は最初から拡張期間(14日)で取る。
//
// 以前は「7日で取得 -> 0件だったリーグだけ14日で再取得」の二段構えだったが、
// 再取得は並列バーストを await した後に逐次で飛ぶためレート制限のカウンタが
// 反映済みで、ほぼ必ず429になっていた（CLが常に空だったのはこれが原因）。
// 1回にまとめ、7日への絞り込みはメモリ上で行う。
//
// season は指定しない。dateFrom/dateTo がある場合 API 側は season を
// フィルタに使わず現行シーズンを自動解決するため、指定しても効果がないうえ、
// 古い値が残っていると期間指定を外したときに過去シーズンを引いてしまう。
async function fetchLeagueMatches(id: number): Promise<LeagueResult> {
  const { dateFrom, dateTo } = getExtendedDateRange();
  const todayKey = getTodaysCacheKey();
  const devCacheKey = `league-${id}-${dateFrom}-${dateTo}`;

  const cached = await readDevCache(devCacheKey);
  if (cached) {
    return { id, matches: (cached.matches ?? []).map(toMatch), ok: true, cached: true };
  }

  try {
    const res = await fetch(
      `${API_BASE}/competitions/${id}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`,
      {
        headers: { 'X-Auth-Token': process.env.FOOTBALL_API_KEY! },
        next: {
          revalidate: 86400,
          tags: [`league-matches-${id}-${todayKey}`],
        },
      }
    );

    if (!res.ok) {
      const reason = res.status === 429 ? 'レート制限 (10リクエスト/分)' : `HTTP ${res.status}`;
      console.error(`[league:${id}] 取得失敗: ${reason}`);
      return { id, matches: [], ok: false, cached: false };
    }

    const data: LeagueResponse = await res.json();
    await writeDevCache(devCacheKey, data);
    return { id, matches: (data.matches ?? []).map(toMatch), ok: true, cached: false };
  } catch (error) {
    console.error(`[league:${id}] 取得失敗:`, error);
    return { id, matches: [], ok: false, cached: false };
  }
}

async function fetchAllLeagues(): Promise<LeagueGroup[]> {
  const { dateTo: normalDateTo } = getDateRange();
  const results = await Promise.all(leagueIds.map(fetchLeagueMatches));

  const groups = leagues.map(({ id, name, emblem }) => {
    const result = results.find((r) => r.id === id);
    const all = result?.matches ?? [];

    // 通常期間(7日)に試合があればそれだけを表示し、無いリーグだけ
    // 拡張期間(14日)の全件を見せる。従来の二段取得と同じ見え方になる。
    const withinWeek = all.filter((match) => match.utcDate.slice(0, 10) <= normalDateTo);
    const matches = withinWeek.length > 0 ? withinWeek : all;

    return {
      leagueId: id,
      // 試合が取れていればAPIの値を、取れていなければ定数を使う
      leagueName: matches[0]?.leagueName ?? name,
      leagueImg: matches[0]?.leagueImg ?? emblem,
      matches: sortMatchesByDateTime(matches),
    };
  });

  const failed = results.filter((r) => !r.ok).map((r) => r.id);
  const cachedCount = results.filter((r) => r.cached).length;
  const total = groups.reduce((n, g) => n + g.matches.length, 0);
  console.log(
    `[league] ${leagueIds.length}リーグ / ${total}試合` +
      (cachedCount > 0 ? ` / devキャッシュ ${cachedCount}件` : '') +
      (failed.length > 0 ? ` / 取得失敗: ${failed.join(', ')}` : '')
  );

  return groups;
}

const getCachedLeagues = cache(fetchAllLeagues);

export const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return [...matches].sort(
    (a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
  );
};

const toRecord = (groups: LeagueGroup[]) =>
  Object.fromEntries(groups.map((group) => [group.leagueName, group]));

/** サイドバー用。試合が0件のリーグも含めて全リーグを返す */
export const getLeagueByGroupWithAll = async () => toRecord(await getCachedLeagues());

/** 一覧表示用。試合があるリーグだけを返す */
export const getLeagueByGroup = async () =>
  toRecord((await getCachedLeagues()).filter((group) => group.matches.length > 0));

/** 時間順表示用。全リーグの試合を時刻順に並べて返す */
export const getLeagueMatchesByTime = async (): Promise<Match[]> =>
  sortMatchesByDateTime((await getCachedLeagues()).flatMap((group) => group.matches));

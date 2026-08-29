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
};

const API_BASE = 'https://api.football-data.org/v4';

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
      return { id, matches: [], ok: false };
    }

    const data: LeagueResponse = await res.json();
    return { id, matches: (data.matches ?? []).map(toMatch), ok: true };
  } catch (error) {
    console.error(`[league:${id}] 取得失敗:`, error);
    return { id, matches: [], ok: false };
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
  const total = groups.reduce((n, g) => n + g.matches.length, 0);
  console.log(
    `[league] ${leagueIds.length}リーグ / ${total}試合` +
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

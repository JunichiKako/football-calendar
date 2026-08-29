import 'server-only';
import { cache } from 'react';
import { Match, MatchStatus } from '@/types/match';
import { leagues } from '@/data/leagueId';
import { teamTranslations } from '@/data/translations';
import snapshotJson from '@/data/snapshot.json';
import {
  formatMatchDate,
  formatMatchTime,
  getMonthRange,
  getWeekRange,
  toJstDateKey,
} from '@/utils/getDate';

// 表示範囲。URL の ?range= と対応する
export type RangeKind = 'week' | 'month' | 'all';
export type Range = { kind: 'week' } | { kind: 'month'; month: string } | { kind: 'all' };

export type LeagueGroup = {
  leagueId: number;
  leagueName: string;
  leagueImg: string;
  matches: Match[];
};

type SnapshotMatch = {
  id: number;
  utcDate: string;
  status: string;
  home: string | null;
  homeCrest: string | null;
  away: string | null;
  awayCrest: string | null;
};

type Snapshot = {
  fetchedAt: string;
  season: number;
  leagues: { id: number; name: string; matches: SnapshotMatch[] }[];
};

const snapshot = snapshotJson as Snapshot;

/** スナップショットの取得時刻。「いつ時点の情報か」を画面に出すために使う */
export const getFetchedAt = () => snapshot.fetchedAt;

/** 試合が存在する月の一覧(YYYY-MM)。月別表示の選択肢に使う */
export const getAvailableMonths = cache((): string[] => {
  const months = new Set<string>();
  for (const league of snapshot.leagues) {
    for (const match of league.matches) {
      months.add(
        (isTimeUndecided(match.status)
          ? match.utcDate.slice(0, 10)
          : toJstDateKey(match.utcDate)
        ).slice(0, 7)
      );
    }
  }
  return [...months].sort();
});

/**
 * 時刻が未確定かどうか。
 * SCHEDULED はマッチデーだけが決まった状態で、utcDate には 0時UTC のダミー値が入る。
 * 全体の約7割がこの状態なので、そのまま JST に変換して表示すると嘘の時刻になる。
 */
const isTimeUndecided = (status: string) => status === 'SCHEDULED';

function toMatch(
  raw: SnapshotMatch,
  league: { id: number; name: string; emblem: string }
): Match {
  const undecided = isTimeUndecided(raw.status);
  const home = raw.home ?? '未定';
  const away = raw.away ?? '未定';

  return {
    leagueId: league.id,
    leagueName: league.name,
    leagueImg: league.emblem,
    matchId: raw.id,
    utcDate: raw.utcDate,
    status: raw.status as MatchStatus,
    matchDate: formatMatchDate(raw.utcDate, undecided),
    matchTime: undecided ? null : formatMatchTime(raw.utcDate),
    timeUndecided: undecided,
    home: teamTranslations[home] ?? home,
    homeEmblemUrl: raw.homeCrest ?? '',
    away: teamTranslations[away] ?? away,
    awayEmblemUrl: raw.awayCrest ?? '',
  };
}

/** 範囲を「JSTの日付キー(YYYY-MM-DD)の下限と上限」に落とす */
function resolveRange(range: Range): { from: string; to: string } | null {
  if (range.kind === 'all') return null;
  if (range.kind === 'week') return getWeekRange();
  return getMonthRange(range.month);
}

const buildGroups = cache((rangeKey: string): LeagueGroup[] => {
  const range: Range = JSON.parse(rangeKey);
  const bounds = resolveRange(range);
  const byId = new Map(snapshot.leagues.map((league) => [league.id, league]));

  return leagues.map((def) => {
    const raw = byId.get(def.id)?.matches ?? [];

    const matches = raw
      .filter((match) => {
        if (!bounds) return true;
        // 時刻未定の試合は UTC の日付で、確定済みは JST の日付で判定する。
        // ダミーの 0時UTC を JST 換算すると 9時になり、日付の判定がずれるため。
        const key = isTimeUndecided(match.status)
          ? match.utcDate.slice(0, 10)
          : toJstDateKey(match.utcDate);
        return key >= bounds.from && key <= bounds.to;
      })
      .map((match) => toMatch(match, def));

    return {
      leagueId: def.id,
      leagueName: def.name,
      leagueImg: def.emblem,
      matches: sortMatchesByDateTime(matches),
    };
  });
});

export const sortMatchesByDateTime = (matches: Match[]): Match[] =>
  [...matches].sort(
    (a, b) =>
      new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime() ||
      a.matchId - b.matchId
  );

const getGroups = (range: Range) => buildGroups(JSON.stringify(range));

const toRecord = (groups: LeagueGroup[]) =>
  Object.fromEntries(groups.map((group) => [group.leagueName, group]));

/** サイドバー用。試合が0件のリーグも含めて全リーグを返す */
export const getLeagueByGroupWithAll = async (range: Range) =>
  toRecord(getGroups(range));

/** 一覧表示用。試合があるリーグだけを返す */
export const getLeagueByGroup = async (range: Range) =>
  toRecord(getGroups(range).filter((group) => group.matches.length > 0));

/** 時間順表示用。全リーグの試合を時刻順に並べて返す */
export const getLeagueMatchesByTime = async (range: Range): Promise<Match[]> =>
  sortMatchesByDateTime(getGroups(range).flatMap((group) => group.matches));

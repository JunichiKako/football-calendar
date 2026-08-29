import 'server-only';
import type { LeagueDef } from '@/data/leagueId';
import { teamTranslations } from '@/data/translations';
import type { IcsEvent } from '@/utils/ics';

const SITE = 'football-match-calendar.vercel.app';
const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

/** 時刻未定。utcDate にはマッチデー日付+0時UTCのダミー値が入っている */
const isTimeUndecided = (status: string) => status === 'SCHEDULED';
const isCancelled = (status: string) =>
  status === 'CANCELLED' || status === 'POSTPONED' || status === 'SUSPENDED';

const translate = (name: string | null | undefined) =>
  name ? teamTranslations[name] ?? name : '未定';

type FeedMatch = {
  id: number;
  utcDate: string;
  status: string;
  seq?: number;
  home: string | null;
  away: string | null;
};

/**
 * スナップショットの試合をICSイベントに変換する。
 * リーグ単位とチーム単位のフィードで同じ変換を使うことで、
 * どちらから購読しても同じUIDになり、乗り換えても予定が重複しない。
 */
export function toIcsEvent(match: FeedMatch, league: LeagueDef): IcsEvent {
  const undecided = isTimeUndecided(match.status);
  const cancelled = isCancelled(match.status);
  const start = new Date(match.utcDate);

  const description = [
    league.labelJa,
    undecided && 'キックオフ時刻は未定です',
    cancelled && 'この試合は中止・延期になりました',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    // UIDは配信元で一意かつ不変。football-data.org の試合IDをそのまま使う
    uid: `match-${match.id}@${SITE}`,
    sequence: match.seq ?? 0,
    summary: `${translate(match.home)} vs ${translate(match.away)}`,
    description,
    start,
    end: undecided ? undefined : new Date(start.getTime() + MATCH_DURATION_MS),
    allDay: undecided,
    status: cancelled ? 'CANCELLED' : undecided ? 'TENTATIVE' : 'CONFIRMED',
  };
}

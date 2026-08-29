// types/match.ts
export type MatchStatus =
  | 'SCHEDULED' // 日程のみ確定。utcDate はマッチデー日付+0時UTCのダミー値
  | 'TIMED' // キックオフ時刻まで確定
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'POSTPONED'
  | 'SUSPENDED'
  | 'CANCELLED';

export type Match = {
  leagueId: number;
  leagueName: string;
  leagueImg: string;
  matchId: number;
  utcDate: string;
  status: MatchStatus;
  /** 表示用の日付。時刻未定の試合は JST 変換せず UTC の日付をそのまま使う */
  matchDate: string;
  /** 表示用の時刻。時刻未定なら null */
  matchTime: string | null;
  /** utcDate の時刻部分が未確定かどうか */
  timeUndecided: boolean;
  homeId: number | null;
  home: string;
  homeEmblemUrl: string;
  awayId: number | null;
  away: string;
  awayEmblemUrl: string;
};

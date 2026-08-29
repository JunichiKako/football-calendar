// 表示対象のリーグ定義。
//
// name / emblem は football-data.org の /v4/competitions/{id} が返す値と同一。
// 以前はこれを取得するためにレンダーごとに6リクエスト叩いていたが、年単位で
// 変わらない値なので定数化した。name はページのメタデータのキーも兼ねるため、
// APIの表記から変えないこと。
export type LeagueDef = {
  id: number;
  name: string;
  emblem: string;
  /** URLで使う識別子。next.config.mjs の rewrites とICSの購読URLで共通 */
  slug: string;
  /** カレンダー名やUIに出す日本語表記 */
  labelJa: string;
};

export const leagues: LeagueDef[] = [
  {
    id: 2021,
    name: 'Premier League',
    emblem: 'https://crests.football-data.org/PL.png',
    slug: 'premier-league',
    labelJa: 'プレミアリーグ',
  },
  {
    id: 2001,
    name: 'UEFA Champions League',
    emblem: 'https://crests.football-data.org/CL.png',
    slug: 'champions-league',
    labelJa: 'チャンピオンズリーグ',
  },
  {
    id: 2002,
    name: 'Bundesliga',
    emblem: 'https://crests.football-data.org/BL1.png',
    slug: 'bundesliga',
    labelJa: 'ブンデスリーガ',
  },
  {
    id: 2014,
    name: 'Primera Division',
    emblem: 'https://crests.football-data.org/laliga.png',
    slug: 'la-liga',
    labelJa: 'ラ・リーガ',
  },
  {
    id: 2019,
    name: 'Serie A',
    emblem: 'https://crests.football-data.org/c111.png',
    slug: 'serie-a',
    labelJa: 'セリエA',
  },
  {
    id: 2015,
    name: 'Ligue 1',
    emblem: 'https://crests.football-data.org/FL1.png',
    slug: 'ligue-1',
    labelJa: 'リーグ・アン',
  },
];

export const leagueIds = leagues.map((league) => league.id);

export const leagueBySlug = new Map(leagues.map((league) => [league.slug, league]));

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
};

export const leagues: LeagueDef[] = [
  { id: 2021, name: 'Premier League', emblem: 'https://crests.football-data.org/PL.png' }, // プレミアリーグ
  { id: 2001, name: 'UEFA Champions League', emblem: 'https://crests.football-data.org/CL.png' }, // チャンピオンズリーグ
  { id: 2002, name: 'Bundesliga', emblem: 'https://crests.football-data.org/BL1.png' }, // ブンデスリーガ
  { id: 2014, name: 'Primera Division', emblem: 'https://crests.football-data.org/laliga.png' }, // ラ・リーガ
  { id: 2019, name: 'Serie A', emblem: 'https://crests.football-data.org/c111.png' }, // セリエA
  { id: 2015, name: 'Ligue 1', emblem: 'https://crests.football-data.org/FL1.png' }, // リーグ・アン
];

export const leagueIds = leagues.map((league) => league.id);

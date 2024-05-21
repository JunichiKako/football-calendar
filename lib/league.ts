// 使用可能なリーグのIDを指定
export const leagues = [
  {
    id: 2021,
    league: "プレミアリーグ",
  },
  {
    id: 2001,
    league: "チャンピオンズリーグ",
  },
  {
    id: 2002,
    league: "ブンデスリーガ",
  },
  {
    id: 2014,
    league: "ラ・リーガ",
  },
  {
    id: 2019,
    league: "セリエA",
  },
  {
    id: 2015,
    league: "リーグ１",
  },
];

// 使いまわしのためのIDのみを取得し、このオブジェクトに保存
export const leagueIds = leagues.map((league) => league.id);

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
  
  // EUROやワールドカップなどのリーグも追加可能だがseason=2023を2024に変更する必要があるので注意
  // {
  //   id: 2018,
  //   league: "ユーロ",
  // },
];

// 使いまわしのためのIDのみを取得し、このオブジェクトに保存
export const leagueIds = leagues.map((league) => league.id);

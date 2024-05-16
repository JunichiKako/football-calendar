export type league = {
  filters: {
    season: string;
  };
  resultSet: {
    count: number;
    first: string;
    last: string;
    played: number;
  };
  competition: {
    id: number;
    name: string;
    code: string;
    type: string;
    emblem: string;
  };
  matches: {
    area: {
      id: number;
      name: string;
      code: string;
      flag: string;
    };
    competition: {
      id: number;
      name: string;
      code: string;
      type: string;
      emblem: string;
    };
    season: {
      id: number;
      startDate: string;
      endDate: string;
      currentMatchday: number;
      winner: null | string;
    };
    id: number;
    utcDate: string;
    status: string;
    matchday: number;
    stage: string;
    group: null | string;
    lastUpdated: string;
    homeTeam: {
      id: number;
      name: string;
      shortName: string;
      tla: string;
      crest: string;
    };
    awayTeam: {
      id: number;
      name: string;
      shortName: string;
      tla: string;
      crest: string;
    };
    score: {
      winner: string;
      duration: string;
      fullTime: {
        home: number;
        away: number;
      };
      halfTime: {
        home: number;
        away: number;
      };
    };
    odds: {
      msg: string;
    };
    referees: {
      id: number;
      name: string;
      type: string;
      nationality: string;
    }[];
  }[];
};

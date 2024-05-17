"use client";

import { createContext, useContext } from "react";

interface Competition {
  id: number;
  competition: string;
  competitionImg: string;
  date: string;
  homeTeam: string;
  homeEmblemUrl: string;
  awayTeam: string;
  awayEmblemUrl: string;
}

interface CompetitionsContextProps {
  competitionList: Competition[];
}

const CompetitionsContext = createContext<CompetitionsContextProps | undefined>(undefined);

export const useCompetitions = () => {
  const context = useContext(CompetitionsContext);
  if (!context) {
    throw new Error("useCompetitions must be used within a CompetitionsProvider");
  }
  return context;
};

export const CompetitionsProvider: React.FC<{
  value: CompetitionsContextProps;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <CompetitionsContext.Provider value={value}>{children}</CompetitionsContext.Provider>;
};

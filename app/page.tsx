'use client'

import LeagueList from "./components/league-list";
import SchduleHeader from "./components/schdule-header";
import { useCompetitions } from "./context/CompetitionsContext";

export default function Home() {
  const { competitionList } = useCompetitions();

  // ユニークな日付のリストを作成
  const uniqueDates = Array.from(
    new Set(competitionList.map((match) => new Date(match.date).toISOString().split("T")[0]))
  ).sort();

  return (
    <>
      {/* <SchduleHeader uniqueDates={uniqueDates} /> */}
      <div className="mt-20 lg:ml-64 text-center">サイドバーから選んでください</div>
      <LeagueList competitionList={competitionList} />
    </>
  );
}

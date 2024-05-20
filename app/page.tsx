import { getCompetitions } from "@/data/competitions";
import LeagueList from "./components/league-list";
import SchduleHeader from "./components/schdule-header";

export default async function Home() {
  // コンペティションのデータを取得
  const competitionList = await getCompetitions();

  return (
    <>
      <SchduleHeader />
      <LeagueList competitionList={competitionList} />
    </>
  );
}

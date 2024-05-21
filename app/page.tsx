import { getCompetionByGroup, getCompetitions } from "@/data/competitions";
import LeagueList from "./components/league-list";
import SchduleHeader from "./components/schdule-header";

export default async function Home() {
  // コンペティションのGroup化されたデータを取得
  const competitionGroup = await getCompetionByGroup();

  return (
    <>
      <SchduleHeader />
      <LeagueList competitionGroup={competitionGroup} />
    </>
  );
}

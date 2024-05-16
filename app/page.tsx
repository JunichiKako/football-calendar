import { getCompetitions } from "@/data/competitions";
import LeagueList from "./components/league-list";
import SchduleHeader from "./components/schdule-header";

export default async function Home() {
  const competitionList = await getCompetitions();

  console.log(competitionList);
  

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

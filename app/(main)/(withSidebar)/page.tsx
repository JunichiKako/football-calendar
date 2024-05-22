import { getCompetionByGroup } from "@/data/competitions";
import LeagueList from "../../components/league-list";


export default async function Home({ searchParams }: { searchParams: { leagues: string[] } }) {
  // コンペティションのGroup化されたデータを取得
  const competitionGroup = await getCompetionByGroup();
  const selectedLeagues = searchParams.leagues || [];


  return (
    <div className="mt-32 px-4 lg:px-11 lg:ml-64">
      <LeagueList competitionGroup={competitionGroup} selectedLeagues={selectedLeagues} />
    </div>
  );
}

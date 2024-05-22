import { getCompetionByGroup } from "@/data/competitions";
import LeagueList from "./components/league-list";

// SearchParamsの

export default async function Home({ searchParams }: { searchParams: { leagues: string[] } }) {
  // コンペティションのGroup化されたデータを取得
  const competitionGroup = await getCompetionByGroup();
  const selectedLeagues = searchParams.leagues || [];

  // シーズン情報を抽出
  let season = "";
  const firstLeague = Object.values(competitionGroup)[0];
  if (firstLeague && firstLeague.matches.length > 0) {
    const { seasonStartYear, seasonEndYear } = firstLeague;
    season = `${seasonStartYear.toString().slice(-2)}/${seasonEndYear.toString().slice(-2)}`;
  }

  return (
    <div className="mt-32 px-4 lg:px-11 lg:ml-64">
      <div className="flex">
        <h1 className="text-sm text-right py-3 px-4 inli ne-block bg-gray-100 rounded-full">
          {season} Season
        </h1>
      </div>
      <LeagueList competitionGroup={competitionGroup} selectedLeagues={selectedLeagues} />
    </div>
  );
}

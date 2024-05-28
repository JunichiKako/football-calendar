import { getCompetionByGroup } from "@/data/competitions";
import LeagueList from "../../components/league-list";
import ProfileForm from "@/app/components/profile-form";

export default async function Home({ searchParams }: { searchParams: { leagues: string[] } }) {
  // コンペティションのGroup化されたデータを取得
  const competitionGroup = await getCompetionByGroup();
  const selectedLeagues = searchParams.leagues || [];

  return (
    <main className="mt-32 px-4 lg:px-11 lg:ml-64">
      <ProfileForm />
      <LeagueList competitionGroup={competitionGroup} selectedLeagues={selectedLeagues} />
    </main>
  );
}

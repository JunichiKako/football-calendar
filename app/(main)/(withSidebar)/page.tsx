import LeagueList from "../../components/league-list";

export default async function Home({ searchParams }: { searchParams: { leagues: string[] } }) {
  const selectedLeagues = searchParams.leagues || [];

  return (
    <main className="mt-32 px-4 lg:px-11 lg:ml-64">
      {/*SupabaseとClerkの連携確認用 <ProfileForm /> */}
      <LeagueList selectedLeagues={selectedLeagues} />
    </main>
  );
}

import LeagueList from "../../../components/main/league-list";

export default async function Home({
  searchParams,
}: {
  searchParams: { leagues: string[] };
}) {
  const selectedLeagues = searchParams.leagues || [];

  return (
    <>
      {/*SupabaseとClerkの連携確認用 <ProfileForm /> */}
      <LeagueList selectedLeagues={selectedLeagues} />
    </>
  );
}

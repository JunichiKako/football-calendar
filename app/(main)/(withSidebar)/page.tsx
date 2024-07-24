import LeagueList from "../../../components/main/league-list";

export default async function Home({
  searchParams,
}: {
  searchParams: { leagues: string[] };
}) {
  const selectedLeagues = searchParams.leagues || [];

  return (
    <>
      <LeagueList selectedLeagues={selectedLeagues} />
    </>
  );
}

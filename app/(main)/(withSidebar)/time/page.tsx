import { getTimeMatches } from "@/data/league";

export default async function Page() {
  const TimeGroupMatches = await getTimeMatches();

  console.log(TimeGroupMatches);

  return (
    <div>
      {TimeGroupMatches.map((match) => {
        return (
          <li key={match.matchId} className="ml-80">
            {match.matchDate}
            {match.matchTime}
            {match.homeTeam}
            {match.awayTeam}
          </li>
        );
      })}
    </div>
  );
}

import { leagueIds} from "@/lib/league";
import { cache } from "react";

("server-only");

export const getFootballCompetitionList = cache(async () => {
  return Promise.all(
    leagueIds.map(async (id) => {
      const res = await fetch(
        `https://api.football-data.org/v4/competitions/${id}/matches?season=2023&dateFrom=2024-05-12&dateTo=2024-05-13`,
        {
          method: "GET",
          headers: {
            "X-Auth-Token": process.env.NEXT_PUBLIC_FOOTBALL_API_KEY!,
          },
        }
      );
      const league = await res.json();

      return league.matches;
    })
  );
});

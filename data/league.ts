import "server-only";
import { Match } from "@/types/match";
import { leagueIds } from "@/data/leagueId";
import { league } from "@/types/league";
import { cache } from "react";
import { teamTranslations } from "@/data/translations";

export const getLeagues = cache(async () => {
  console.log("Starting getLeagues function");
  const leagues = await Promise.all(
    leagueIds.map(async (id) => {
      try {
        console.log(`Fetching data for league ID: ${id}`);
        const res = await fetch(
          `https://api.football-data.org/v4/competitions/${id}/matches?season=2023&dateFrom=2024-05-12&dateTo=2024-05-19`,
          {
            method: "GET",
            headers: {
              "X-Auth-Token": process.env.FOOTBALL_API_KEY!,
            },
          }
        );

        if (!res.ok) {
          console.error(
            `API request failed for league ${id}: ${res.status} ${res.statusText}`
          );
          return [];
        }

        const data = await res.json();
        console.log(
          `Raw API response for league ${id}:`,
          JSON.stringify(data, null, 2)
        );

        if (!data.matches || !Array.isArray(data.matches)) {
          console.error(
            `Unexpected response format for league ${id}: matches property is missing or not an array`
          );
          return [];
        }

        console.log(
          `Number of matches for league ${id}: ${data.matches.length}`
        );

        return data.matches.map((match: any) => {
          const matchDateTime = new Date(match.utcDate);
          const matchDate = matchDateTime.toLocaleDateString("ja-JP", {
            month: "numeric",
            day: "numeric",
            weekday: "short",
          });
          const matchTime = matchDateTime.toLocaleTimeString("ja-JP", {
            hour: "2-digit",
            minute: "2-digit",
          });
          const seasonStartYear = new Date(
            match.season.startDate
          ).getFullYear();
          const seasonEndYear = new Date(match.season.endDate).getFullYear();

          const homeTeam =
            teamTranslations[match.homeTeam.name] || match.homeTeam.name;
          const awayTeam =
            teamTranslations[match.awayTeam.name] || match.awayTeam.name;

          return {
            seasonStartYear,
            seasonEndYear,
            leagueId: match.competition.id,
            leagueName: match.competition.name,
            leagueImg: match.competition.emblem,
            matchId: match.id,
            matchDate,
            matchTime,
            home: homeTeam,
            homeEmblemUrl: match.homeTeam.crest,
            away: awayTeam,
            awayEmblemUrl: match.awayTeam.crest,
          } as Match;
        });
      } catch (error) {
        console.error(`Error fetching data for league ${id}:`, error);
        return [];
      }
    })
  );
  
  const flattenedLeagues = leagues.flat();
  console.log(`Total matches across all leagues: ${flattenedLeagues.length}`);
  return flattenedLeagues;
});

const sortMatchesByDateTime = (matches: Match[]): Match[] => {
  return matches.sort((a, b) => {
    const dateTimeA = new Date(`${a.matchDate} ${a.matchTime}`);
    const dateTimeB = new Date(`${b.matchDate} ${b.matchTime}`);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });
};

export default function groupLeagues(leagues: Match[]) {
  console.log("Starting groupLeagues function");
  const grouped = leagues.reduce((acc, match) => {
    const leagueName = match.leagueName;
    if (!acc[leagueName]) {
      acc[leagueName] = {
        leagueId: match.leagueId,
        leagueName: match.leagueName,
        leagueImg: match.leagueImg,
        matches: [] as Match[],
      };
    }
    acc[leagueName].matches.push(match);
    return acc;
  }, {} as Record<string, { leagueId: number; leagueName: string; leagueImg: string; matches: Match[] }>);

  console.log("Grouped leagues:", Object.keys(grouped));
  return grouped;
}

export const getLeagueByGroup = cache(
  async (selectedLeagues: string[] = []) => {
    console.log("Starting getLeagueByGroup function");
    const leagues = await getLeagues();
    console.log(`Fetched ${leagues.length} matches in total`);

    const groupedLeagues = groupLeagues(leagues);
    console.log("Grouped leagues:", Object.keys(groupedLeagues));

    // 選択されたリーグでフィルタリング
    const filteredGroupedLeagues =
      selectedLeagues.length > 0
        ? Object.fromEntries(
            Object.entries(groupedLeagues).filter(([leagueName]) =>
              selectedLeagues.includes(leagueName)
            )
          )
        : groupedLeagues;

    Object.values(filteredGroupedLeagues).forEach((league) => {
      league.matches = sortMatchesByDateTime(league.matches);
    });

    return filteredGroupedLeagues;
  }
);

export const getLeagueMatchesByTime = cache(
  async (selectedLeagues: string[] = []) => {
    console.log("Starting getLeagueMatchesByTime function");
    const leagues = await getLeagues();

    // 選択されたリーグでフィルタリング
    const filteredLeagues =
      selectedLeagues.length > 0
        ? leagues.filter((match) => selectedLeagues.includes(match.leagueName))
        : leagues;

    const sortedMatches = sortMatchesByDateTime(filteredLeagues);
    console.log(`Sorted ${sortedMatches.length} matches by time`);
    return sortedMatches;
  }
);

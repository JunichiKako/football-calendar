import MatchCard from "@/app/components/match-card";
import { getLeagueMatchesByTime } from "@/data/league";
import { Match } from "@/types/match";
import Image from "next/image";

type MatchGroupProps = {
  matches: Match[];
};

const MatchGroup = ({ matches }: MatchGroupProps) => {
  const { leagueName, leagueImg } = matches[0];
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-4 flex items-center">
        <Image src={leagueImg} width={32} height={32} alt={leagueName} className="mr-2" />
        {leagueName}
      </h2>
      <MatchCard matches={matches} />
    </div>
  );
};

export default async function Page() {
  const allMatches: Match[] = await getLeagueMatchesByTime();

  // Step 1: 時間順にソート
  const sortedMatches = allMatches.sort((a, b) => {
    const dateA = new Date(`${a.matchDate}T${a.matchTime}`);
    const dateB = new Date(`${b.matchDate}T${b.matchTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Step 2: 試合を時間ごとにグループ化
  const groupedMatches = sortedMatches.reduce((acc: Match[][], match) => {
    const lastGroup = acc[acc.length - 1];
    const previousMatch = lastGroup ? lastGroup[lastGroup.length - 1] : null;

    if (
      previousMatch &&
      previousMatch.matchDate === match.matchDate &&
      previousMatch.matchTime === match.matchTime 
    ) {
      lastGroup.push(match);
    } else {
      acc.push([match]);
    }

    return acc;
  }, []);

  // Step 3: 要素を生成
  const elements = groupedMatches.map((group, index) => (
    <MatchGroup
      key={`${group[0].leagueId}-${group[0].matchDate}-${group[0].matchTime}-${index}`}
      matches={group}
    />
  ));

  return <div className="mt-32 px-4 lg:px-11 lg:ml-64">{elements}</div>;
}

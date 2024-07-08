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

  // 時間順でapiから取得した試合をリーグと時間ごとにグループ化
  const groupedMatches = allMatches.reduce((acc: Match[][], match) => {
    const lastGroup = acc[acc.length - 1];
    const previousMatch = lastGroup ? lastGroup[lastGroup.length - 1] : null;

    if (previousMatch && previousMatch.leagueId === match.leagueId) {
      // 前の試合と同じリーグの試合をまとめる
      lastGroup.push(match);
    } else {
      // 新しいリーグの試合を開始する
      acc.push([match]);
    }

    return acc;
  }, []);

  // 要素を生成
  const elements = groupedMatches.map((group, index) => (
    <MatchGroup
      key={`${group[0].leagueId}-${group[0].matchDate}-${group[0].matchTime}-${index}`}
      matches={group}
    />
  ));

  return <div className="mt-32 px-4 lg:px-11 lg:ml-64">{elements}</div>;
}

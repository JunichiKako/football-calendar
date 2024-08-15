import { Match } from "@/types/match";
import Image from "next/image";
import MatchCard from "@/components/main/match-card"; // MatchCardコンポーネントをインポート

type TimeMatchGroupProps = {
  matches: Match[]; // `matches` を受け取るように修正
};

const TimeMatchGroup: React.FC<TimeMatchGroupProps> = ({ matches }) => {
  if (matches.length === 0) {
    return null; // 試合がない場合は何も表示しない
  }

  // グループ内の最初の試合からリーグ名とリーグ画像を取得
  const { leagueName, leagueImg } = matches[0];

  return (
    <div className="mb-6">
      <h3 className="text-md font-semibold mb-2 flex items-center">
        <Image
          src={leagueImg}
          width={32}
          height={32}
          alt={leagueName}
          className="mr-2"
        />
        {leagueName}
      </h3>
      <MatchCard matches={matches} />
    </div>
  );
};

export default TimeMatchGroup;

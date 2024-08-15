import { Match } from "@/types/match";
import { getLeagueMatchesByTime } from "@/data/league";
import TimeMatchGroup from "./time-match-group";

export default async function TimeScheduleList({
  selectedLeagues,
}: {
  selectedLeagues: string[];
}) {
  const allMatches: Match[] = await getLeagueMatchesByTime();

  // `selectedLeagues` に基づいて試合をフィルタリング
  const filteredMatches = selectedLeagues.length > 0
    ? allMatches.filter((match) => selectedLeagues.includes(match.leagueName))
    : allMatches;

  // 試合を時間順にソート
  const sortedMatches = filteredMatches.sort((a, b) => {
    const dateA = new Date(`${a.matchDate}T${a.matchTime}`).getTime();
    const dateB = new Date(`${b.matchDate}T${b.matchTime}`).getTime();
    return dateA - dateB;
  });

  // 同じリーグで次の異なるリーグの試合までの時間内に行われる試合をグループ化
  const groupedMatches: Match[][] = [];
  let currentGroup: Match[] = [];

  sortedMatches.forEach((match, index) => {
    if (currentGroup.length === 0) {
      // 最初の試合を新しいグループに追加
      currentGroup.push(match);
    } else {
      const lastMatch = currentGroup[currentGroup.length - 1];
      
      if (match.leagueName === lastMatch.leagueName) {
        // 同じリーグの試合ならグループに追加
        currentGroup.push(match);
      } else {
        // 異なるリーグの試合が始まるので、現在のグループを確定
        groupedMatches.push(currentGroup);
        currentGroup = [match]; // 新しいグループを開始
      }
    }

    // 最後の試合を処理した後にグループを追加
    if (index === sortedMatches.length - 1) {
      groupedMatches.push(currentGroup);
    }
  });

  return (
    <div>
      {groupedMatches.map((matches, index) => (
        <TimeMatchGroup key={index} matches={matches} />
      ))}
    </div>
  );
}

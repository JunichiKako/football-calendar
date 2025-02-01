import { Match } from '@/types/match';

// filterMatches で時間順にフィルタリングされた試合をリーグごとにグループ化する関数
export function groupMatchesByLeague(filteredMatches: Match[]): Match[][] {
  const groupedMatches: Match[][] = [];
  let currentGroup: Match[] = [];

  filteredMatches.forEach((match, index) => {
    // 最初の試合は新しいグループの開始
    if (currentGroup.length === 0) {
      currentGroup.push(match);
      return;
    }

    // 現在のグループの最後の試合を取得
    const lastMatch = currentGroup[currentGroup.length - 1];

    // 同じリーグの試合をグループ化
    if (match.leagueName === lastMatch.leagueName) {
      currentGroup.push(match);
    } else {
      // 異なるリーグの試合は新しいグループの開始
      groupedMatches.push(currentGroup);
      // 現在のグループをリセットして新しいグループ(配列)を開始
      currentGroup = [];
      currentGroup.push(match);
    }

    // 最後のグループの処理
    if (index === filteredMatches.length - 1) {
      groupedMatches.push(currentGroup);
    }
  });

  return groupedMatches;
}

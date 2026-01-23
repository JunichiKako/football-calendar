'use server';

import fs from 'fs/promises';
import path from 'path';

export async function saveStreamingData(formData: FormData) {
  // 現在のデータを読み込み
  const filePath = path.join(process.cwd(), 'data', 'streaming-data.json');
  const currentData = JSON.parse(await fs.readFile(filePath, 'utf-8'));
  const byLeague: Record<string, string[]> = currentData.byLeague || {};

  // FormDataから配信設定とリーグ情報を抽出
  const streamingByMatchId: Record<string, string[]> = {};
  const matchLeagues: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('match_')) {
      const matchId = key.replace('match_', '');
      if (!streamingByMatchId[matchId]) {
        streamingByMatchId[matchId] = [];
      }
      streamingByMatchId[matchId].push(value as string);
    }
    if (key.startsWith('league_')) {
      const matchId = key.replace('league_', '');
      matchLeagues[matchId] = value as string;
    }
  }

  // リーグデフォルトと同じ場合は保存しない（差分のみ保存）
  const filteredByMatchId: Record<string, string[]> = {};

  // 全試合を処理（チェックなしの試合も含む）
  for (const [matchId, leagueName] of Object.entries(matchLeagues)) {
    const services = streamingByMatchId[matchId] || [];
    const leagueDefault = byLeague[leagueName] || [];

    // 配列を比較（順序無視）
    const isSameAsDefault =
      services.length === leagueDefault.length &&
      services.every(s => leagueDefault.includes(s));

    if (!isSameAsDefault) {
      // 空配列も明示的に保存（「配信なし」を表す）
      filteredByMatchId[matchId] = services;
    }
  }

  const newData = {
    ...currentData,
    byMatchId: filteredByMatchId
  };

  await fs.writeFile(filePath, JSON.stringify(newData, null, 2));
}

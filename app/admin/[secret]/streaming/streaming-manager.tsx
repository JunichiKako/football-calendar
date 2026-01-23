'use client';

import { saveStreamingData } from '@/actions/save-streaming';
import { Match } from '@/types/match';
import { StreamingData, StreamingService } from '@/types/streaming';
import { STREAMING_OPTIONS } from '@/utils/streaming';
import { useState } from 'react';

type Props = {
  matches: Match[];
  streamingData: StreamingData;
};

export default function StreamingManager({ matches, streamingData }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // リーグごとにグループ化
  const matchesByLeague = matches.reduce((acc, match) => {
    if (!acc[match.leagueName]) {
      acc[match.leagueName] = [];
    }
    acc[match.leagueName].push(match);
    return acc;
  }, {} as Record<string, Match[]>);

  // 試合の初期選択状態を取得
  const getInitialChecked = (matchId: number, serviceId: string) => {
    const matchIdStr = String(matchId);
    const service = serviceId as StreamingService;
    // まずmatchIdで個別設定を確認
    if (streamingData.byMatchId[matchIdStr]) {
      return streamingData.byMatchId[matchIdStr].includes(service);
    }
    // なければリーグのデフォルトを使用
    const match = matches.find(m => m.matchId === matchId);
    if (match && streamingData.byLeague[match.leagueName]) {
      return streamingData.byLeague[match.leagueName].includes(service);
    }
    return false;
  };

  const handleSubmit = async (formData: FormData) => {
    setSaving(true);
    setSaved(false);
    await saveStreamingData(formData);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <form action={handleSubmit}>
      <div className="space-y-8">
        {Object.entries(matchesByLeague).map(([leagueName, leagueMatches]) => (
          <div key={leagueName}>
            <h2 className="text-lg font-bold mb-3 pb-2 border-b">
              {leagueName}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                (デフォルト: {streamingData.byLeague[leagueName]?.join(', ') || 'なし'})
              </span>
            </h2>
            <div className="space-y-3">
              {leagueMatches.map(match => (
                <div key={match.matchId} className="p-3 border rounded-lg">
                  <input type="hidden" name={`league_${match.matchId}`} value={match.leagueName} />
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">
                        {match.home} vs {match.away}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {match.matchDate} {match.matchTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {STREAMING_OPTIONS.map(option => (
                      <label key={option.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name={`match_${match.matchId}`}
                          value={option.id}
                          defaultChecked={getInitialChecked(match.matchId, option.id)}
                          className="rounded"
                        />
                        <span className="text-sm">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="sticky bottom-4 flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary text-primary-foreground rounded-md p-3 font-medium disabled:opacity-50"
          >
            {saving ? '保存中...' : '設定を保存'}
          </button>
          {saved && (
            <span className="self-center text-green-600 font-medium">
              保存しました
            </span>
          )}
        </div>
      </div>
    </form>
  );
}

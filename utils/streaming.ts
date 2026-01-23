import { StreamingService, StreamingData } from '@/types/streaming';
import streamingData from '@/data/streaming-data.json';

export const STREAMING_LABELS: Record<StreamingService, string> = {
  'dazn': 'DAZN',
  'unext': 'U-NEXT',
  'wowow': 'WOWOW'
};

export const STREAMING_COLORS: Record<StreamingService, string> = {
  'dazn': 'bg-foreground text-background',
  'unext': 'bg-green-700 text-white',
  'wowow': 'bg-blue-600 text-white'
};

export const STREAMING_OPTIONS = Object.entries(STREAMING_LABELS).map(
  ([id, label]) => ({ id, label })
);

export const streamingDataTyped = streamingData as StreamingData;

export function getStreamingServices(
  matchId: number,
  leagueName: string
): StreamingService[] {
  if (streamingDataTyped.byMatchId[String(matchId)]) {
    return streamingDataTyped.byMatchId[String(matchId)];
  }
  if (streamingDataTyped.byLeague[leagueName]) {
    return streamingDataTyped.byLeague[leagueName];
  }
  return [];
}

export function getLeagueDefault(leagueName: string): StreamingService[] {
  return streamingDataTyped.byLeague[leagueName] || [];
}

export function isDifferentFromDefault(matchId: number, leagueName: string): boolean {
  const services = getStreamingServices(matchId, leagueName);
  const leagueDefault = getLeagueDefault(leagueName);
  return services.length !== leagueDefault.length ||
    !services.every(s => leagueDefault.includes(s));
}

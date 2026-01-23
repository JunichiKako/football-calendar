export type StreamingService = 'dazn' | 'unext' | 'wowow';

export type StreamingData = {
  byMatchId: Record<string, StreamingService[]>;
  byLeague: Record<string, StreamingService[]>;
};
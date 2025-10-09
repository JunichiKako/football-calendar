export type StreamingService = 'dazn' | 'unext' | 'wowow';

export const STREAMING_LABELS: Record<StreamingService, string> = {
  'dazn': 'DAZN',
  'unext': 'U-NEXT', 
  'wowow': 'WOWOW'
};

export const STREAMING_OPTIONS = Object.entries(STREAMING_LABELS).map(
  ([id, label]) => ({ id, label })
);
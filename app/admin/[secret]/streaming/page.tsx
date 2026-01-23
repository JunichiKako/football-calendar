import { notFound } from 'next/navigation';
import { getLeagueMatchesByTime } from '@/data/league';
import streamingData from '@/data/streaming-data.json';
import { StreamingData } from '@/types/streaming';
import StreamingManager from './streaming-manager';

export const dynamic = 'force-dynamic';

export default async function AdminStreamingPage({
  params
}: {
  params: Promise<{ secret: string }>
}) {
  const { secret } = await params;

  if (secret !== process.env.ADMIN_SECRET_PATH) {
    notFound();
  }

  const matches = await getLeagueMatchesByTime();

  return (
    <div className="container mx-auto p-6 pb-20">
      <h1 className="text-2xl font-bold mb-2">配信設定管理</h1>
      <p className="text-muted-foreground mb-6">
        各試合の配信サービスを選択してください（{matches.length}試合）
      </p>
      <StreamingManager
        matches={matches}
        streamingData={streamingData as StreamingData}
      />
    </div>
  );
}
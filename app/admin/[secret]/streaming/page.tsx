import { notFound } from 'next/navigation';
import { getLeagueMatchesByTime } from '@/data/league';
import StreamingManager from './streaming-manager';
import { createClient } from '@/lib/supabase/server';

export default async function AdminStreamingPage({ 
  params 
}: { 
  params: Promise<{ secret: string }> 
}) {
  // paramsをawaitで取得
  const { secret } = await params;
  
  // シークレットパスの検証
  if (secret !== process.env.ADMIN_SECRET_PATH) {
    notFound();
  }
  
  const supabase = await createClient();
  
  // 試合データと既存の配信設定を取得
  const [matches, { data: existingData }] = await Promise.all([
    getLeagueMatchesByTime(),
    supabase.from('match_streaming').select('match_id, streaming_services')
  ]);
  
  // 既存データをMapに変換
  const existingSelections: Record<number, string[]> = {};
  existingData?.forEach(item => {
    existingSelections[item.match_id] = item.streaming_services || [];
  });
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">配信設定管理</h1>
      <p className="text-muted-foreground mb-4">
        各試合の配信サービスを選択してください
      </p>
      <StreamingManager 
        matches={matches} 
        initialSelections={existingSelections}
      />
    </div>
  );
}
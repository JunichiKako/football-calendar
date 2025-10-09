'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function saveStreamingData(formData: FormData) {
  const supabase = await createClient();
  
  // FormDataから配信設定を抽出
  const streamingData: Record<number, string[]> = {};
  
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('match_')) {
      const matchId = Number(key.replace('match_', ''));
      if (!streamingData[matchId]) {
        streamingData[matchId] = [];
      }
      streamingData[matchId].push(value as string);
    }
  }
  
  try {
    // すべてのデータを削除してから挿入
    const dataToInsert = Object.entries(streamingData).map(([matchId, services]) => ({
      match_id: Number(matchId),
      streaming_services: services
    }));
    
    if (dataToInsert.length > 0) {
      // 既存データを削除
      const matchIds = dataToInsert.map(d => d.match_id);
      await supabase
        .from('match_streaming')
        .delete()
        .in('match_id', matchIds);
      
      // 新規挿入
      const { error } = await supabase
        .from('match_streaming')
        .insert(dataToInsert);
      
      if (error) throw error;
    }
    
    revalidatePath('/');
  } catch (error) {
    console.error('Save error:', error);
  }
  
  // 同じページにリダイレクト（成功メッセージは後で実装可能）
  redirect(formData.get('redirect_url') as string || '/');
}
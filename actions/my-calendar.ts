'use server';

import { currentUser } from '@/data/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function saveMatchSelections(formData: FormData) {
  const submittedMatches = formData.getAll('matches') as string[];
  if (submittedMatches.length === 0) {
    return { error: '少なくとも1つのマッチを選択してください。' };
  }

  const supabase = await createClient();
  const user = await currentUser();

  if (!user) {
    throw new Error('再度ログインしてください');
  }

  try {
    // ユーザーが以前選択したマッチを取得
    const { data: existingMatches } = await supabase
      .from('user_matches')
      .select('match_id')
      .eq('user_id', user.id);

    // 既存の選択と新しい選択を結合（重複を除去）
    const existingMatchIds =
      existingMatches?.map((match) => match.match_id) || [];
    const allMatchIds = [...existingMatchIds, ...submittedMatches].filter(
      (id, index, self) => self.indexOf(id) === index
    );

    // 新しい選択を挿入（UPSERTで重複を処理）
    const matchesToInsert = allMatchIds.map((matchId) => ({
      user_id: user.id,
      match_id: matchId,
    }));

    const { error: insertError } = await supabase
      .from('user_matches')
      .upsert(matchesToInsert, {
        onConflict: 'user_id,match_id',
        ignoreDuplicates: true,
      });

    if (insertError) throw insertError;

    redirect(`/?view=calendar&selectedMatches=${submittedMatches.join(',')}`);
  } catch (error) {
    throw error;
  }
}

export async function removeMatchSelections(matchId: string) {
  const supabase = await createClient();
  const user = await currentUser();

  if (!user) {
    throw new Error('再度ログインしてください');
  }

  try {
    // 特定のマッチを削除
    const { error: deleteError } = await supabase
      .from('user_matches')
      .delete()
      .eq('user_id', user.id)
      .eq('match_id', matchId);

    if (deleteError) throw deleteError;

    // 残りの選択を取得
    const { data: remainingMatches } = await supabase
      .from('user_matches')
      .select('match_id')
      .eq('user_id', user.id);

    const remainingMatchIds =
      remainingMatches?.map((match) => match.match_id) || [];

    redirect(`/?view=calendar&selectedMatches=${remainingMatchIds.join(',')}`);
  } catch (error) {
    throw error;
  }
}

'use server';

import { currentUser } from '@/data/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function saveMatchSelections(FormData: FormData) {
  // FormDataから選択されたマッチを取得
  const submittedMatches = FormData.getAll('matches') as string[];
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
    const { data: existing } = await supabase
      .from('match_selections')
      .select()
      .eq('user_id', user.id)
      .maybeSingle();

    // match_idsが存在することを確認し、なければ空配列を使用
    const existingMatchIds = existing?.match_ids || [];

    //DBにある配列と新しく選択されたマッチを結合し、重複を削除
    const allMatchIds = [...existingMatchIds, ...submittedMatches].filter(
      (id, index, self) => self.indexOf(id) === index
    );

    // 以前の選択があれば更新、なければ新規追加
    if (existing) {
      await supabase
        .from('match_selections')
        .update({ match_ids: allMatchIds })
        .eq('user_id', user.id);
    } else {
      await supabase.from('match_selections').insert({
        user_id: user.id,
        match_ids: allMatchIds,
      });
    }
    // カレンダーviewにリダイレクト
    redirect(`/?view=calendar&selectedMatches=${submittedMatches.join(',')}`);
  } catch (error) {
    throw error;
  }
}

export async function removeMatchSelections(matchIds: string) {
  const supabase = await createClient();

  const user = await currentUser();

  if (!user) {
    throw new Error('再度ログインしてください');
  }

  try {
    const { data: existing } = await supabase
      .from('match_selections')
      .select('match_ids')
      .eq('user_id', user.id)
      .single();

    if (!existing) {
      throw new Error('選択された試合が見つかりません');
    }

    // 一つのif文にまとめる（matchIdsのチェックも含む）
    if (!existing || !existing.match_ids) {
      throw new Error('選択された試合が見つかりません');
    }

    // オプショナルチェーンは不要（上でチェック済み）
    const updatedMatchIds = existing.match_ids.filter((id) => id !== matchIds);

    const { error } = await supabase
      .from('match_selections')
      .update({ match_ids: updatedMatchIds })
      .eq('user_id', user.id);

    if (error) throw error;

    redirect(`/?view=calendar&selectedMatches=${updatedMatchIds.join(',')}`);
  } catch (error) {
    throw error;
  }
}

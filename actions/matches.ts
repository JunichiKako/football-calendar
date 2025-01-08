'use server';

import { currentUser } from '@/data/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function saveMatchSelections(newMatchIds: string[]) {
  const supabase = await createClient();

  const user = await currentUser();

  if (!user) {
    throw new Error('ログインしてください');
  }

  try {
    const { data: existing } = await supabase
      .from('match_selections')
      .select()
      .eq('user_id', user.id)
      .maybeSingle();

    // match_idsが存在することを確認し、なければ空配列を使用
    const existingMatchIds = existing?.match_ids || [];

    // 重複を除去して新しい配列を作成
    const allMatchIds = [...existingMatchIds, ...newMatchIds].filter(
      (id, index, self) => self.indexOf(id) === index
    );

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

    redirect(`/?view=calendar&selectedMatches=${newMatchIds.join(',')}`);
  } catch (error) {
    throw error;
  }
}

export async function removeMatchSelections(matchIds: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('ログインしてください');
  }

  try {
    const { data: existing } = await supabase
      .from('match_selections')
      .select('match_ids')
      .eq('clerk_id', user.id)
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
      .eq('clerk_id', user.id);

    if (error) throw error;

    redirect(`/?view=calendar&selectedMatches=${updatedMatchIds.join(',')}`);
  } catch (error) {
    console.error('Error removing match:', error);
    throw error;
  }
}

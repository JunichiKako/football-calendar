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

    // filterメソッドの中で使用されるパラメータの型を明示的に定義
    const allMatchIds = existing
      ? existing.match_ids
          .concat(newMatchIds)
          .filter(
            (id: string, index: number, self: string[]) =>
              self.indexOf(id) === index
          )
      : newMatchIds;

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

    // 削除処理でのfilterメソッドでも型を明示的に定義
    const updatedMatchIds = existing.match_ids.filter(
      (id: string) => id !== matchIds
    );

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

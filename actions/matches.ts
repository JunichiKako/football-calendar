// app/actions/matches.ts
"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/clerk";
import { currentUser } from "@clerk/nextjs/server";

export async function saveMatchSelections(matchIds: string[]) {
  const supabase = await createClerkSupabaseClient();
  const user = await currentUser();

  if (!user) {
    throw new Error("ログインしてください");
  }

  const { error } = await supabase.from("match_selections").upsert({
    user_id: user.id,
    match_ids: matchIds,
  });
  if (error) throw error;
}

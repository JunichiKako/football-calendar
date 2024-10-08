"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/clerk";
import { currentUser } from "@clerk/nextjs/server";

export const createProfile = async (name: string) => {
  const supabase = await createClerkSupabaseClient();

  const user = await currentUser();

  if(!user){
    throw new Error('ログインしてください')
  }

  const clerk_id = user.id

  const { error } = await supabase.from("users").insert([
    {
      clerk_id
    },
  ]);
  
};

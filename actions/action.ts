"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/clerk";
import { currentUser } from "@clerk/nextjs/server";

export const createProfile = async (name: string) => {
  const supabase = await createClerkSupabaseClient();

  const user = await currentUser();

  if(!user){
    throw new Error('ログインしてください')
  }

  const user_id = user.id

  const { error } = await supabase.from("users").insert([
    {
      name,
      user_id
    },
  ]);
  console.log();
  
};

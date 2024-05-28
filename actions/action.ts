"use server";

import { createClerkSupabaseClient } from "@/lib/supabase/clerk";

export const createProfile = async (name: string) => {
  const supabase = await createClerkSupabaseClient();

  const { error } = await supabase.from("user").insert([
    {
      name,
    },
  ]);

  console.log("action", error);
};

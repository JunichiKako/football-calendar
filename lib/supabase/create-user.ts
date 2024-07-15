// /lib/saveUserToSupabase.js

import { auth, currentUser } from "@clerk/nextjs/server";
import { createClerkSupabaseClient } from "./clerk";


export async function saveUserToSupabase() {
  try {
    console.log("saveUserToSupabase called");
    const { userId } = auth();
    console.log("auth userId:", userId);

    if (!userId) {
      throw new Error("ユーザーがログインしていません");
    }

    const user = await currentUser();
    console.log("currentUser:", user);
    const fullName = user?.fullName || user?.firstName || "No Name";

    const supabase = await createClerkSupabaseClient();
    console.log("Supabase client created");

    const { data: existingUser, error: fetchError } = await supabase
      .from("user")
      .select("*")
      .eq("user_id", userId)
      .single();
    console.log("Existing user:", existingUser, "Fetch error:", fetchError);

    if (fetchError && fetchError.code !== "PGRST116") {
      throw fetchError;
    }

    if (!existingUser) {
      const { error } = await supabase.from("user").insert([{ user_id: userId, name: fullName }]);
      console.log("Insert error:", error);

      if (error) {
        throw error;
      }
      console.log("User inserted successfully");
    } else {
      console.log("User already exists");
    }
  } catch (error) {
    console.error("Error in saveUserToSupabase:", error);
  }
}

import { auth } from "@clerk/nextjs/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Supabaseクライアントの作成
export async function createClerkSupabaseClient() {
  const cookieStore = cookies();
  const { getToken } = auth();

  const token = await getToken({ template: "football-table" });
  const authToken = token ? { Authorization: `Bearer ${token}` } : null;

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { "Cache-Control": "no-store", ...authToken } },
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string) {
          try {
            cookieStore.set({ name, value });
          } catch (error) {
            // エラーハンドリング
          }
        },
        remove(name: string) {
          try {
            cookieStore.set({ name, value: "" });
          } catch (error) {
            // エラーハンドリング
          }
        },
      },
    }
  );
}

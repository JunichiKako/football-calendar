// app/calendar/page.tsx
import { getLeagueByGroup } from "@/data/league";
import { type CalendarEvent } from "@/components/ui/my-ui/calendar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk";
import CalendarView from "./components/calendar-view";


export default async function Page({
  searchParams,
}: {
  searchParams: { matchIds?: string };
}) {
  const user = await currentUser();
  const supabase = await createClerkSupabaseClient();

  if (!user) {
    redirect("/sign-in");
  }

  // DBから保存済みの全ての試合IDを取得
  const { data: savedSelections } = await supabase
    .from("match_selections")
    .select("match_ids")
    .eq("clerk_id", user.id)
    .single();

  // グループ化されたリーグデータを取得
  const groupedLeagues = await getLeagueByGroup();

  // 保存された全ての試合IDを使用
  const allMatchIds = savedSelections?.match_ids || [];

  // 試合をフィルタリング
  const selectedMatches = Object.values(groupedLeagues)
    .flatMap((league) => league.matches)
    .filter((match) => allMatchIds.includes(match.matchId.toString()));

  // カレンダーイベント形式に変換
  const calendarEvents: CalendarEvent[] = selectedMatches.map((match) => ({
    id: match.matchId.toString(),
    title: `${match.home} vs ${match.away}`,
    start: new Date(match.utcDate),
    end: new Date(new Date(match.utcDate).getTime() + 120 * 60 * 1000),
    leagueName: match.leagueName,  // リーグ名を追加
  }));


  return <CalendarView events={calendarEvents} />;
}

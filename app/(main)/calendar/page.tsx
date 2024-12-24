// app/calendar/page.tsx
import { getLeagueByGroup } from "@/data/league";
import { type CalendarEvent } from "@/components/ui/my-ui/calendar";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createClerkSupabaseClient } from "@/lib/supabase/clerk";
import CalendarView from "./components/calendar-view";

// app/calendar/page.tsx
export default async function Page({
  searchParams,
}: {
  searchParams: { selectedMatches?: string }; // matchIdsからselectedMatchesに変更
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

  const groupedLeagues = await getLeagueByGroup();

  // URLパラメータまたはDB保存データを使用
  const matchIds =
    searchParams.selectedMatches?.split(",") ||
    savedSelections?.match_ids ||
    [];

  const selectedMatches = Object.values(groupedLeagues)
    .flatMap((league) => league.matches)
    .filter((match) => matchIds.includes(match.matchId.toString()));

  const calendarEvents: CalendarEvent[] = selectedMatches.map((match) => ({
    id: match.matchId.toString(),
    title: `${match.home} vs ${match.away}`,
    start: new Date(match.utcDate),
    end: new Date(new Date(match.utcDate).getTime() + 120 * 60 * 1000),
    leagueName: match.leagueName,
  }));

  return <CalendarView events={calendarEvents} />;
}

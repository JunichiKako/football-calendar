"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function LeagueToggle() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "league";
  const currentLeagues = searchParams.get("leagues") || "";


  return (
    <div className="grid grid-cols-2 gap-2">
      <Button
        variant={currentView !== "league" ? "outline" : "default"}
        asChild
      >
        <Link
          href={`?view=league&leagues=${currentLeagues}`}
          className={cn(currentView !== "league" && "opacity-50")}
        >
          リーグ別
        </Link>
      </Button>
      <Button variant={currentView !== "time" ? "outline" : "default"} asChild>
        <Link
          href={`?view=time&leagues=${currentLeagues}`}
          className={cn(currentView !== "time" && "opacity-50")}
        >
          試合時間順
        </Link>
      </Button>
    </div>
  );
}

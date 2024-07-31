"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ChangeBtn() {
  const pathname = usePathname();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button variant={pathname !== "/" ? "outline" : "default"} asChild>
        <Link href="/" className={cn(pathname !== "/" && "opacity-50")}>
          リーグ別
        </Link>
      </Button>
      <Button variant={pathname !== "/time" ? "outline" : "default"} asChild>
        <Link href="/time" className={cn(pathname !== "/time" && "opacity-50")}>
          試合時間順
        </Link>
      </Button>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import { usePathname } from "next/navigation";

export default function ChangeBtn() {
  const pathname = usePathname();

  return (
    <div className="my-auto text-center">
      <Button asChild>
        {pathname === "/time" ? (
          <Link href="/">リーグ別に表示</Link>
        ) : (
          <Link href="/time">試合時間順で表示</Link>
        )}
      </Button>
    </div>
  );
}

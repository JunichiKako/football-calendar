import { Button } from "@/components/ui/button";
import { getLeagueByGroup } from "@/data/league";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { Calendar } from "lucide-react";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default async function Header() {
  const leagueByGroup = await getLeagueByGroup();
  const user = await currentUser();
  const imageUrl = user?.imageUrl;

  return (
    <header className="sticky gap-4 top-0 z-50 h-14 flex items-center px-4 border-b bg-[#4BCBEE] dark:bg-[#050401]">
      <MobileNav leagueByGroup={leagueByGroup} />
      <Button variant="ghost" className="-ml-2 text-lg" asChild>
        <Link href="/?view=league" className="ms-2 font-semibold text-white">
          Football Table
        </Link>
      </Button>
      <span className="flex-1"></span>
      <SignedIn>
        <Button variant="ghost" className="text-white" asChild>
          <Link href="/calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            カレンダーを見る
          </Link>
        </Button>
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <Button variant="ghost" className="text-white">
            ログイン
          </Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserMenu imageUrl={imageUrl} />
      </SignedIn>
      <ModeToggle />
    </header>
  );
}
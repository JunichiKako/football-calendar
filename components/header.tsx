import { Button } from "@/components/ui/button";
import { getLeagueByGroup } from "@/data/league";
import { SignInButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import { ModeToggle } from "./mode-toggle";
import UserMenu from "./user-menu";

export default async function Header() {
  const leagueByGroup = await getLeagueByGroup();

  const user = await currentUser();
  const imageUrl = user?.imageUrl;

  return (
    <header className="fixed top-0 z-50 w-full py-3 px-2 border-b bg-[#4BCBEE] ">
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(87,138,255,1)]"></div>
      <div className="relative z-10 lg:px-5 lg:pl-3">
        <div className="flex items-center">
          <MobileNav leagueByGroup={leagueByGroup} />
          <Button variant="ghost" asChild>
            <Link href="/" className="ms-2 text-xl font-semibold sm:text-2xl text-white">
              Football Table
            </Link>
          </Button>
          <span className="flex-1"></span>
          <SignedOut>
            <SignInButton>
              <Button variant="ghost" className="text-background">
                ログイン
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="mt-1.5">
              <UserMenu imageUrl={imageUrl} />
            </div>
          </SignedIn>
          <div className="ml-6">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

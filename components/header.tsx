import { Button } from "@/components/ui/button";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import { SignInButton, SignOutButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { getCompetionByGroup } from "@/data/competitions";

export default async function Header() {
  const competitionByGroup = await getCompetionByGroup();

  return (
    <header className="fixed top-0 z-50 w-full py-1.5 lg:py-3 px-2 border-b border bg-[auto_auto] bg-[#4BCBEE] ">
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(87,138,255,1)]"></div>
      <div className="relative z-10 lg:px-5 lg:pl-3">
        <div className="flex items-center">
          <MobileNav competitionByGroup={competitionByGroup} />
          <Button variant="ghost" asChild>
            <Link href="/" className="ms-2 text-xl font-semibold sm:text-2xl text-white">
              Football Table
            </Link>
          </Button>
          <span className="flex-1"></span>
          <SignedOut>
            <SignInButton>
              <Button>ログイン</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <SignOutButton redirectUrl="/">
              <Button>ログアウト</Button>
            </SignOutButton>

            <Button asChild>
              {/* aタグを使っている理由は？ targetのため？ */}
              <a target="_blank" href="https://sweet-finch-67.accounts.dev/user?redirect_url=/">
                アカウントポータル
              </a>
            </Button>
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

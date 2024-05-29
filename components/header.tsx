import { Button } from "@/components/ui/button";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import {
  SignInButton,
  SignOutButton,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/nextjs";
import { getCompetionByGroup } from "@/data/competitions";
import UserMenu from "./user-menu";
import { ModeToggle } from "./mode-toggle";
import { currentUser } from "@clerk/nextjs/server";

export default async function Header() {
  const competitionByGroup = await getCompetionByGroup();

  const user = await currentUser();
  const imageUrl = user?.imageUrl;

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
              <Button variant="ghost" className="text-background">
                Login
              </Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <div className="mr-2">

            </div>
            <div className="mt-1.5">
              <UserMenu imageUrl={imageUrl} />
            </div>
          </SignedIn>
          <div className="ml-16">
            <ModeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}

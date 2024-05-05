import { Button } from "@/components/ui/button";
import Link from "next/link";
import MobileNav from "./mobile-nav";
import UserMenu from "./user-menu";

export default function Header() {
    return (
        <header className="fixed top-0 z-50 w-full border-b  border bg-[auto_auto] bg-[rgba(87,138,255,1)] bg-[repeating-linear-gradient(45deg,transparent,transparent_25px,rgba(101,120,255,1)_25px,rgba(101,120,255,1)_56px_)] ">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(87,138,255,1)]"></div>
            <div className="relative z-10 px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center">
                    <MobileNav />
                    <Button variant="ghost" asChild>
                        <Link
                            href="/"
                            className="ms-2 md:me-24 text-xl font-semibold sm:text-2xl  text-white"
                        >
                            Football Table
                        </Link>
                    </Button>
                    <span className="flex-1"></span>
                    <UserMenu />
                </div>
            </div>
        </header>
    );
}

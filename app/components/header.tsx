import { MenuIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
    return (
        <header className="fixed top-0 z-50 w-full border-b  border bg-[auto_auto] bg-[rgba(87,138,255,1)] bg-[repeating-linear-gradient(45deg,transparent,transparent_25px,rgba(101,120,255,1)_25px,rgba(101,120,255,1)_56px_)] ">
            <div className="absolute inset-0 bg-gradient-to-b from-[rgba(87,138,255,1)]"></div>
            <div className="relative z-10 px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start">
                        <MenuIcon className="w-8 h-8 cursor-pointer mr-4" />
                        <Link
                            href="/"
                            className="flex ms-2 md:me-24 text-xl font-semibold sm:text-2xl whitespace-nowrap text-white"
                        >
                            Football Table
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center ms-3">
                            <Link
                                href={"/"}
                                className="flex text-sm  rounded-full focus:ring-4 focus:ring-gray-300 "
                            >
                                <Image
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full mr-5"
                                    src={"/user-logo.png"}
                                    alt="user photo"
                                />
                            </Link>
                        </div>
                        <ModeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
}

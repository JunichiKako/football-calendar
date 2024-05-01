import Image from "next/image";
import Link from "next/link";

export default function Header() {
    return (
        <header className="fixed top-0 z-50 w-full bg-white border-b border-gray-200">
            <div className="px-3 py-3 lg:px-5 lg:pl-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-start rtl:justify-end">
                        <Link href="/" className="flex ms-2 md:me-24">
                            <span className="self-center text-xl font-semibold sm:text-2xl whitespace-nowrap ">
                                Football Table
                            </span>
                        </Link>
                    </div>
                    <div className="flex items-center">
                        <div className="flex items-center ms-3">
                            <Link
                                href={"/"}
                                className="flex text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 "
                            >
                                <Image
                                    width={32}
                                    height={32}
                                    className="w-8 h-8 rounded-full"
                                    src={"/user-logo.png"}
                                    alt="user photo"
                                />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}

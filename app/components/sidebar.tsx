import Link from "next/link";
import { dummyNavList } from "@/data/dummy-navlist";
import Image from "next/image";

export default function Sidebar() {
    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full bg-white border-r border-gray-200 sm:translate-x-0">
            <div className="h-full px-3 pb-4 overflow-y-auto bg-white">
                <ul className="mt-4 font-medium grid grid-cols-2 gap-3">
                    {dummyNavList.map((item) => (
                        <li key={item.title}>
                            <Link
                                href={item.url}
                                className="flex items-center p-2 text-gray-900 rounded-lg hover:bg-gray-100"
                            >
                                <Image
                                    src={item.img}
                                    width={100}
                                    height={100}
                                    alt=""
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </aside>
    );
}

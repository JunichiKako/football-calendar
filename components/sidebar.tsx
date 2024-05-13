import { Button } from "@/components/ui/button";
import { dummyNavList } from "@/data/dummy-navlist";
import Image from "next/image";
import Link from "next/link";

export default function Sidebar() {
    return (
        <aside className="fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform -translate-x-full border-r border lg:translate-x-0">
            <div className="flex flex-col h-full px-3 pb-4 overflow-y-auto">
                <ul className="flex-1 font-medium flex flex-col">
                    {dummyNavList.map((item) => (
                        <li key={item.title}>
                            <Link
                                href={item.url}
                                className="flex items-center p-2 rounded-lg hover:bg-gray-200 hover:text-gray-900 transition-colors"
                            >
                                <div className="flex">
                                    <Image
                                        src={item.img}
                                        width={40}
                                        height={40}
                                        className="object-cover"
                                        alt=""
                                    />
                                    <span className="ml-4">{item.title}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
                <div className="mt-auto">
                    <Button asChild>
                        <Link href={"/"}>チームから選ぶ</Link>
                    </Button>
                </div>
            </div>
        </aside>
    );
}

import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { dummyNavList } from "@/data/dummy-navlist";
import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function MobileNav() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size="icon" className="lg:hidden" variant="outline">
                    <Menu size={20} />
                </Button>
            </SheetTrigger>
            <SheetContent side="left">
                <SheetHeader>
                    <SheetTitle>リーグを選ぶ</SheetTitle>
                </SheetHeader>
                <nav className="mt-10">
                    <ul>
                        {dummyNavList.map((item) => (
                            <li key={item.title}>
                                <Link
                                    href={item.url}
                                    className="flex items-center py-4 px-2 rounded-lg hover:bg-gray-100"
                                >
                                    <div className="flex">
                                        <Image
                                            src={item.img}
                                            width={40}
                                            height={40}
                                            className="object-cover"
                                            alt=""
                                        />
                                        <span className="ml-4">
                                            {item.title}
                                        </span>
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </SheetContent>
        </Sheet>
    );
}

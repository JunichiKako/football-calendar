import { ChevronLeft, ChevronRight } from "lucide-react";
import MatchList from "./components/match-list";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
    return (
        <>
            <div className="sticky top-12 bg-card md:px-4 lg:block lg:ml-64 ">
                <div className="pt-4 py-4 flex items-center justify-between w-full4 mt-18 lg:mt-20 lg:justify-around lg:pt-8">
                    <Button variant="ghost" asChild>
                        <Link
                            href={"/"}
                            className="flex items-center text-sm sm:text-base lg:text-xl lg:gap-4"
                        >
                            <ChevronLeft className="h-4 w-4" />
                            05/06
                        </Link>
                    </Button>
                    <p className="font-semibold border-b-2 text-xl lg:text-xl ">
                        05/07(土)
                    </p>
                    <Button variant="ghost" asChild>
                        <Link
                            href={"/"}
                            className="flex items-center text-sm sm:text-base lg:text-xl lg:gap-4"
                        >
                            05/08 <ChevronRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="lg:ml-64 lg:text-center">
                スケジュールを見たいリーグをサイドバーから選んでください
            </div>
            <MatchList />
        </>
    );
}

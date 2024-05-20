import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function SchduleHeader() {
  return (
    <div className="sticky top-12  bg-card md:px-4 lg:block lg:ml-64 ">
      <div className="pt-2 py-2 flex items-center justify-between w-full4 mt-18 lg:mt-16 lg:justify-around lg:pt-8">
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center text-sm sm:text-base lg:text-xl lg:gap-4">
            <ChevronLeft className="h-4 w-4" size="icon" />
            5/6(金)
          </Link>
        </Button>
        <p className="font-semibold border-b-2 text-xl lg:text-xl ">05/07(土)</p>
        <Button variant="ghost" asChild>
          <Link href="/" className="flex items-center text-sm sm:text-base lg:text-xl lg:gap-4">
            05/08 <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

import { ChevronRight } from "lucide-react";
import MatchList from "./components/match-list";
import MatchNav from "./components/match-nav";

export default function Home() {
    return (
        <div className="mt-12 p-8 lg:ml-64">
            <p className="text-2xl font-semibold flex items-center">
                2024.05.06 Weeks
                <span className="ml-4 inline-block">
                    <ChevronRight />
                </span>
            </p>
            <MatchNav />
            <MatchList />
        </div>
    );
}

import Image from "next/image";
import MatchCard from "./match-card";
import SpMatchcard from "./sp-matchcard";
import { dummyMatchList } from "@/data/dummy-matchlist";

export default function MatchList() {
    return (
        <>
            <div className="px-3">
                <div className="hidden lg:ml-64 lg:grid grid-cols-3 gap-4 lg:gap-6 px-3 lg:px-8 mt-12">
                    {dummyMatchList.map((league) => {
                        return (
                            <div
                                key={league.id}
                                className="flex flex-col items-center"
                            >
                                <Image
                                    src={league.img}
                                    width={100}
                                    height={60}
                                    alt=""
                                />
                                <MatchCard
                                    date={league.date}
                                    matches={league.matches}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className="px-3 mt-12">
                    {dummyMatchList.map((league) => (
                        <div key={league.id} className="lg:hidden mt-6">
                            <div className="flex items-end justify-between">
                                <Image
                                    src={league.img}
                                    width={80}
                                    height={40}
                                    alt={league.league}
                                />
                            </div>
                            <SpMatchcard matches={league.matches} />
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}
